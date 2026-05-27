const Redis = require('ioredis');
const config = require('./index');
const logger = require('./logger');

let redis;

function createRedisClient() {
  redis = new Redis(config.redis.url, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      if (times > 3) {
        logger.error('Redis connection failed after 3 retries');
        return null;
      }
      return Math.min(times * 200, 2000);
    },
    lazyConnect: true,
  });

  redis.on('connect', () => logger.info('Connected to Redis'));
  redis.on('error', (err) => logger.error(`Redis error: ${err.message}`));
  redis.on('close', () => logger.warn('Redis connection closed'));

  return redis;
}

async function connectRedis() {
  if (!redis) createRedisClient();
  try {
    await redis.connect();
  } catch (error) {
    logger.warn(`Redis connection failed (non-fatal): ${error.message}`);
  }
  return redis;
}

function getRedis() {
  if (!redis) createRedisClient();
  return redis;
}

module.exports = { connectRedis, getRedis };
