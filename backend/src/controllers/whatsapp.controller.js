const config = require('../config');
const { prisma } = require('../config/database');
const claudeService = require('../services/claude.service');
const twilioService = require('../services/twilio.service');
const { emitToStore } = require('../socket');
const logger = require('../config/logger');

async function handleInbound(req, res) {
  try {
    if (config.env === 'production') {
      const isValid = twilioService.validateTwilioSignature(
        req.originalUrl,
        req.body,
        req.headers['x-twilio-signature']
      );
      if (!isValid) {
        logger.warn('Invalid Twilio webhook signature');
        return res.status(403).send('Invalid signature');
      }
    }

    const { From, Body, WaId, To } = req.body;
    const customerPhone = From.replace('whatsapp:', '');
    const storePhone = To.replace('whatsapp:', '');

    const store = await prisma.store.findFirst({
      where: {
        OR: [
          { twilioWhatsappNumber: storePhone },
          { phone: storePhone },
        ],
      },
    });
    if (!store) {
      logger.warn(`Unknown store phone: ${storePhone}`);
      return res.status(200).send('<Response></Response>');
    }

    let customer = await prisma.customer.findFirst({
      where: { storeId: store.id, phone: customerPhone },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          storeId: store.id,
          phone: customerPhone,
          name: null,
        },
      });
    }

    let session = await prisma.whatsAppSession.findFirst({
      where: { storeId: store.id, customerPhone },
      orderBy: { updatedAt: 'desc' },
    });

    const messageText = Body || '';
    const sessionState = session?.sessionState || 'IDLE';

    if (sessionState === 'IDLE' || !session) {
      session = await createOrUpdateSession(store.id, customerPhone, 'GREETING', {});

      const menuMessage = `🏪 *${store.storeName}* 🏪

Namaste! 🙏 Main aapka order lene mein madad kar sakta hoon.

Kripya apna order is tarah bataen:
"2 kg atta, 1 litre tata namak, 6 ande"

Ya mujhe bas bataen ki aapko kya chahiye! 😊

*Reply "menu" to see popular items*`;

      await twilioService.sendWhatsAppMessage(customerPhone, menuMessage);
      return res.status(200).send('<Response></Response>');
    }

    if (messageText.toLowerCase() === 'menu') {
      return sendMenu(store.id, customerPhone);
    }

    if (sessionState === 'GREETING' || sessionState === 'COLLECTING_ITEMS') {
      const existingItems = session.sessionData?.items || [];
      const parsed = await claudeService.parseWhatsAppOrder(messageText, store.languagePreference);

      if (parsed.needsClarification) {
        await twilioService.sendWhatsAppMessage(
          customerPhone,
          parsed.clarificationQuestion || 'Maaf karen, kripya dobara bataen. Jaise: "2 kg atta, 1 litre tel"'
        );
        return res.status(200).send('<Response></Response>');
      }

      const allItems = [...existingItems];
      for (const newItem of parsed.items) {
        const existing = allItems.find(
          (i) => i.name.toLowerCase() === newItem.name.toLowerCase()
        );
        if (existing) {
          existing.qty += newItem.qty;
        } else {
          allItems.push(newItem);
        }
      }

      await createOrUpdateSession(store.id, customerPhone, 'COLLECTING_ITEMS', {
        items: allItems,
      });

      const itemSummary = allItems.map((i) => `• ${i.qty} ${i.unit || ''} ${i.name}`).join('\n');

      if (parsed.isOrderComplete) {
        const confirmMessage =
          `📋 *Aapka Order*\n\n${itemSummary}\n\nKya yeh sahi hai?\n\n1️⃣ *Confirm* — Order de den\n2️⃣ *Edit* — Aur saman jodna hai\n3️⃣ *Cancel* — Order radd karen\n\nReply with 1, 2, or 3.`;

        await createOrUpdateSession(store.id, customerPhone, 'CONFIRMING', {
          items: allItems,
        });

        await twilioService.sendWhatsAppMessage(customerPhone, confirmMessage);
      } else {
        const moreMessage = `Maine yeh saman note kiya:\n\n${itemSummary}\n\nAur kya chahiye? Kuch aur bataen ya "bas itna" bolein.`;
        await twilioService.sendWhatsAppMessage(customerPhone, moreMessage);
      }

      return res.status(200).send('<Response></Response>');
    }

    if (sessionState === 'CONFIRMING') {
      if (messageText === '1' || messageText.toLowerCase() === 'confirm') {
        const items = session.sessionData?.items || [];

        const orderNumber = `KF-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

        const order = await prisma.order.create({
          data: {
            orderNumber,
            storeId: store.id,
            customerId: customer.id,
            status: 'pending',
            source: 'whatsapp',
            items,
            subtotal: 0,
            totalAmount: 0,
            paymentMethod: 'cod',
          },
        });

        await createOrUpdateSession(store.id, customerPhone, 'DONE', { items: [] });

        await prisma.customer.update({
          where: { id: customer.id },
          data: { orderCount: { increment: 1 }, lastOrderAt: new Date() },
        });

        const confirmMsg =
          `✅ *Order Confirmed!*\n\nOrder No: ${orderNumber}\n\nAapka order ${store.storeName} ko bhej diya gaya hai. Jab deliver ho jayega to aapko update milega.\n\nDhanyavaad! 🙏😊`;

        await twilioService.sendWhatsAppMessage(customerPhone, confirmMsg);

        emitToStore(store.id, 'new_order', {
          id: order.id,
          orderNumber: order.orderNumber,
          status: 'pending',
          source: 'whatsapp',
          customerName: customer.name || customerPhone,
          items,
        });

        logger.info(`WhatsApp order ${orderNumber} created from ${customerPhone}`);
      } else if (messageText === '2' || messageText.toLowerCase() === 'edit') {
        await createOrUpdateSession(store.id, customerPhone, 'COLLECTING_ITEMS', {
          items: session.sessionData?.items || [],
        });

        await twilioService.sendWhatsAppMessage(
          customerPhone,
          'Kripya aur saman bataen jo aapko chahiye:'
        );
      } else if (messageText === '3' || messageText.toLowerCase() === 'cancel') {
        await createOrUpdateSession(store.id, customerPhone, 'IDLE', { items: [] });
        await twilioService.sendWhatsAppMessage(
          customerPhone,
          'Order cancel kar diya gaya hai. Koi aur zaroorat ho to bataen! 😊'
        );
      } else {
        await twilioService.sendWhatsAppMessage(
          customerPhone,
          'Kripya 1 (Confirm), 2 (Edit), ya 3 (Cancel) reply karen.'
        );
      }

      return res.status(200).send('<Response></Response>');
    }

    await twilioService.sendWhatsAppMessage(
      customerPhone,
      'Namaste! Kya aapko kuch chahiye? Apna order bataen. 😊'
    );

    res.status(200).send('<Response></Response>');
  } catch (error) {
    logger.error(`WhatsApp webhook error: ${error.message}`);
    res.status(200).send('<Response></Response>');
  }
}

async function createOrUpdateSession(storeId, customerPhone, state, data) {
  const existing = await prisma.whatsAppSession.findFirst({
    where: { storeId, customerPhone },
    orderBy: { updatedAt: 'desc' },
  });

  if (existing) {
    return prisma.whatsAppSession.update({
      where: { id: existing.id },
      data: {
        sessionState: state,
        sessionData: data || {},
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      },
    });
  }

  return prisma.whatsAppSession.create({
    data: {
      storeId,
      customerPhone,
      sessionState: state,
      sessionData: data || {},
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    },
  });
}

async function sendMenu(storeId, customerPhone) {
  const popularItems = await prisma.inventory.findMany({
    where: { storeId, isActive: true },
    take: 15,
    orderBy: { updatedAt: 'desc' },
  });

  const menuText = popularItems.length > 0
    ? `📋 *Popular Items*\n\n${popularItems.map((i, idx) => `${idx + 1}. ${i.name} — ₹${Number(i.sellingPrice || 0)}/${i.unit || 'piece'}`).join('\n')}\n\nApna order bataen! 😊`
    : `📋 *Popular Items*\n\n1. Atta (Wheat Flour) — 5kg, 10kg\n2. Tata Salt — 1kg\n3. Cooking Oil — 1L, 5L\n4. Sugar — 1kg, 5kg\n5. Rice — 5kg, 10kg\n6. Milk — 1L\n7. Eggs — 6, 12 pieces\n8. Biscuits — Parle-G, Marie\n9. Tea — 250g, 500g\n10. Dal — 1kg, 2kg\n\nApna order bataen! Jaise: "2 kg atta, 1 litre tel"`;

  await twilioService.sendWhatsAppMessage(customerPhone, menuText);
}

module.exports = { handleInbound };
