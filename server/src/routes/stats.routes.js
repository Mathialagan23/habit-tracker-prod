const { Router } = require('express');
const statsCtrl = require('../controllers/stats.controller');
const authenticate = require('../middleware/authenticate');

const router = Router();

router.use(authenticate);

router.get('/dashboard', statsCtrl.dashboard);
router.get('/streaks', statsCtrl.streaks);
router.get('/weekly', statsCtrl.weekly);
router.get('/monthly', statsCtrl.monthly);
router.get('/heatmap', statsCtrl.heatmap);
router.get('/scores', statsCtrl.scores);
router.get('/gamification', statsCtrl.gamification);

module.exports = router;
