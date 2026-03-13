const mongoose = require('mongoose');

const analyticsSnapshotSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    period: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      required: true,
    },
    periodStart: {
      type: Date,
      required: true,
    },
    totalCompleted: {
      type: Number,
      default: 0,
    },
    completionRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 1,
    },
    habitBreakdown: [
      {
        habitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Habit' },
        count: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true }
);

analyticsSnapshotSchema.index({ userId: 1, period: 1, periodStart: -1 });
analyticsSnapshotSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 86400 });

module.exports = mongoose.model('AnalyticsSnapshot', analyticsSnapshotSchema);
