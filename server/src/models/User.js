const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      maxlength: 100,
    },
    avatar: {
      type: String,
      default: '',
    },
    timezone: {
      type: String,
      default: 'UTC',
    },
    preferences: {
      reminderTime: { type: String, default: '08:00' },
      emailDigest: { type: Boolean, default: false },
      pushNotifications: { type: Boolean, default: true },
      reminderSounds: { type: Boolean, default: false },
      weekStartsMonday: { type: Boolean, default: false },
    },
    xp: {
      type: Number,
      default: 0,
    },
    level: {
      type: Number,
      default: 1,
    },
    achievements: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Achievement',
      },
    ],
    refreshTokens: [
      {
        tokenHash: String,
        expiresAt: Date,
      },
    ],
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.passwordHash);
};

// Add refresh token (keep max 5)
userSchema.methods.addRefreshToken = function (token, expiresAt) {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  this.refreshTokens.push({ tokenHash, expiresAt });
  if (this.refreshTokens.length > 5) {
    this.refreshTokens = this.refreshTokens.slice(-5);
  }
  return this.save();
};

// Remove refresh token
userSchema.methods.removeRefreshToken = function (token) {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  this.refreshTokens = this.refreshTokens.filter((t) => t.tokenHash !== tokenHash);
  return this.save();
};

// JSON transform
userSchema.set('toJSON', {
  transform(_doc, ret) {
    ret.id = ret._id;
    delete ret.passwordHash;
    delete ret.refreshTokens;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
