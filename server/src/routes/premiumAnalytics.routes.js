const { Router } = require('express');
const premiumAnalyticsCtrl = require('../controllers/premiumAnalytics.controller');
const authenticate = require('../middleware/authenticate');

const router = Router();

router.use(authenticate);

router.get('/premium', premiumAnalyticsCtrl.getPremiumAnalytics);

module.exports = router;
