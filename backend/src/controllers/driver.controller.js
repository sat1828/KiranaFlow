const Joi = require('joi');
const { prisma } = require('../config/database');
const { emitToStore } = require('../socket');
const logger = require('../config/logger');

const createDriverSchema = Joi.object({
  name: Joi.string().max(100).required(),
  phone: Joi.string().pattern(/^\+\d{10,15}$/).required(),
  vehicleType: Joi.string().valid('bicycle', 'motorcycle', 'auto', 'van').default('motorcycle'),
  vehicleCapacityKg: Joi.number().positive().max(1000).optional(),
  licenseNumber: Joi.string().optional(),
});

const updateDriverSchema = Joi.object({
  name: Joi.string().max(100),
  vehicleType: Joi.string().valid('bicycle', 'motorcycle', 'auto', 'van'),
  vehicleCapacityKg: Joi.number().positive().max(1000),
  licenseNumber: Joi.string(),
  isActive: Joi.boolean(),
});

const locationSchema = Joi.object({
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
  heading: Joi.number().min(0).max(360).optional(),
  speed: Joi.number().min(0).optional(),
  batchId: Joi.string().uuid().optional(),
});

async function listDrivers(req, res, next) {
  try {
    const storeId = req.user.storeId;
    const { active } = req.query;

    const where = { storeId };
    if (active === 'true') where.isActive = true;

    const drivers = await prisma.driver.findMany({
      where,
      include: {
        _count: {
          select: {
            orders: { where: { status: { notIn: ['delivered', 'cancelled'] } } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ drivers });
  } catch (error) {
    next(error);
  }
}

async function createDriver(req, res, next) {
  try {
    const storeId = req.user.storeId;
    const data = req.body;

    const existing = await prisma.driver.findUnique({ where: { phone: data.phone } });
    if (existing) {
      return res.status(409).json({ error: 'Driver with this phone already exists' });
    }

    const driver = await prisma.driver.create({
      data: { ...data, storeId },
    });

    emitToStore(storeId, 'driver_added', { id: driver.id, name: driver.name });
    logger.info(`Driver ${driver.name} created for store ${storeId}`);

    res.status(201).json({ driver });
  } catch (error) {
    next(error);
  }
}

async function updateDriver(req, res, next) {
  try {
    const storeId = req.user.storeId;
    const driver = await prisma.driver.findUnique({ where: { id: req.params.id } });

    if (!driver || driver.storeId !== storeId) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    const updated = await prisma.driver.update({
      where: { id: req.params.id },
      data: req.body,
    });

    res.json({ driver: updated });
  } catch (error) {
    next(error);
  }
}

async function deleteDriver(req, res, next) {
  try {
    const storeId = req.user.storeId;
    const driver = await prisma.driver.findUnique({ where: { id: req.params.id } });

    if (!driver || driver.storeId !== storeId) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    await prisma.driver.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });

    res.json({ message: 'Driver deactivated' });
  } catch (error) {
    next(error);
  }
}

async function toggleDuty(req, res, next) {
  try {
    const storeId = req.user.storeId;
    const driver = await prisma.driver.findUnique({ where: { id: req.params.id } });

    if (!driver || driver.storeId !== storeId) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    const updated = await prisma.driver.update({
      where: { id: req.params.id },
      data: { isOnDuty: !driver.isOnDuty },
    });

    emitToStore(storeId, 'driver_duty_change', {
      id: updated.id,
      name: updated.name,
      isOnDuty: updated.isOnDuty,
    });

    res.json({ driver: updated, message: `Driver ${updated.isOnDuty ? 'on duty' : 'off duty'}` });
  } catch (error) {
    next(error);
  }
}

async function getDriverLocation(req, res, next) {
  try {
    const storeId = req.user.storeId;
    const driver = await prisma.driver.findUnique({
      where: { id: req.params.id },
      select: { id: true, name: true, currentLat: true, currentLng: true, lastLocationUpdate: true },
    });

    if (!driver || driver.storeId !== storeId) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    const location = driver.currentLat != null && driver.currentLng != null
      ? { lat: Number(driver.currentLat), lng: Number(driver.currentLng) }
      : null;

    res.json({ driver: { ...driver, currentLocation: location } });
  } catch (error) {
    next(error);
  }
}

async function updateDriverLocation(req, res, next) {
  try {
    const { latitude, longitude, heading, speed, batchId } = req.body;
    const driverId = req.params.id || req.user.driverId;

    await prisma.driver.update({
      where: { id: driverId },
      data: {
        currentLat: latitude,
        currentLng: longitude,
        lastLocationUpdate: new Date(),
      },
    });

    if (batchId) {
      await prisma.driverLocation.create({
        data: {
          driverId,
          batchId,
          lat: latitude,
          lng: longitude,
          speedKmph: speed || null,
          heading: heading || null,
        },
      });
    }

    res.json({ message: 'Location updated' });
  } catch (error) {
    next(error);
  }
}

async function getDriverHistory(req, res, next) {
  try {
    const storeId = req.user.storeId;
    const driver = await prisma.driver.findUnique({ where: { id: req.params.id } });

    if (!driver || driver.storeId !== storeId) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    const orders = await prisma.order.findMany({
      where: { driverId: req.params.id },
      include: { customer: { select: { name: true, phone: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const totalDelivered = orders.filter((o) => o.status === 'delivered').length;
    const totalCancelled = orders.filter((o) => o.status === 'cancelled').length;
    const totalRevenue = orders
      .filter((o) => o.status === 'delivered')
      .reduce((s, o) => s + Number(o.totalAmount || 0), 0);

    res.json({
      driver: { id: driver.id, name: driver.name, phone: driver.phone, vehicleType: driver.vehicleType },
      stats: {
        totalOrders: orders.length,
        totalDelivered,
        totalCancelled,
        totalRevenue,
        onTimeRate: totalDelivered > 0 ? totalDelivered / orders.length : 0,
      },
      orders,
    });
  } catch (error) {
    next(error);
  }
}

async function getMyOrders(req, res, next) {
  try {
    const driverId = req.user.driverId;

    const orders = await prisma.order.findMany({
      where: {
        driverId,
        status: { notIn: ['delivered', 'cancelled'] },
      },
      include: {
        customer: { select: { name: true, phone: true, address: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const history = await prisma.order.findMany({
      where: {
        driverId,
        status: { in: ['delivered', 'cancelled'] },
      },
      take: 50,
      orderBy: { updatedAt: 'desc' },
    });

    res.json({ orders, history });
  } catch (error) {
    next(error);
  }
}

async function markDelivered(req, res, next) {
  try {
    const driverId = req.user.driverId;
    const { proofOfDeliveryUrl } = req.body;

    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order || order.driverId !== driverId) {
      return res.status(404).json({ error: 'Order not found or not assigned to you' });
    }

    const updated = await prisma.order.update({
      where: { id: req.params.id },
      data: {
        status: 'delivered',
        deliveredAt: new Date(),
        proofOfDeliveryUrl: proofOfDeliveryUrl || null,
      },
    });

    emitToStore(order.storeId, 'order_updated', {
      id: updated.id,
      orderNumber: updated.orderNumber,
      status: 'delivered',
    });

    emitToOrder(updated.id, 'order_status', {
      status: 'delivered',
      timestamp: new Date().toISOString(),
    });

    res.json({ order: updated, message: 'Order marked as delivered' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createDriverSchema,
  updateDriverSchema,
  locationSchema,
  listDrivers,
  createDriver,
  updateDriver,
  deleteDriver,
  toggleDuty,
  getDriverLocation,
  updateDriverLocation,
  getDriverHistory,
  getMyOrders,
  markDelivered,
};
