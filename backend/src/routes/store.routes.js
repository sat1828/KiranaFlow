const { Router } = require('express');
const controller = require('../controllers/store.controller');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = Router();

router.use(authenticate(['owner']));

router.get('/profile', controller.getProfile);
router.put('/profile', validate(controller.updateProfileSchema), controller.updateProfile);
router.get('/dashboard', controller.getDashboard);
router.get('/analytics', controller.getAnalytics);

module.exports = router;
