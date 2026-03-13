const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      default: 'trophy',
    },
    condition: {
      type: {
        type: String,
        enum: ['habits_created', 'habits_completed', 'streak'],
        required: true,
      },
      value: {
        type: Number,
        required: true,
      },
    },
    xpReward: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Achievement', achievementSchema);
