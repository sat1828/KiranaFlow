const Joi = require('joi');
const config = require('../config');
const { prisma } = require('../config/database');
const authService = require('../services/auth.service');
const twilioService = require('../services/twilio.service');
const logger = require('../config/logger');

const sendOtpSchema = Joi.object({
  phone: Joi.string().pattern(/^\+\d{10,15}$/).required().messages({
    'string.pattern.base': 'Phone must be in international format (e.g., +919876543210)',
  }),
  name: Joi.string().max(100).optional(),
  role: Joi.string().valid('owner', 'driver').default('owner'),
});

const verifyOtpSchema = Joi.object({
  phone: Joi.string().pattern(/^\+\d{10,15}$/).required(),
  otp: Joi.string().length(6).required(),
  name: Joi.string().max(100).optional(),
  role: Joi.string().valid('owner', 'driver').default('owner'),
});

const refreshSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

async function sendOTP(req, res, next) {
  try {
    const { phone, role } = req.body;
    const result = await authService.sendOTP(phone);

    if (config.env === 'development') {
      const redis = require('../config/redis').getRedis();
      const stored = await redis.get(`otp:${phone}`);
      const data = JSON.parse(stored);
      return res.json({
        ...result,
        devOtp: data.otp,
        message: 'OTP sent (dev mode: check response for OTP)',
      });
    }

    try {
      const stored = await require('../config/redis').getRedis().get(`otp:${phone}`);
      const realOtp = stored ? JSON.parse(stored).otp : '123456';
      await twilioService.sendOTPViaWhatsApp(phone, realOtp);
    } catch (twilioError) {
      logger.warn(`Twilio send failed: ${twilioError.message}`);
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function verifyOTP(req, res, next) {
  try {
    const { phone, otp, name, role } = req.body;

    const result = await authService.verifyOTP(phone, otp);
    if (!result.success) {
      return res.status(401).json({ error: result.error });
    }

    let user;
    let payload;

    if (role === 'driver') {
      user = await authService.createOrGetDriver(null, phone, name);
      payload = { phone, role: 'driver', driverId: user.id, storeId: user.storeId };
    } else {
      user = await authService.createOrGetStore(phone, name);
      payload = { phone, role: 'owner', storeId: user.id };
    }

    const tokens = authService.generateTokens(payload);
    await authService.storeRefreshToken(
      tokens.refreshToken,
      phone,
      payload.role,
      payload.storeId || null,
      payload.driverId || null
    );

    res.json({
      ...tokens,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.ownerName || user.name,
        storeName: user.storeName || null,
        role: payload.role,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function refreshToken(req, res, next) {
  try {
    const { refreshToken } = req.body;

    const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!stored || stored.expiresAt < new Date()) {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);

    await authService.invalidateRefreshToken(refreshToken);

    const payload = {
      phone: decoded.phone,
      role: decoded.role,
      storeId: decoded.storeId,
      driverId: decoded.driverId,
    };

    const tokens = authService.generateTokens(payload);
    await authService.storeRefreshToken(
      tokens.refreshToken,
      payload.phone,
      payload.role,
      payload.storeId,
      payload.driverId
    );

    res.json(tokens);
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }
    next(error);
  }
}

async function logout(req, res, next) {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await authService.invalidateRefreshToken(refreshToken);
    } else if (req.user?.phone) {
      await authService.invalidateAllUserTokens(req.user.phone);
    }
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  sendOtpSchema,
  verifyOtpSchema,
  refreshSchema,
  sendOTP,
  verifyOTP,
  refreshToken,
  logout,
};
