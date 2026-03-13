const Habit = require('../models/Habit');
const HabitLog = require('../models/HabitLog');
const { todayUTC, daysBetween } = require('../utils/date');

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

class PremiumAnalyticsService {
  /**
   * Calculate completion percentage for each habit.
   * successRate = (logCount / daysSinceCreation) * 100
   */
  async getHabitSuccessRates(userId) {
    const habits = await Habit.find({ userId, isArchived: false }).lean();
    const today = todayUTC();
    const results = [];

    for (const habit of habits) {
      const logCount = await HabitLog.countDocuments({ habitId: habit._id });
      const totalDays = Math.max(1, daysBetween(habit.createdAt, today));
      const successRate = Math.min(100, Math.round((logCount / totalDays) * 100));

      results.push({
        habitId: habit._id,
        habitName: habit.name,
        color: habit.color,
        category: habit.category,
        successRate,
        completedDays: logCount,
        totalDays,
      });
    }

    results.sort((a, b) => b.successRate - a.successRate);
    return results;
  }

  /**
   * Measure overall completion consistency across all habits.
   */
  async getConsistencyScore(userId) {
    const habits = await Habit.find({ userId, isArchived: false }).lean();
    if (habits.length === 0) {
      return { score: 0, level: 'Needs Improvement' };
    }

    const today = todayUTC();
    let totalExpected = 0;
    let totalCompleted = 0;

    for (const habit of habits) {
      const days = Math.max(1, daysBetween(habit.createdAt, today));
      totalExpected += days;
      totalCompleted += await HabitLog.countDocuments({ habitId: habit._id });
    }

    const score = totalExpected > 0
      ? Math.min(100, Math.round((totalCompleted / totalExpected) * 100))
      : 0;

    let level;
    if (score >= 90) level = 'Excellent';
    else if (score >= 75) level = 'Very Consistent';
    else if (score >= 50) level = 'Moderate';
    else level = 'Needs Improvement';

    return { score, level };
  }

  /**
   * Find which weekday the user completes the most habits.
   */
  async getBestProductivityDay(userId) {
    const logs = await HabitLog.find({ userId }).select('date').lean();

    const dayCounts = { Sunday: 0, Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0, Friday: 0, Saturday: 0 };

    for (const log of logs) {
      const dayName = DAY_NAMES[new Date(log.date).getUTCDay()];
      dayCounts[dayName]++;
    }

    const entries = Object.entries(dayCounts);
    const best = entries.reduce((max, curr) => (curr[1] > max[1] ? curr : max), entries[0]);

    return {
      bestDay: best[0],
      completionCount: best[1],
      dayCounts,
    };
  }

  /**
   * Find habit with highest completion rate.
   */
  async getMostConsistentHabit(userId) {
    const rates = await this.getHabitSuccessRates(userId);
    if (rates.length === 0) return null;
    return rates[0]; // already sorted descending
  }

  /**
   * Detect habits completed together on the same day.
   */
  async getHabitCorrelation(userId) {
    // Include all habits (not just active) so archived habit names still resolve
    const habits = await Habit.find({ userId }).select('name').lean();
    if (habits.length < 2) return [];

    const habitMap = {};
    for (const h of habits) {
      habitMap[h._id.toString()] = h.name;
    }

    const logs = await HabitLog.find({ userId }).select('habitId date').lean();

    // Group by normalized date string
    const byDate = {};
    for (const log of logs) {
      const key = new Date(log.date).toISOString().slice(0, 10);
      if (!byDate[key]) byDate[key] = new Set();
      byDate[key].add(log.habitId.toString());
    }

    // Count pair co-occurrences
    const pairCounts = {};
    const habitCounts = {};

    for (const log of logs) {
      const id = log.habitId.toString();
      habitCounts[id] = (habitCounts[id] || 0) + 1;
    }

    const dates = Object.values(byDate);
    for (const habitSet of dates) {
      const ids = Array.from(habitSet);
      for (let i = 0; i < ids.length; i++) {
        for (let j = i + 1; j < ids.length; j++) {
          const key = [ids[i], ids[j]].sort().join(':');
          pairCounts[key] = (pairCounts[key] || 0) + 1;
        }
      }
    }

    // Calculate correlation percentage with safety checks
    const correlations = Object.entries(pairCounts)
      .map(([key, count]) => {
        // Skip pairs with too few data points
        if (count < 2) return null;

        const [idA, idB] = key.split(':');
        const countA = habitCounts[idA] ?? 0;
        const countB = habitCounts[idB] ?? 0;
        const minCount = Math.min(countA, countB);

        if (minCount === 0) return null;

        const nameA = habitMap[idA];
        const nameB = habitMap[idB];

        // Skip if either habit was deleted (no longer in DB)
        if (!nameA || !nameB) return null;

        return {
          habitA: nameA,
          habitB: nameB,
          correlation: Math.min(100, Math.round((count / minCount) * 100)),
          coOccurrences: count,
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.correlation - a.correlation)
      .slice(0, 5);

    return correlations;
  }

  /**
   * Get all premium analytics combined.
   */
  async getAll(userId) {
    const [consistencyScore, bestDay, mostConsistentHabit, habitSuccessRates, correlations] =
      await Promise.all([
        this.getConsistencyScore(userId),
        this.getBestProductivityDay(userId),
        this.getMostConsistentHabit(userId),
        this.getHabitSuccessRates(userId),
        this.getHabitCorrelation(userId),
      ]);

    return {
      consistencyScore,
      bestDay,
      mostConsistentHabit,
      habitSuccessRates,
      correlations,
    };
  }
}

module.exports = new PremiumAnalyticsService();
