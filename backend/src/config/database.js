const { PrismaClient } = require('@prisma/client');
const logger = require('./logger');

const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'event', level: 'error' },
    { emit: 'event', level: 'info' },
    { emit: 'event', level: 'warn' },
  ],
});

prisma.$on('error', (e) => {
  logger.error(`Prisma Error: ${e.message}`);
});

if (process.env.NODE_ENV === 'development') {
  prisma.$on('query', (e) => {
    logger.debug(`Query: ${e.query} | Params: ${e.params} | Duration: ${e.duration}ms`);
  });
}

async function connectDatabase() {
  try {
    await prisma.$connect();
    logger.info('Connected to PostgreSQL via Prisma');
  } catch (error) {
    logger.error(`Database connection failed: ${error.message}`);
    process.exit(1);
  }
}

async function disconnectDatabase() {
  await prisma.$disconnect();
  logger.info('Disconnected from database');
}

module.exports = { prisma, connectDatabase, disconnectDatabase };
