const { Router } = require('express');
const habitCtrl = require('../controllers/habit.controller');
const authenticate = require('../middleware/authenticate');
const validate = require('../middleware/validate');
const { createHabitSchema, updateHabitSchema } = require('../utils/schemas');

const router = Router();

router.use(authenticate);

router.get('/', habitCtrl.list);
router.get('/templates', habitCtrl.templates);
router.get('/:id', habitCtrl.getById);
router.post('/', validate(createHabitSchema), habitCtrl.create);
router.patch('/:id', validate(updateHabitSchema), habitCtrl.update);
router.delete('/:id', habitCtrl.remove);

module.exports = router;
