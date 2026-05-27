const { Router } = require('express');
const controller = require('../controllers/ai.controller');
const { authenticate } = require('../middleware/auth');

const router = Router();

router.use(authenticate(['owner']));

router.post('/forecast', controller.runForecast);
router.get('/forecast/latest', controller.getLatestForecast);
router.get('/insights', controller.getInsights);
router.post('/chat', controller.chatWithAI);

module.exports = router;
