const Joi = require('joi');
const { prisma } = require('../config/database');
const routeService = require('../services/route.service');
const { emitToDriver, emitToStore } = require('../socket');
const twilioService = require('../services/twilio.service');
const logger = require('../config/logger');

const optimizeSchema = Joi.object({
  orderIds: Joi.array().items(Joi.string().uuid()).min(1).max(20).required(),
  driverId: Joi.string().uuid().required(),
});

async function optimize(req, res, next) {
  try {
    const storeId = req.user.storeId;
    const { orderIds, driverId } = req.body;

    const driver = await prisma.driver.findUnique({ where: { id: driverId } });
    if (!driver || driver.storeId !== storeId) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    const orders = await prisma.order.findMany({
      where: { id: { in: orderIds }, storeId },
      include: { customer: { select: { name: true, phone: true, address: true, deliveryLocation: true } } },
    });

    if (orders.length !== orderIds.length) {
      return res.status(400).json({ error: 'Some orders not found or not in your store' });
    }

    const store = await prisma.store.findUnique({ where: { id: storeId } });

    const orderData = orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: o.customer?.name,
      deliveryAddress: o.deliveryAddress || o.customer?.address,
      deliveryLocation: o.deliveryLocation || o.customer?.deliveryLocation,
      estimatedWeightKg: 2,
    }));

    const result = await routeService.optimizeRoute(orderData, driver, store);

    const batch = await prisma.deliveryBatch.create({
      data: {
        storeId,
        driverId,
        status: 'planned',
        optimizedRoute: result,
        waypoints: result.waypoints,
        totalDistanceKm: result.totalDistanceKm,
        estimatedDurationMin: result.estimatedDurationMin,
      },
    });

    for (const wp of result.waypoints) {
      await prisma.ordersInBatches.create({
        data: {
          orderId: wp.orderId,
          batchId: batch.id,
          stopSequence: wp.stopSequence,
        },
      });
    }

    await prisma.order.updateMany({
      where: { id: { in: orderIds } },
      data: { driverId, status: 'assigned' },
    });

    const trackingBaseUrl = process.env.TRACKING_URL || 'https://kiranaflow.app/track';
    const trackingLinks = orders.map(
      (o) => `${trackingBaseUrl}/${o.orderNumber}`
    );

    emitToDriver(driverId, 'batch_assigned', {
      batchId: batch.id,
      waypoints: result.waypoints,
      totalDistanceKm: result.totalDistanceKm,
      estimatedDurationMin: result.estimatedDurationMin,
    });

    emitToStore(storeId, 'batch_created', {
      batchId: batch.id,
      driverName: driver.name,
      orderCount: orders.length,
    });

    res.status(201).json({
      batch: {
        id: batch.id,
        waypoints: result.waypoints,
        totalDistanceKm: result.totalDistanceKm,
        estimatedDurationMin: result.estimatedDurationMin,
      },
      trackingLinks,
    });
  } catch (error) {
    next(error);
  }
}

async function listBatches(req, res, next) {
  try {
    const storeId = req.user.storeId;
    const { status } = req.query;

    const where = { storeId };
    if (status) where.status = status;

    const batches = await prisma.deliveryBatch.findMany({
      where,
      include: {
        driver: { select: { id: true, name: true, phone: true, vehicleType: true } },
        orders: { include: { order: { include: { customer: { select: { name: true } } } } } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json({ batches });
  } catch (error) {
    next(error);
  }
}

async function getBatch(req, res, next) {
  try {
    const storeId = req.user.storeId;

    const batch = await prisma.deliveryBatch.findUnique({
      where: { id: req.params.id },
      include: {
        driver: { select: { id: true, name: true, phone: true, vehicleType: true } },
        orders: {
          orderBy: { stopSequence: 'asc' },
          include: {
            order: {
              include: {
                customer: { select: { id: true, name: true, phone: true, address: true } },
              },
            },
          },
        },
      },
    });

    if (!batch || batch.storeId !== storeId) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    res.json({ batch });
  } catch (error) {
    next(error);
  }
}

async function startBatch(req, res, next) {
  try {
    const storeId = req.user.storeId;
    const batch = await prisma.deliveryBatch.findUnique({ where: { id: req.params.id } });

    if (!batch || batch.storeId !== storeId) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    const updated = await prisma.deliveryBatch.update({
      where: { id: req.params.id },
      data: { status: 'in_progress', startedAt: new Date() },
    });

    emitToDriver(batch.driverId, 'batch_started', { batchId: batch.id });

    res.json({ batch: updated });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  optimizeSchema,
  optimize,
  listBatches,
  getBatch,
  startBatch,
};
