const statsService = require('../services/stats.service');
const User = require('../models/User');
const Achievement = require('../models/Achievement');

exports.dashboard = async (req, res, next) => {
  try {
    const data = await statsService.getDashboard(req.user.id);
    res.json({ data });
  } catch (err) {
    next(err);
  }
};

exports.streaks = async (req, res, next) => {
  try {
    const data = await statsService.getStreaks(req.user.id);
    res.json({ data });
  } catch (err) {
    next(err);
  }
};

exports.weekly = async (req, res, next) => {
  try {
    const data = await statsService.getWeekly(req.user.id);
    res.json({ data });
  } catch (err) {
    next(err);
  }
};

exports.monthly = async (req, res, next) => {
  try {
    const data = await statsService.getMonthly(req.user.id);
    res.json({ data });
  } catch (err) {
    next(err);
  }
};

exports.heatmap = async (req, res, next) => {
  try {
    const data = await statsService.getHeatmap(req.user.id);
    res.json({ data });
  } catch (err) {
    next(err);
  }
};

exports.scores = async (req, res, next) => {
  try {
    const data = await statsService.getScores(req.user.id);
    res.json({ data });
  } catch (err) {
    next(err);
  }
};

exports.gamification = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .select('xp level achievements')
      .populate('achievements')
      .lean();

    const allAchievements = await Achievement.find().lean();
    const unlockedIds = new Set(user.achievements.map((a) => a._id.toString()));

    const achievements = allAchievements.map((a) => ({
      ...a,
      unlocked: unlockedIds.has(a._id.toString()),
    }));

    res.json({
      data: {
        xp: user.xp || 0,
        level: user.level || 1,
        achievements,
      },
    });
  } catch (err) {
    next(err);
  }
};
