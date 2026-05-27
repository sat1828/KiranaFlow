const rateLimit = require('express-rate-limit');
const { getRedis } = require('../config/redis');

let createRedisStore;
try {
  const RateLimitRedis = require('rate-limit-redis');
  createRedisStore = (client) => {
    const RedisStore = RateLimitRedis.default || RateLimitRedis;
    return new RedisStore({ sendCommand: (...args) => client.call(...args) });
  };
} catch {
  createRedisStore = null;
}

function createLimiter(opts) {
  const redisClient = getRedis();
  const store = redisClient && createRedisStore ? createRedisStore(redisClient) : undefined;

  return rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later' },
    ...(store ? { store } : {}),
    ...opts,
  });
}

const apiLimiter = createLimiter();
const authLimiter = createLimiter({ max: 20 });
const publicLimiter = createLimiter({ max: 1000 });

module.exports = { apiLimiter, authLimiter, publicLimiter };
