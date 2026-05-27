const { Router } = require('express');
const controller = require('../controllers/driver.controller');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = Router();

router.get('/me/orders', authenticate(['driver']), controller.getMyOrders);
router.put('/me/location', authenticate(['driver']), validate(controller.locationSchema), controller.updateDriverLocation);
router.put('/:id/deliver/:orderId', authenticate(['driver']), controller.markDelivered);

router.use(authenticate(['owner']));

router.get('/', controller.listDrivers);
router.post('/', validate(controller.createDriverSchema), controller.createDriver);
router.put('/:id', validate(controller.updateDriverSchema), controller.updateDriver);
router.delete('/:id', controller.deleteDriver);
router.put('/:id/duty', controller.toggleDuty);
router.get('/:id/location', controller.getDriverLocation);
router.get('/:id/history', controller.getDriverHistory);

module.exports = router;
