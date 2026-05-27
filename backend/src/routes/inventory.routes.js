const { Router } = require('express');
const controller = require('../controllers/inventory.controller');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = Router();

router.use(authenticate(['owner']));

router.get('/', controller.listInventory);
router.get('/low-stock', controller.getLowStock);
router.post('/', validate(controller.createInventorySchema), controller.createInventory);
router.put('/:id', validate(controller.updateInventorySchema), controller.updateInventory);
router.post('/bulk-update', validate(controller.bulkUpdateSchema), controller.bulkUpdate);

module.exports = router;
