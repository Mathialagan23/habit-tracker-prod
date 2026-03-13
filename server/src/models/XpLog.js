const mongoose = require('mongoose');

const xpLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    source: {
      type: String,
      required: true,
      enum: ['habit_completion', 'achievement_unlock', 'weekly_streak'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('XpLog', xpLogSchema);
