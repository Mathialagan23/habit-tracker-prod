const User = require('../models/User');
const Habit = require('../models/Habit');
const HabitLog = require('../models/HabitLog');
const emailService = require('./email.service');
const logger = require('../utils/logger');

function findTopHabit(logs, habits) {
  if (logs.length === 0) return 'None';

  const counts = {};
  for (const log of logs) {
    const id = log.habitId.toString();
    counts[id] = (counts[id] || 0) + 1;
  }

  const topId = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const habit = habits.find((h) => h._id.toString() === topId);
  return habit?.name || 'Unknown';
}

/**
 * Process weekly reports for all users.
 * Returns the number of reports successfully sent.
 */
const processWeeklyReports = async () => {
  logger.info('Starting weekly report processing');

  const users = await User.find().select('email name').lean();
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);

  let sentCount = 0;

  for (const user of users) {
    try {
      const [logs, habits] = await Promise.all([
        HabitLog.find({
          userId: user._id,
          date: { $gte: weekAgo, $lte: now },
        }).lean(),
        Habit.find({ userId: user._id, isArchived: false })
          .select('name bestStreak currentStreak')
          .lean(),
      ]);

      if (habits.length === 0) continue;

      const habitsCompleted = logs.length;
      const bestStreak = Math.max(0, ...habits.map((h) => h.currentStreak || 0));
      const topHabit = findTopHabit(logs, habits);

      await emailService.sendWeeklyReport(user.email, user.name, {
        habitsCompleted,
        bestStreak,
        topHabit,
        totalHabits: habits.length,
      });

      sentCount += 1;
    } catch (err) {
      logger.error({ err, userId: user._id }, 'Failed to send weekly report to user');
    }
  }

  logger.info({ sentCount }, 'Weekly report processing completed');
  return sentCount;
};

module.exports = { processWeeklyReports };
