const Joi = require('joi');
const { prisma } = require('../config/database');
const { emitToStore, emitToDriver, emitToOrder } = require('../socket');
const twilioService = require('../services/twilio.service');
const logger = require('../config/logger');

const createOrderSchema = Joi.object({
  customerId: Joi.string().uuid().optional(),
  customerPhone: Joi.string().pattern(/^\+\d{10,15}$/).optional(),
  customerName: Joi.string().max(100).optional(),
  customerAddress: Joi.string().optional(),
  items: Joi.array().items(Joi.object({
    name: Joi.string().required(),
    qty: Joi.number().positive().required(),
    unit: Joi.string().optional(),
    price: Joi.number().positive().optional(),
  })).min(1).required(),
  deliveryAddress: Joi.string().optional(),
  deliveryNotes: Joi.string().optional(),
  paymentMethod: Joi.string().valid('cod', 'upi', 'credit').default('cod'),
  subtotal: Joi.number().positive().optional(),
  deliveryFee: Joi.number().min(0).default(0),
  discount: Joi.number().min(0).default(0),
  totalAmount: Joi.number().positive().optional(),
  latitude: Joi.number().min(-90).max(90).optional(),
  longitude: Joi.number().min(-180).max(180).optional(),
});

const updateStatusSchema = Joi.object({
  status: Joi.string().valid('confirmed', 'picked_up', 'in_transit', 'delivered', 'cancelled').required(),
  cancellationReason: Joi.string().when('status', { is: 'cancelled', then: Joi.required() }),
});

const assignSchema = Joi.object({
  driverId: Joi.string().uuid().required(),
  batchId: Joi.string().uuid().optional(),
});

function generateOrderNumber(storeId) {
  const year = new Date().getFullYear();
  const random = Math.floor(10000 + Math.random() * 90000);
  return `KF-${year}-${random}`;
}

async function listOrders(req, res, next) {
  try {
    const storeId = req.user.storeId;
    const { status, driverId, dateFrom, dateTo, limit, offset } = req.query;

    const where = { storeId };
    if (status) where.status = status;
    if (driverId) where.driverId = driverId;
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          customer: { select: { id: true, name: true, phone: true, address: true } },
          driver: { select: { id: true, name: true, phone: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit) || 50,
        skip: parseInt(offset) || 0,
      }),
      prisma.order.count({ where }),
    ]);

    res.json({ orders, total, limit: parseInt(limit) || 50, offset: parseInt(offset) || 0 });
  } catch (error) {
    next(error);
  }
}

async function getPendingOrders(req, res, next) {
  try {
    const orders = await prisma.order.findMany({
      where: {
        storeId: req.user.storeId,
        status: { in: ['pending', 'confirmed'] },
        driverId: null,
      },
      include: {
        customer: { select: { id: true, name: true, phone: true, address: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json({ orders });
  } catch (error) {
    next(error);
  }
}

async function getOrder(req, res, next) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        customer: true,
        driver: true,
        store: { select: { id: true, storeName: true, phone: true } },
        deliveryBatches: {
          include: { batch: true },
        },
      },
    });

    if (!order || order.storeId !== req.user.storeId) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ order });
  } catch (error) {
    next(error);
  }
}

async function createOrder(req, res, next) {
  try {
    const storeId = req.user.storeId;
    const data = req.body;

    let customerId = data.customerId;
    if (!customerId && data.customerPhone) {
      let customer = await prisma.customer.findFirst({
        where: { storeId, phone: data.customerPhone },
      });
      if (!customer) {
        customer = await prisma.customer.create({
          data: {
            storeId,
            phone: data.customerPhone,
            name: data.customerName || null,
            address: data.customerAddress || null,
          },
        });
      }
      customerId = customer.id;
    }

    if (!customerId) {
      return res.status(400).json({ error: 'Customer ID or phone is required' });
    }

    const orderNumber = generateOrderNumber(storeId);
    const subtotal = data.subtotal || data.items.reduce((s, item) => s + (item.price || 0) * item.qty, 0);
    const totalAmount = data.totalAmount || (subtotal + data.deliveryFee - data.discount);

    const orderData = {
      orderNumber,
      storeId,
      customerId,
      status: 'pending',
      source: req.body.source || 'app',
      items: data.items,
      subtotal,
      deliveryFee: data.deliveryFee || 0,
      discount: data.discount || 0,
      totalAmount,
      paymentMethod: data.paymentMethod || 'cod',
      deliveryAddress: data.deliveryAddress || data.customerAddress || null,
      deliveryNotes: data.deliveryNotes || null,
    };

    if (data.latitude != null && data.longitude != null) {
      orderData.deliveryLat = data.latitude;
      orderData.deliveryLng = data.longitude;
    }

    const order = await prisma.order.create({ data: orderData });

    await prisma.customer.update({
      where: { id: customerId },
      data: {
        orderCount: { increment: 1 },
        lastOrderAt: new Date(),
      },
    });

    emitToStore(storeId, 'new_order', {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      createdAt: order.createdAt,
    });

    logger.info(`Order ${orderNumber} created for store ${storeId}`);
    res.status(201).json({ order });
  } catch (error) {
    next(error);
  }
}

async function updateOrderStatus(req, res, next) {
  try {
    const storeId = req.user.storeId;
    const { status, cancellationReason } = req.body;

    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order || order.storeId !== storeId) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status === 'delivered' || order.status === 'cancelled') {
      return res.status(400).json({ error: `Order already ${order.status}` });
    }

    const updateData = { status };
    if (status === 'delivered') {
      updateData.deliveredAt = new Date();
    }
    if (status === 'cancelled') {
      updateData.cancellationReason = cancellationReason || null;
    }

    const updated = await prisma.order.update({
      where: { id: req.params.id },
      data: updateData,
    });

    emitToStore(storeId, 'order_updated', {
      id: updated.id,
      orderNumber: updated.orderNumber,
      status: updated.status,
    });

    if (updated.driverId) {
      emitToDriver(updated.driverId, 'order_updated', {
        id: updated.id,
        orderNumber: updated.orderNumber,
        status: updated.status,
      });
    }

    emitToOrder(updated.id, 'order_status', {
      status: updated.status,
      timestamp: new Date().toISOString(),
    });

    if (status === 'confirmed' && order.source === 'whatsapp') {
      try {
        const customer = await prisma.customer.findUnique({ where: { id: order.customerId } });
        const store = await prisma.store.findUnique({ where: { id: storeId } });
        if (customer?.phone) {
          await twilioService.sendOrderConfirmation(customer.phone, order.orderNumber, store.storeName);
        }
      } catch (err) {
        logger.warn(`Failed to send confirmation WhatsApp: ${err.message}`);
      }
    }

    res.json({ order: updated });
  } catch (error) {
    next(error);
  }
}

async function assignOrder(req, res, next) {
  try {
    const storeId = req.user.storeId;
    const { driverId, batchId } = req.body;

    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order || order.storeId !== storeId) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const driver = await prisma.driver.findUnique({ where: { id: driverId } });
    if (!driver || driver.storeId !== storeId) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    let batch;
    if (batchId) {
      batch = await prisma.deliveryBatch.findUnique({ where: { id: batchId } });
      if (!batch || batch.storeId !== storeId) {
        return res.status(404).json({ error: 'Batch not found' });
      }
    }

    const updated = await prisma.order.update({
      where: { id: req.params.id },
      data: {
        driverId,
        status: 'assigned',
        ...(batchId ? { deliveryBatches: { create: { batchId, stopSequence: 0 } } } : {}),
      },
    });

    emitToStore(storeId, 'order_updated', {
      id: updated.id,
      orderNumber: updated.orderNumber,
      status: updated.status,
      driverId,
    });

    emitToDriver(driverId, 'order_assigned', {
      id: updated.id,
      orderNumber: updated.orderNumber,
      customerName: (await prisma.customer.findUnique({ where: { id: order.customerId } }))?.name,
      deliveryAddress: updated.deliveryAddress,
    });

    res.json({ order: updated });
  } catch (error) {
    next(error);
  }
}

async function trackOrder(req, res, next) {
  try {
    const { orderId } = req.params;

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId);

    const order = await prisma.order.findFirst({
      where: { OR: [{ orderNumber: orderId }, ...(isUuid ? [{ id: orderId }] : [])] },
      include: {
        store: { select: { storeName: true, phone: true } },
        driver: { select: { name: true, phone: true, vehicleType: true, currentLat: true, currentLng: true } },
        customer: { select: { name: true } },
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const sanitized = {
      orderNumber: order.orderNumber,
      status: order.status,
      items: order.items,
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      estimatedDeliveryAt: order.estimatedDeliveryAt,
      storeName: order.store.storeName,
      storePhone: order.store.phone,
      customerName: order.customer?.name,
      driverName: order.driver?.name?.split(' ')[0] || null,
      vehicleType: order.driver?.vehicleType || null,
      driverLocation: order.driver?.currentLat != null
        ? { lat: Number(order.driver.currentLat), lng: Number(order.driver.currentLng) }
        : null,
    };

    res.json({ order: sanitized });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createOrderSchema,
  updateStatusSchema,
  assignSchema,
  listOrders,
  getPendingOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  assignOrder,
  trackOrder,
};
