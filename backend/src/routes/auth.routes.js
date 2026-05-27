const { Router } = require('express');
const controller = require('../controllers/auth.controller');
const { validate } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

const router = Router();

router.post('/send-otp', authLimiter, validate(controller.sendOtpSchema), controller.sendOTP);
router.post('/verify-otp', authLimiter, validate(controller.verifyOtpSchema), controller.verifyOTP);
router.post('/refresh', validate(controller.refreshSchema), controller.refreshToken);
router.post('/logout', authenticate, controller.logout);

module.exports = router;
