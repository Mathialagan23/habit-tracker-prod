const mongoose = require('mongoose');

const habitLogSchema = new mongoose.Schema(
  {
    habitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Habit',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    scheduleTime: {
      type: String,
      default: null,
    },
    note: {
      type: String,
      maxlength: 500,
      default: '',
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

habitLogSchema.index({ habitId: 1, date: 1, scheduleTime: 1 }, { unique: true });
habitLogSchema.index({ userId: 1, date: 1 });
habitLogSchema.index({ habitId: 1, date: -1 });

module.exports = mongoose.model('HabitLog', habitLogSchema);
