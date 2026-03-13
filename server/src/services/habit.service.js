const Habit = require('../models/Habit');
const cacheService = require('./cache.service');
const achievementService = require('./achievement.service');
const AppError = require('../utils/AppError');

class HabitService {
  async list(userId, includeArchived = false) {
    const filter = { userId };
    if (!includeArchived) filter.isArchived = false;
    return Habit.find(filter).sort({ createdAt: -1 });
  }

  async getById(habitId, userId) {
    const habit = await Habit.findOne({ _id: habitId, userId });
    if (!habit) throw new AppError('Habit not found', 404, 'HABIT_NOT_FOUND');
    return habit;
  }

  async create(userId, data) {
    const habit = await Habit.create({ ...data, userId });
    await cacheService.del(`dashboard:${userId}`);

    // XP for habit creation is awarded via the 'First Habit' achievement unlock.
    // No separate grant here — doing so would double-stack with the achievement reward.
    await achievementService.checkAchievements(userId);

    return habit;
  }

  async update(habitId, userId, data) {
    const habit = await Habit.findOneAndUpdate(
      { _id: habitId, userId },
      { $set: data },
      { new: true, runValidators: true }
    );
    if (!habit) throw new AppError('Habit not found', 404, 'HABIT_NOT_FOUND');
    await cacheService.del(`dashboard:${userId}`);
    return habit;
  }

  async archive(habitId, userId) {
    return this.update(habitId, userId, { isArchived: true });
  }

  async delete(habitId, userId) {
    const habit = await Habit.findOneAndDelete({ _id: habitId, userId });
    if (!habit) throw new AppError('Habit not found', 404, 'HABIT_NOT_FOUND');
    await cacheService.del(`dashboard:${userId}`);
    return { deleted: true };
  }
}

module.exports = new HabitService();
