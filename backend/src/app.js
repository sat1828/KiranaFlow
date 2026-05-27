require('dotenv').config();

const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

const config = require('./config');
const logger = require('./config/logger');
const { connectDatabase, disconnectDatabase } = require('./config/database');
const { connectRedis } = require('./config/redis');
const { initializeSocket, closeSocket } = require('./socket');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');
const { shutdownQueues } = require('./config/queue');

const authRoutes = require('./routes/auth.routes');
const storeRoutes = require('./routes/store.routes');
const orderRoutes = require('./routes/order.routes');
const driverRoutes = require('./routes/driver.routes');
const routeRoutes = require('./routes/route.routes');
const inventoryRoutes = require('./routes/inventory.routes');
const aiRoutes = require('./routes/ai.routes');
const whatsappRoutes = require('./routes/whatsapp.routes');
const reportRoutes = require('./routes/report.routes');
const trackRoutes = require('./routes/track.routes');

const { registerForecastJob } = require('./jobs/forecast.job');
const { registerReportJob } = require('./jobs/report.job');

const app = express();
const server = http.createServer(app);

app.use(helmet());
app.use(cors({
  origin: config.env === 'production'
    ? ['https://kiranaflow.app', 'https://admin.kiranaflow.app', 'https://track.kiranaflow.app']
    : '*',
  credentials: true,
}));
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (config.env !== 'test') {
  app.use(morgan('combined', {
    stream: { write: (message) => logger.http(message.trim()) },
    skip: (req) => req.url === '/health',
  }));
}

app.use('/api/', apiLimiter);

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/store', storeRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/webhook', whatsappRoutes);
app.use('/api/track', trackRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

async function start() {
  try {
    await connectDatabase();
    await connectRedis();

    if (config.env !== 'test') {
      registerForecastJob();
      registerReportJob();
    }

    initializeSocket(server);

    server.listen(config.port, '0.0.0.0', () => {
      logger.info(`
╔═══════════════════════════════════════════╗
║         KiranaFlow API Server v1.0       ║
║───────────────────────────────────────────║
║  Environment: ${config.env.padEnd(28)}║
║  Port:        ${String(config.port).padEnd(28)}║
║  Database:    PostgreSQL                  ║
║  Cache:       Redis                       ║
║  Socket.io:   Active                      ║
╚═══════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
}

async function gracefulShutdown(signal) {
  logger.info(`${signal} received, shutting down gracefully...`);
  await shutdownQueues();
  closeSocket();
  await disconnectDatabase();
  process.exit(0);
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

process.on('unhandledRejection', (reason) => {
  logger.error(`Unhandled Rejection: ${reason}`);
});

process.on('uncaughtException', (error) => {
  logger.error(`Uncaught Exception: ${error.message}`);
  process.exit(1);
});

if (require.main === module) {
  start();
}

module.exports = { app, server, start };
