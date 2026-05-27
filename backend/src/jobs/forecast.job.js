const { forecastQueue } = require('../config/queue');
const { prisma } = require('../config/database');
const claudeService = require('../services/claude.service');
const logger = require('../config/logger');

async function processForecast(job) {
  const { storeId } = job.data;
  logger.info(`Starting demand forecast for store ${storeId}`);

  try {
    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store) throw new Error(`Store ${storeId} not found`);

    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

    const orders = await prisma.order.findMany({
      where: {
        storeId,
        createdAt: { gte: ninetyDaysAgo },
        status: 'delivered',
      },
      select: { items: true },
    });

    const productVolumes = {};
    orders.forEach((order) => {
      const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
      (items || []).forEach((item) => {
        const key = item.name || item.productName;
        productVolumes[key] = (productVolumes[key] || 0) + (item.qty || item.quantity || 1);
      });
    });

    const topProducts = Object.entries(productVolumes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([name, volume]) => ({ name, volume }));

    const inventory = await prisma.inventory.findMany({
      where: { storeId, isActive: true },
    });

    const result = await claudeService.generateDemandForecasts(topProducts, inventory, store);

    if (result.forecasts && result.forecasts.length > 0) {
      for (const forecast of result.forecasts) {
        const inventoryItem = inventory.find(
          (i) => i.id === forecast.inventory_id || i.name.toLowerCase() === forecast.product_name.toLowerCase()
        );
        if (!inventoryItem) continue;

        const next7Days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() + i + 1);
          return d;
        });

        for (const date of next7Days) {
          await prisma.demandForecast.create({
            data: {
              storeId,
              inventoryId: inventoryItem.id,
              forecastDate: date,
              predictedQuantity: forecast.predicted_7day_demand / 7,
              confidenceScore: forecast.confidence || 0.5,
              reasoning: forecast.reasoning || null,
            },
          });
        }

        logger.info(`Forecast saved for ${forecast.product_name}: ${forecast.predicted_7day_demand} units`);
      }
    }

    logger.info(`Forecast completed for store ${storeId}`);
    return { success: true, forecastsCount: result.forecasts?.length || 0 };
  } catch (error) {
    logger.error(`Forecast job failed for store ${storeId}: ${error.message}`);
    throw error;
  }
}

function registerForecastJob() {
  forecastQueue.process(processForecast);

  forecastQueue.add('daily-forecast', {}, {
    repeat: { cron: '0 23 * * *' },
    removeOnComplete: true,
    jobId: 'daily-forecast',
  });

  logger.info('Forecast job registered (runs daily at 11 PM)');
}

async function runForecastNow(storeId) {
  return forecastQueue.add({ storeId }, { removeOnComplete: true });
}

module.exports = { registerForecastJob, runForecastNow };
