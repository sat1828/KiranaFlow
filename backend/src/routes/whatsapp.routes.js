const { Router } = require('express');
const controller = require('../controllers/whatsapp.controller');
const { publicLimiter } = require('../middleware/rateLimiter');

const router = Router();

router.post('/whatsapp', publicLimiter, controller.handleInbound);

module.exports = router;
