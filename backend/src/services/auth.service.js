const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config');
const { prisma } = require('../config/database');
const { getRedis } = require('../config/redis');
const logger = require('../config/logger');

const OTP_EXPIRY = 10 * 60;
const OTP_MAX_ATTEMPTS = 5;

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateTokens(payload) {
  const accessToken = jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.accessExpiry,
  });
  const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiry,
  });
  return { accessToken, refreshToken };
}

async function sendOTP(phone) {
  const otp = generateOTP();
  const redis = getRedis();
  const key = `otp:${phone}`;

  try {
    await redis.setex(key, OTP_EXPIRY, JSON.stringify({
      otp,
      attempts: 0,
      createdAt: new Date().toISOString(),
    }));

    logger.info(`OTP ${otp} sent to ${phone}`);
    return { success: true, message: 'OTP sent successfully' };
  } catch (error) {
    logger.error(`Failed to store OTP: ${error.message}`);
    throw error;
  }
}

async function verifyOTP(phone, otpInput) {
  const redis = getRedis();
  const key = `otp:${phone}`;

  const stored = await redis.get(key);
  if (!stored) {
    return { success: false, error: 'OTP expired or not requested' };
  }

  const data = JSON.parse(stored);

  if (data.attempts >= OTP_MAX_ATTEMPTS) {
    await redis.del(key);
    return { success: false, error: 'Too many attempts. Request new OTP' };
  }

  await redis.setex(key, OTP_EXPIRY, JSON.stringify({
    ...data,
    attempts: data.attempts + 1,
  }));

  if (data.otp !== otpInput) {
    return { success: false, error: 'Invalid OTP' };
  }

  await redis.del(key);
  return { success: true };
}

async function createOrGetStore(phone, name) {
  let store = await prisma.store.findUnique({ where: { phone } });
  if (!store) {
      store = await prisma.store.create({
      data: {
        phone,
        ownerName: name || `Owner ${phone.slice(-4)}`,
        storeName: `${name || 'Store'} ${phone.slice(-4)}`,
        address: 'Set your store address',
        lat: 20.5937,
        lng: 78.9629,
        deliveryRadiusKm: 3.0,
      },
    });
    logger.info(`New store created: ${store.id} (${phone})`);
  }
  return store;
}

async function createOrGetDriver(storeId, phone, name) {
  let driver = await prisma.driver.findUnique({ where: { phone } });
  if (!driver) {
    const data = {
      phone,
      name: name || `Driver ${phone.slice(-4)}`,
      vehicleType: 'motorcycle',
      isActive: true,
    };
    if (storeId) {
      data.storeId = storeId;
    }
    driver = await prisma.driver.create({ data });
    logger.info(`New driver created: ${driver.id} (${phone})`);
  }
  return driver;
}

async function storeRefreshToken(token, userId, role, storeId, driverId) {
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await prisma.refreshToken.create({
    data: { token, userId, role, storeId, driverId, expiresAt },
  });
}

async function invalidateRefreshToken(token) {
  await prisma.refreshToken.deleteMany({ where: { token } });
}

async function invalidateAllUserTokens(phone) {
  await prisma.refreshToken.deleteMany({ where: { userId: phone } });
}

module.exports = {
  sendOTP,
  verifyOTP,
  generateTokens,
  createOrGetStore,
  createOrGetDriver,
  storeRefreshToken,
  invalidateRefreshToken,
  invalidateAllUserTokens,
};
