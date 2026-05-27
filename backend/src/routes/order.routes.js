const { Router } = require('express');
const controller = require('../controllers/order.controller');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = Router();

router.use(authenticate(['owner']));

router.get('/', controller.listOrders);
router.get('/pending', controller.getPendingOrders);
router.post('/', validate(controller.createOrderSchema), controller.createOrder);
router.get('/:id', controller.getOrder);
router.put('/:id/status', validate(controller.updateStatusSchema), controller.updateOrderStatus);
router.post('/:id/assign', validate(controller.assignSchema), controller.assignOrder);

module.exports = router;
