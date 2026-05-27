const Joi = require('joi');
const { prisma } = require('../config/database');

const updateProfileSchema = Joi.object({
  ownerName: Joi.string().max(100),
  storeName: Joi.string().max(150),
  address: Joi.string(),
  deliveryRadiusKm: Joi.number().min(0.5).max(50),
  timezone: Joi.string(),
  languagePreference: Joi.string().valid('hi', 'en', 'te', 'ta', 'or'),
  latitude: Joi.number().min(-90).max(90),
  longitude: Joi.number().min(-180).max(180),
});

async function getProfile(req, res, next) {
  try {
    const store = await prisma.store.findUnique({
      where: { id: req.user.storeId },
      include: {
        _count: { select: { drivers: true, orders: true, customers: true } },
      },
    });

    if (!store) return res.status(404).json({ error: 'Store not found' });

    res.json({ store });
  } catch (error) {
    next(error);
  }
}

async function updateProfile(req, res, next) {
  try {
    const data = { ...req.body };
    if (data.latitude != null && data.longitude != null) {
      data.lat = data.latitude;
      data.lng = data.longitude;
    }
    delete data.latitude;
    delete data.longitude;

    const store = await prisma.store.update({
      where: { id: req.user.storeId },
      data,
    });

    res.json({ store, message: 'Profile updated successfully' });
  } catch (error) {
    next(error);
  }
}

async function getDashboard(req, res, next) {
  try {
    const storeId = req.user.storeId;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      todayOrders,
      activeDrivers,
      pendingOrders,
      recentOrders,
      totalCustomers,
      todayRevenue,
    ] = await Promise.all([
      prisma.order.count({
        where: { storeId, createdAt: { gte: today, lt: tomorrow } },
      }),
      prisma.driver.count({
        where: { storeId, isActive: true, isOnDuty: true },
      }),
      prisma.order.count({
        where: { storeId, status: { in: ['pending', 'confirmed', 'assigned'] } },
      }),
      prisma.order.findMany({
        where: { storeId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { customer: { select: { name: true, phone: true } } },
      }),
      prisma.customer.count({ where: { storeId } }),
      prisma.order.aggregate({
        where: {
          storeId,
          createdAt: { gte: today, lt: tomorrow },
          status: 'delivered',
        },
        _sum: { totalAmount: true },
      }),
    ]);

    res.json({
      metrics: {
        todayOrders,
        activeDrivers,
        pendingOrders,
        totalCustomers,
        todayRevenue: Number(todayRevenue._sum.totalAmount || 0),
      },
      recentOrders,
    });
  } catch (error) {
    next(error);
  }
}

async function getAnalytics(req, res, next) {
  try {
    const storeId = req.user.storeId;
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const metrics = await prisma.storeMetric.findMany({
      where: {
        storeId,
        metricDate: { gte: start, lte: end },
      },
      orderBy: { metricDate: 'asc' },
    });

    const orders = await prisma.order.findMany({
      where: {
        storeId,
        createdAt: { gte: start, lte: end },
      },
      include: { customer: { select: { name: true, phone: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const topProducts = {};
    orders.forEach((order) => {
      const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
      (items || []).forEach((item) => {
        const name = item.name || item.productName;
        topProducts[name] = (topProducts[name] || 0) + (item.qty || item.quantity || 1);
      });
    });

    const sortedProducts = Object.entries(topProducts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, qty]) => ({ name, quantity: qty }));

    res.json({
      metrics,
      totalOrders: orders.length,
      deliveredOrders: orders.filter((o) => o.status === 'delivered').length,
      cancelledOrders: orders.filter((o) => o.status === 'cancelled').length,
      totalRevenue: orders.reduce((s, o) => s + Number(o.totalAmount || 0), 0),
      topProducts: sortedProducts,
      orders,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  updateProfileSchema,
  getProfile,
  updateProfile,
  getDashboard,
  getAnalytics,
};
