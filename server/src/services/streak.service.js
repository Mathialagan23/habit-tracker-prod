const Habit = require('../models/Habit');
const HabitLog = require('../models/HabitLog');
const { todayUTC, daysBetween, normalizeDate } = require('../utils/date');
const logger = require('../utils/logger');

class StreakService {
  async recalculate(habitId) {
    const logs = await HabitLog.find({ habitId })
      .sort({ date: -1 })
      .select({ date: 1 })
      .lean();

    if (logs.length === 0) {
      await Habit.findByIdAndUpdate(habitId, { currentStreak: 0 });
      return { currentStreak: 0 };
    }

    // Deduplicate and normalize to UTC midnight dates
    const seen = new Set();
    const dates = [];
    for (const log of logs) {
      const key = normalizeDate(log.date).getTime();
      if (!seen.has(key)) {
        seen.add(key);
        dates.push(key);
      }
    }

    const today = todayUTC();
    const mostRecentMs = dates[0];
    const diffFromToday = daysBetween(new Date(mostRecentMs), today);

    // Allow streak if completed today (0) or yesterday (1)
    if (diffFromToday > 1) {
      await Habit.findByIdAndUpdate(habitId, { currentStreak: 0 });
      return { currentStreak: 0 };
    }

    let streak = 1;
    for (let i = 1; i < dates.length; i++) {
      const gap = daysBetween(new Date(dates[i - 1]), new Date(dates[i]));
      if (gap === 1) {
        streak++;
      } else {
        break;
      }
    }

    const habit = await Habit.findById(habitId);
    habit.currentStreak = streak;
    if (streak > habit.bestStreak) {
      habit.bestStreak = streak;
    }
    await habit.save();

    return { currentStreak: streak };
  }
}

module.exports = new StreakService();
