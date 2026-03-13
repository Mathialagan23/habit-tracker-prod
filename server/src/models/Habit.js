const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      maxlength: 120,
    },
    description: {
      type: String,
      maxlength: 500,
      default: '',
    },
    color: {
      type: String,
      default: '#6366f1',
    },
    icon: {
      type: String,
      default: 'check',
    },
    frequency: {
      type: {
        type: String,
        enum: ['daily', 'weekly', 'custom'],
        default: 'daily',
      },
      daysOfWeek: {
        type: [Number],
        default: [0, 1, 2, 3, 4, 5, 6],
      },
    },
    category: {
      type: String,
      enum: ['fitness', 'learning', 'productivity', 'mindfulness', 'health', 'other'],
      default: 'other',
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    reminderTime: {
      type: String,
      default: null,
    },
    reminderEnabled: {
      type: Boolean,
      default: true,
    },
    schedule: {
      type: [String],
      default: [],
    },
    lastReminderSent: {
      type: Date,
      default: null
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    currentStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    bestStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

habitSchema.index({ userId: 1, isArchived: 1 });

module.exports = mongoose.model('Habit', habitSchema);
