const HabitLog = require('../models/HabitLog');
const Habit = require('../models/Habit');
const streakService = require('./streak.service');
const xpService = require('./xp.service');
const achievementService = require('./achievement.service');
const cacheService = require('./cache.service');
const { normalizeDate, todayUTC } = require('../utils/date');
const AppError = require('../utils/AppError');

// Streak milestones that award bonus XP (streak length → XP)
const STREAK_MILESTONES = [
  { streak: 7, xp: 50 },
  { streak: 14, xp: 75 },
  { streak: 30, xp: 150 },
  { streak: 60, xp: 300 },
  { streak: 100, xp: 500 },
];

class LogService {
  async create(habitId, userId, { date, note, scheduleTime } = {}) {
    const habit = await Habit.findOne({ _id: habitId, userId });
    if (!habit) throw new AppError('Habit not found', 404, 'HABIT_NOT_FOUND');

    const logDate = date ? normalizeDate(date) : todayUTC();
    const st = scheduleTime || null;

    const filter = { habitId, date: logDate, scheduleTime: st };
    const log = await HabitLog.findOneAndUpdate(
      filter,
      { habitId, userId, date: logDate, scheduleTime: st, note: note || '', completedAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const previousStreak = habit.currentStreak || 0;
    const { currentStreak } = await streakService.recalculate(habitId);

    // Habit completion XP: +5 base
    await xpService.addXP(userId, 5, 'habit_completion');

    // Weekly streak milestone: +50 XP when streak crosses a 7-day boundary
    for (const milestone of STREAK_MILESTONES) {
      if (currentStreak >= milestone.streak && previousStreak < milestone.streak) {
        await xpService.addXP(userId, milestone.xp, 'weekly_streak');
        break;
      }
    }

    // Check achievements (may grant additional XP per achievement.xpReward)
    await achievementService.checkAchievements(userId);

    await Promise.all([
      cacheService.del(`dashboard:${userId}`),
      cacheService.del(`streaks:${userId}`),
      cacheService.del(`heatmap:${userId}`),
      cacheService.del(`scores:${userId}`),
    ]);

    return log;
  }

  async remove(logId, userId) {
    const log = await HabitLog.findOne({ _id: logId, userId });
    if (!log) throw new AppError('Log not found', 404, 'LOG_NOT_FOUND');

    await HabitLog.deleteOne({ _id: logId });

    await streakService.recalculate(log.habitId);

    await Promise.all([
      cacheService.del(`dashboard:${userId}`),
      cacheService.del(`streaks:${userId}`),
      cacheService.del(`heatmap:${userId}`),
      cacheService.del(`scores:${userId}`),
    ]);

    return { deleted: true };
  }

  async getByHabit(habitId, userId, { from, to } = {}) {
    const filter = { habitId, userId };
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = normalizeDate(from);
      if (to) filter.date.$lte = normalizeDate(to);
    }
    return HabitLog.find(filter).sort({ date: -1 });
  }

  async getByDate(userId, date) {
    return HabitLog.find({ userId, date: normalizeDate(date) });
  }
}

module.exports = new LogService();
