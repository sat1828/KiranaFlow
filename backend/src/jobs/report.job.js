const { reportQueue } = require('../config/queue');
const { prisma } = require('../config/database');
const claudeService = require('../services/claude.service');
const twilioService = require('../services/twilio.service');
const logger = require('../config/logger');

async function processDailyReport(job) {
  const { storeId } = job.data;
  logger.info(`Generating daily report for store ${storeId}`);

  try {
    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store) throw new Error(`Store ${storeId} not found`);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const orders = await prisma.order.findMany({
      where: {
        storeId,
        createdAt: { gte: today, lt: tomorrow },
      },
    });

    const totalOrders = orders.length;
    const deliveredOrders = orders.filter((o) => o.status === 'delivered').length;
    const cancelledOrders = orders.filter((o) => o.status === 'cancelled').length;
    const totalRevenue = orders
      .filter((o) => o.status === 'delivered')
      .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);

    const deliveryTimes = [];
    orders
      .filter((o) => o.deliveredAt && o.createdAt)
      .forEach((o) => {
        const diff = (new Date(o.deliveredAt).getTime() - new Date(o.createdAt).getTime()) / (1000 * 60);
        deliveryTimes.push(diff);
      });

    const avgDeliveryTime = deliveryTimes.length > 0
      ? deliveryTimes.reduce((s, v) => s + v, 0) / deliveryTimes.length
      : 0;

    const dailyMetrics = {
      totalOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue,
      avgDeliveryTimeMin: Math.round(avgDeliveryTime * 100) / 100,
      onTimeDeliveryRate: totalOrders > 0 ? deliveredOrders / totalOrders : 0,
    };

    await prisma.storeMetric.upsert({
      where: { storeId_metricDate: { storeId, metricDate: today } },
      update: {
        totalOrders,
        deliveredOrders,
        cancelledOrders,
        totalRevenue,
        avgDeliveryTimeMin: dailyMetrics.avgDeliveryTimeMin,
        onTimeDeliveryRate: dailyMetrics.onTimeDeliveryRate,
      },
      create: {
        storeId,
        metricDate: today,
        ...dailyMetrics,
      },
    });

    const report = await claudeService.generateDailyReport(
      store.ownerName,
      store.address?.split(',').pop()?.trim() || 'your city',
      store.languagePreference,
      dailyMetrics
    );

    try {
      await twilioService.sendWhatsAppMessage(store.phone, report);
      logger.info(`Daily report sent to ${store.phone}`);
    } catch (twilioError) {
      logger.warn(`Failed to send daily report via WhatsApp: ${twilioError.message}`);
    }

    logger.info(`Daily report completed for store ${storeId}`);
    return { success: true, metrics: dailyMetrics };
  } catch (error) {
    logger.error(`Daily report job failed for store ${storeId}: ${error.message}`);
    throw error;
  }
}

function registerReportJob() {
  reportQueue.process(processDailyReport);

  reportQueue.add('daily-report', {}, {
    repeat: { cron: '0 22 * * *' },
    removeOnComplete: true,
    jobId: 'daily-report',
  });

  logger.info('Daily report job registered (runs daily at 10 PM)');
}

async function runReportNow(storeId) {
  return reportQueue.add({ storeId }, { removeOnComplete: true });
}

module.exports = { registerReportJob, runReportNow };
