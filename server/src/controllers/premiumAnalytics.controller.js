const premiumAnalyticsService = require('../services/premiumAnalytics.service');

exports.getPremiumAnalytics = async (req, res, next) => {
  try {
    const data = await premiumAnalyticsService.getAll(req.user.id);
    res.json({ data });
  } catch (err) {
    next(err);
  }
};
