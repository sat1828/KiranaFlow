const { prisma } = require('../config/database');
const claudeService = require('../services/claude.service');
const { runReportNow } = require('../jobs/report.job');

async function getDailyReport(req, res, next) {
  try {
    const storeId = req.user.storeId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const orders = await prisma.order.findMany({
      where: { storeId, createdAt: { gte: today, lt: tomorrow } },
      include: { driver: { select: { name: true } }, customer: { select: { name: true } } },
    });

    const totalOrders = orders.length;
    const deliveredOrders = orders.filter((o) => o.status === 'delivered').length;
    const cancelledOrders = orders.filter((o) => o.status === 'cancelled').length;
    const totalRevenue = orders
      .filter((o) => o.status === 'delivered')
      .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);

    const deliveryTimes = orders
      .filter((o) => o.deliveredAt && o.createdAt)
      .map((o) => (new Date(o.deliveredAt).getTime() - new Date(o.createdAt).getTime()) / 60000);

    const avgDeliveryTime = deliveryTimes.length > 0
      ? deliveryTimes.reduce((s, v) => s + v, 0) / deliveryTimes.length
      : 0;

    const format = req.query.format || 'json';

    if (format === 'json') {
      return res.json({
        date: today.toISOString().split('T')[0],
        metrics: {
          totalOrders,
          deliveredOrders,
          cancelledOrders,
          totalRevenue,
          avgDeliveryTimeMin: Math.round(avgDeliveryTime * 100) / 100,
          onTimeRate: totalOrders > 0 ? deliveredOrders / totalOrders : 0,
        },
        orders,
      });
    }

    const store = await prisma.store.findUnique({ where: { id: storeId } });
    const summary = await claudeService.generateDailyReport(
      store.ownerName,
      store.address?.split(',').pop()?.trim() || 'city',
      store.languagePreference,
      { totalOrders, deliveredOrders, cancelledOrders, totalRevenue, avgDeliveryTimeMin: avgDeliveryTime }
    );

    res.json({ report: summary, metrics: { totalOrders, totalRevenue, deliveredOrders } });
  } catch (error) {
    next(error);
  }
}

async function getWeeklyReport(req, res, next) {
  try {
    const storeId = req.user.storeId;
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const metrics = await prisma.storeMetric.findMany({
      where: { storeId, metricDate: { gte: weekAgo } },
      orderBy: { metricDate: 'asc' },
    });

    const totalOrders = metrics.reduce((s, m) => s + m.totalOrders, 0);
    const totalRevenue = metrics.reduce((s, m) => s + Number(m.totalRevenue), 0);
    const avgDeliveryTime = metrics.reduce((s, m) => s + Number(m.avgDeliveryTimeMin || 0), 0) / (metrics.length || 1);

    res.json({
      period: { start: weekAgo.toISOString().split('T')[0], end: new Date().toISOString().split('T')[0] },
      metrics,
      summary: { totalOrders, totalRevenue, avgDeliveryTimeMin: Math.round(avgDeliveryTime * 100) / 100 },
    });
  } catch (error) {
    next(error);
  }
}

async function getDriverReport(req, res, next) {
  try {
    const storeId = req.user.storeId;
    const driverId = req.params.id;

    const driver = await prisma.driver.findUnique({ where: { id: driverId } });
    if (!driver || driver.storeId !== storeId) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    const orders = await prisma.order.findMany({
      where: { driverId },
      include: { customer: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const delivered = orders.filter((o) => o.status === 'delivered');
    const totalRevenue = delivered.reduce((s, o) => s + Number(o.totalAmount || 0), 0);

    res.json({
      driver: { name: driver.name, phone: driver.phone, vehicleType: driver.vehicleType },
      stats: {
        totalOrders: orders.length,
        delivered: delivered.length,
        cancelled: orders.filter((o) => o.status === 'cancelled').length,
        totalRevenue,
        onTimeRate: orders.length > 0 ? delivered.length / orders.length : 0,
      },
      orders,
    });
  } catch (error) {
    next(error);
  }
}

async function triggerReport(req, res, next) {
  try {
    const storeId = req.user.storeId;
    const job = await runReportNow(storeId);
    res.json({ message: 'Report generation started', jobId: job.id });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDailyReport,
  getWeeklyReport,
  getDriverReport,
  triggerReport,
};
