const { prisma } = require('../config/database');
const claudeService = require('../services/claude.service');
const { runForecastNow } = require('../jobs/forecast.job');
const logger = require('../config/logger');

async function runForecast(req, res, next) {
  try {
    const storeId = req.user.storeId;
    const job = await runForecastNow(storeId);
    res.json({ message: 'Forecast generation started', jobId: job.id });
  } catch (error) {
    next(error);
  }
}

async function getLatestForecast(req, res, next) {
  try {
    const storeId = req.user.storeId;

    const forecasts = await prisma.demandForecast.findMany({
      where: {
        storeId,
        forecastDate: { gte: new Date() },
      },
      include: {
        inventory: { select: { name: true, category: true, currentStock: true, unit: true } },
      },
      orderBy: [{ inventory: { name: 'asc' } }, { forecastDate: 'asc' }],
    });

    const grouped = {};
    forecasts.forEach((f) => {
      const key = f.inventoryId;
      if (!grouped[key]) {
        grouped[key] = {
          inventoryId: f.inventoryId,
          productName: f.inventory.name,
          category: f.inventory.category,
          currentStock: Number(f.inventory.currentStock),
          unit: f.inventory.unit,
          confidence: Number(f.confidenceScore),
          reasoning: f.reasoning,
          dailyForecasts: [],
          totalPredicted: 0,
        };
      }
      grouped[key].dailyForecasts.push({
        date: f.forecastDate,
        predicted: Number(f.predictedQuantity),
      });
      grouped[key].totalPredicted += Number(f.predictedQuantity);
    });

    const result = Object.values(grouped).map((g) => ({
      ...g,
      totalPredicted: Math.round(g.totalPredicted * 100) / 100,
      urgency:
        g.currentStock < g.totalPredicted * 0.3
          ? 'critical'
          : g.currentStock < g.totalPredicted * 0.6
          ? 'high'
          : g.currentStock < g.totalPredicted * 0.9
          ? 'medium'
          : 'low',
    }));

    res.json({ forecasts: result, generatedAt: new Date().toISOString() });
  } catch (error) {
    next(error);
  }
}

async function getInsights(req, res, next) {
  try {
    const storeId = req.user.storeId;
    const store = await prisma.store.findUnique({ where: { id: storeId } });

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const metrics = await prisma.storeMetric.findMany({
      where: { storeId, metricDate: { gte: sevenDaysAgo } },
      orderBy: { metricDate: 'asc' },
    });

    const orders = await prisma.order.findMany({
      where: {
        storeId,
        createdAt: { gte: sevenDaysAgo },
        status: 'delivered',
      },
      include: { driver: { select: { name: true } } },
    });

    const driverPerformance = {};
    orders.forEach((o) => {
      const name = o.driver?.name || 'Unknown';
      if (!driverPerformance[name]) {
        driverPerformance[name] = { delivered: 0, total: 0 };
      }
      driverPerformance[name].delivered += 1;
      driverPerformance[name].total += 1;
    });

    const driverRanking = Object.entries(driverPerformance)
      .map(([name, stats]) => ({
        name,
        delivered: stats.delivered,
        onTimeRate: stats.total > 0 ? stats.delivered / stats.total : 0,
      }))
      .sort((a, b) => b.onTimeRate - a.onTimeRate);

    const insights = await claudeService.generateWeeklyInsights(
      store,
      {
        metrics,
        totalOrders: orders.length,
        totalRevenue: orders.reduce((s, o) => s + Number(o.totalAmount || 0), 0),
        driverRanking,
      },
      store.languagePreference
    );

    res.json({ insights });
  } catch (error) {
    next(error);
  }
}

async function chatWithAI(req, res, next) {
  try {
    const storeId = req.user.storeId;
    const { message } = req.body;

    const store = await prisma.store.findUnique({ where: { id: storeId } });
    const recentOrders = await prisma.order.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: { customer: { select: { name: true } } },
    });

    const systemPrompt = `You are KiranaAI, an assistant for a kirana store owner. 
Answer questions about their store data in simple ${store.languagePreference === 'hi' ? 'Hindi' : 'English'}. 
Be helpful, conversational, and use the provided context. Keep responses under 200 words.`;

    const userPrompt = `Store: ${store.storeName}
Recent orders: ${JSON.stringify(recentOrders.map(o => ({ number: o.orderNumber, status: o.status, amount: o.totalAmount })))}

Owner question: ${message}`;

    const response = await claudeService.queryClaude(systemPrompt, userPrompt, 1000);
    res.json({ response });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  runForecast,
  getLatestForecast,
  getInsights,
  chatWithAI,
};
