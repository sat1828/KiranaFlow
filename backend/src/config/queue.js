const Bull = require('bull');
const config = require('./index');
const logger = require('./logger');

function createQueue(name) {
  const queue = new Bull(name, config.redis.url, {
    redis: { maxRetriesPerRequest: null, enableReadyCheck: false },
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: 100,
      removeOnFail: 50,
    },
    settings: {
      stalledInterval: 30000,
      maxStalledCount: 2,
    },
  });

  queue.on('completed', (job) => {
    logger.info(`Queue ${name}: Job ${job.id} completed`);
  });

  queue.on('failed', (job, err) => {
    logger.error(`Queue ${name}: Job ${job.id} failed: ${err.message}`);
  });

  queue.on('error', (err) => {
    logger.error(`Queue ${name}: ${err.message}`);
  });

  return queue;
}

const forecastQueue = createQueue('demand-forecast');
const reportQueue = createQueue('daily-report');
const whatsappQueue = createQueue('whatsapp-outbound');

async function shutdownQueues() {
  await Promise.all([
    forecastQueue.close(),
    reportQueue.close(),
    whatsappQueue.close(),
  ]);
  logger.info('All queues closed');
}

module.exports = {
  forecastQueue,
  reportQueue,
  whatsappQueue,
  createQueue,
  shutdownQueues,
};
