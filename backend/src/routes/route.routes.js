const { Router } = require('express');
const controller = require('../controllers/route.controller');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = Router();

router.use(authenticate(['owner']));

router.post('/optimize', validate(controller.optimizeSchema), controller.optimize);
router.get('/batches', controller.listBatches);
router.get('/batches/:id', controller.getBatch);
router.put('/batches/:id/start', controller.startBatch);

module.exports = router;
