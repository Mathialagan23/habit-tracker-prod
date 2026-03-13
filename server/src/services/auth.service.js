const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const config = require('../config');
const AppError = require('../utils/AppError');

class AuthService {
  async register({ email, password, name }) {
    const existing = await User.findOne({ email });
    if (existing) {
      throw new AppError('Email already registered', 409, 'EMAIL_EXISTS');
    }

    const user = await User.create({ email, name, passwordHash: password });
    const tokens = this._generateTokens(user);
    await this._storeRefreshToken(user, tokens.refreshToken);

    return { user: user.toJSON(), ...tokens };
  }

  async login({ email, password }) {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    const tokens = this._generateTokens(user);
    await this._storeRefreshToken(user, tokens.refreshToken);

    return { user: user.toJSON(), ...tokens };
  }

  async refresh(oldRefreshToken) {
    let payload;
    try {
      payload = jwt.verify(oldRefreshToken, config.jwt.refreshSecret);
    } catch {
      throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH');
    }

    const user = await User.findById(payload.sub);
    if (!user) {
      throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH');
    }

    const tokenHash = this._hashToken(oldRefreshToken);
    const stored = user.refreshTokens.find((t) => t.tokenHash === tokenHash);

    if (!stored) {
      // Token reuse detected — revoke all
      user.refreshTokens = [];
      await user.save();
      throw new AppError('Token reuse detected', 401, 'TOKEN_REUSE');
    }

    // Remove old token
    await user.removeRefreshToken(oldRefreshToken);

    const tokens = this._generateTokens(user);
    await this._storeRefreshToken(user, tokens.refreshToken);

    return tokens;
  }

  async logout(userId, refreshToken) {
    const user = await User.findById(userId);
    if (user && refreshToken) {
      await user.removeRefreshToken(refreshToken);
    }
  }

  _generateTokens(user) {
    const accessToken = jwt.sign(
      { sub: user._id, email: user.email },
      config.jwt.accessSecret,
      { expiresIn: config.jwt.accessExpiresIn }
    );

    const refreshToken = jwt.sign(
      { sub: user._id },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiresIn }
    );

    return { accessToken, refreshToken };
  }

  async _storeRefreshToken(user, rawToken) {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await user.addRefreshToken(rawToken, expiresAt);
  }

  _hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}

module.exports = new AuthService();
