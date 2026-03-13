const { Router } = require('express');
const logCtrl = require('../controllers/log.controller');
const authenticate = require('../middleware/authenticate');
const validate = require('../middleware/validate');
const { createLogSchema } = require('../utils/schemas');

const router = Router();

router.use(authenticate);

router.post('/:habitId/logs', validate(createLogSchema), logCtrl.create);
router.get('/:habitId/logs', logCtrl.getByHabit);
router.delete('/:habitId/logs/:logId', logCtrl.remove);

module.exports = router;
