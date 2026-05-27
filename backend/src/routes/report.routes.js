const { Router } = require('express');
const controller = require('../controllers/report.controller');
const { authenticate } = require('../middleware/auth');

const router = Router();

router.use(authenticate(['owner']));

router.get('/daily', controller.getDailyReport);
router.get('/weekly', controller.getWeeklyReport);
router.get('/driver/:id', controller.getDriverReport);
router.post('/generate', controller.triggerReport);

module.exports = router;
