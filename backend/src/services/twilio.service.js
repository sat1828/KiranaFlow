const config = require('../config');
const logger = require('../config/logger');

let twilioClient = null;

function getTwilioClient() {
  if (!twilioClient && config.twilio.accountSid && config.twilio.authToken) {
    try {
      twilioClient = require('twilio')(config.twilio.accountSid, config.twilio.authToken);
    } catch (error) {
      logger.error(`Twilio init failed: ${error.message}`);
    }
  }
  return twilioClient;
}

async function sendWhatsAppMessage(to, body) {
  const client = getTwilioClient();
  if (!client) {
    logger.warn(`Twilio not configured. Would send to ${to}: ${body}`);
    return { sid: 'mock-sid', status: 'mock' };
  }
  try {
    const message = await client.messages.create({
      from: config.twilio.whatsappFrom,
      body,
      to: `whatsapp:${to}`,
    });
    logger.info(`WhatsApp sent to ${to}: ${message.sid}`);
    return message;
  } catch (error) {
    logger.error(`WhatsApp send failed to ${to}: ${error.message}`);
    throw error;
  }
}

async function sendWhatsAppTemplate(to, templateSid, variables = {}) {
  const client = getTwilioClient();
  if (!client) {
    logger.warn(`Twilio not configured. Template ${templateSid} to ${to}`);
    return { sid: 'mock-sid' };
  }
  try {
    const message = await client.messages.create({
      from: config.twilio.whatsappFrom,
      contentSid: templateSid,
      contentVariables: JSON.stringify(variables),
      to: `whatsapp:${to}`,
    });
    logger.info(`WhatsApp template sent to ${to}: ${message.sid}`);
    return message;
  } catch (error) {
    logger.error(`WhatsApp template send failed to ${to}: ${error.message}`);
    throw error;
  }
}

async function sendOTPViaWhatsApp(phone, otp) {
  const body = `Your KiranaFlow OTP is: ${otp}. Valid for 10 minutes.`;
  return sendWhatsAppMessage(phone, body);
}

async function sendOrderConfirmation(customerPhone, orderNumber, storeName) {
  const body = `✅ *Order Confirmed!*\n\nYour order ${orderNumber} from ${storeName} has been received and confirmed. We'll notify you when it's on the way!\n\nThank you for ordering with ${storeName}.`;
  return sendWhatsAppMessage(customerPhone, body);
}

async function sendTrackingLink(customerPhone, orderNumber, trackingUrl) {
  const body = `🚀 *Your Order is On the Way!*\n\nOrder: ${orderNumber}\nTrack your delivery in real-time here:\n${trackingUrl}\n\nThank you for choosing your local kirana store! 🏪`;
  return sendWhatsAppMessage(customerPhone, body);
}

async function sendDeliveryConfirmation(customerPhone, orderNumber, paymentMethod, amount) {
  let paymentMsg = '';
  if (paymentMethod === 'cod') {
    paymentMsg = `\n\n📌 Please pay ₹${amount} to the delivery partner.`;
  }

  const body = `✅ *Order Delivered!*\n\nYour order ${orderNumber} has been delivered successfully!${paymentMsg}\n\nThank you for shopping local! 🏪❤️`;
  return sendWhatsAppMessage(customerPhone, body);
}

function validateTwilioSignature(originalUrl, params, signature) {
  const client = getTwilioClient();
  if (!client) return true;
  try {
    return client.validateRequest(config.twilio.authToken, signature, originalUrl, params);
  } catch {
    return false;
  }
}

module.exports = {
  sendWhatsAppMessage,
  sendWhatsAppTemplate,
  sendOTPViaWhatsApp,
  sendOrderConfirmation,
  sendTrackingLink,
  sendDeliveryConfirmation,
  validateTwilioSignature,
};
