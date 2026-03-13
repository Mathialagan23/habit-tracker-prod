const Habit = require('../models/Habit');
const HabitLog = require('../models/HabitLog');
const cacheService = require('./cache.service');
const { todayUTC, normalizeDate } = require('../utils/date');

class StatsService {
  async getDashboard(userId) {
    const cached = await cacheService.get(`dashboard:${userId}`);
    if (cached) return cached;

    const today = todayUTC();
    const weekAgo = new Date(today);
    weekAgo.setUTCDate(weekAgo.getUTCDate() - 7);

    const habits = await Habit.find({ userId, isArchived: false }).lean();
    const todayLogs = await HabitLog.find({ userId, date: today }).lean();
    const weekLogs = await HabitLog.find({
      userId,
      date: { $gte: weekAgo, $lte: today },
    }).lean();

    // Build a map of habitId -> array of completed scheduleTimes for today
    const todayLogsByHabit = {};
    for (const log of todayLogs) {
      const hid = log.habitId.toString();
      if (!todayLogsByHabit[hid]) todayLogsByHabit[hid] = [];
      todayLogsByHabit[hid].push(log.scheduleTime || null);
    }

    const habitsWithStatus = habits.map((h) => {
      const hid = h._id.toString();
      const logsForHabit = todayLogsByHabit[hid] || [];
      const isMultiSchedule = Array.isArray(h.schedule) && h.schedule.length > 1;

      if (isMultiSchedule) {
        const completedTimes = logsForHabit.filter(Boolean);
        return {
          ...h,
          completedToday: completedTimes.length >= h.schedule.length,
          dailyProgress: {
            completed: completedTimes.length,
            total: h.schedule.length,
          },
          todayScheduleLogs: completedTimes,
        };
      }

      return {
        ...h,
        completedToday: logsForHabit.length > 0,
        dailyProgress: null,
        todayScheduleLogs: [],
      };
    });

    const completedCount = habitsWithStatus.filter((h) => h.completedToday).length;

    const totalExpectedWeek = habits.length * 7;
    const weeklyCompletionRate = totalExpectedWeek > 0
      ? Math.round((weekLogs.length / totalExpectedWeek) * 100)
      : 0;

    const data = {
      habits: habitsWithStatus,
      todayCompleted: completedCount,
      todayTotal: habits.length,
      weeklyCompletionRate,
      totalActiveHabits: habits.length,
    };

    await cacheService.set(`dashboard:${userId}`, data, 300);
    return data;
  }

  async getStreaks(userId) {
    const cached = await cacheService.get(`streaks:${userId}`);
    if (cached) return cached;

    const habits = await Habit.find({ userId, isArchived: false })
      .select('name currentStreak bestStreak color icon category difficulty')
      .lean();

    await cacheService.set(`streaks:${userId}`, habits, 600);
    return habits;
  }

  async getWeekly(userId) {
    const today = todayUTC();
    const days = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setUTCDate(d.getUTCDate() - i);
      const count = await HabitLog.countDocuments({ userId, date: d });
      days.push({ date: d.toISOString().slice(0, 10), count });
    }

    return { days };
  }

  async getMonthly(userId) {
    const today = todayUTC();
    const thirtyAgo = new Date(today);
    thirtyAgo.setUTCDate(thirtyAgo.getUTCDate() - 30);

    const habits = await Habit.find({ userId, isArchived: false }).lean();
    const logs = await HabitLog.find({
      userId,
      date: { $gte: thirtyAgo, $lte: today },
    }).lean();

    const logsByDate = {};
    logs.forEach((l) => {
      const key = l.date.toISOString().slice(0, 10);
      logsByDate[key] = (logsByDate[key] || 0) + 1;
    });

    const days = [];
    for (let i = 30; i >= 0; i--) {
      const d = new Date(today);
      d.setUTCDate(d.getUTCDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push({ date: key, count: logsByDate[key] || 0, total: habits.length });
    }

    const totalExpected = habits.length * 30;
    const completionRate = totalExpected > 0 ? Math.round((logs.length / totalExpected) * 100) : 0;

    const daysWithLogs = new Set(logs.map((l) => l.date.toISOString().slice(0, 10))).size;
    const consistencyScore = Math.round((daysWithLogs / 30) * 100);

    return { days, completionRate, consistencyScore, totalLogs: logs.length };
  }

  async getHeatmap(userId) {
    const cached = await cacheService.get(`heatmap:${userId}`);
    if (cached) return cached;

    const today = todayUTC();
    const yearAgo = new Date(today);
    yearAgo.setUTCDate(yearAgo.getUTCDate() - 365);

    const pipeline = [
      { $match: { userId: require('mongoose').Types.ObjectId.createFromHexString(userId), date: { $gte: yearAgo, $lte: today } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, date: '$_id', count: 1 } },
    ];

    const data = await HabitLog.aggregate(pipeline);
    await cacheService.set(`heatmap:${userId}`, data, 600);
    return data;
  }

  async getScores(userId) {
    const cached = await cacheService.get(`scores:${userId}`);
    if (cached) return cached;

    const habits = await Habit.find({ userId, isArchived: false }).lean();
    const today = todayUTC();
    const thirtyAgo = new Date(today);
    thirtyAgo.setUTCDate(thirtyAgo.getUTCDate() - 30);

    const scores = [];

    for (const habit of habits) {
      const logCount = await HabitLog.countDocuments({
        habitId: habit._id,
        date: { $gte: thirtyAgo, $lte: today },
      });

      const completionRate = Math.min(logCount / 30, 1) * 100;
      const streakBonus = (Math.min(habit.currentStreak, 30) / 30) * 100;
      const difficultyWeight = habit.difficulty === 'hard' ? 100 : habit.difficulty === 'easy' ? 60 : 80;

      const score = Math.round(
        (completionRate * 40 + streakBonus * 35 + difficultyWeight * 25) / 100
      );

      scores.push({
        habitId: habit._id,
        name: habit.name,
        color: habit.color,
        category: habit.category,
        difficulty: habit.difficulty,
        score,
        completionRate: Math.round(completionRate),
        currentStreak: habit.currentStreak,
        bestStreak: habit.bestStreak,
      });
    }

    scores.sort((a, b) => b.score - a.score);
    await cacheService.set(`scores:${userId}`, scores, 300);
    return scores;
  }
}

module.exports = new StatsService();
