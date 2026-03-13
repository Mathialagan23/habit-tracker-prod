const User = require('../models/User');
const Habit = require('../models/Habit');
const HabitLog = require('../models/HabitLog');
const AppError = require('../utils/AppError');

class UserService {
  async updateProfile(userId, data) {
    if (data.email) {
      const existing = await User.findOne({ email: data.email, _id: { $ne: userId } });
      if (existing) throw new AppError('Email already in use', 409, 'EMAIL_EXISTS');
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: data },
      { new: true, runValidators: true }
    );
    if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    return user;
  }

  async changePassword(userId, { currentPassword, newPassword }) {
    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');

    const valid = await user.comparePassword(currentPassword);
    if (!valid) throw new AppError('Current password is incorrect', 401, 'INVALID_PASSWORD');

    user.passwordHash = newPassword;
    await user.save();

    return { message: 'Password updated' };
  }

  async deleteAccount(userId) {
    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');

    await HabitLog.deleteMany({ userId });
    await Habit.deleteMany({ userId });
    await User.findByIdAndDelete(userId);

    return { message: 'Account deleted' };
  }
}

module.exports = new UserService();
