const { Router } = require('express');
const controller = require('../controllers/order.controller');
const { publicLimiter } = require('../middleware/rateLimiter');

const router = Router();

router.get('/:orderId', publicLimiter, controller.trackOrder);

module.exports = router;
