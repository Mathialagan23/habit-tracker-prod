const authService = require('../services/auth.service');
const User = require('../models/User');

exports.register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json({ data: result });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
};

exports.refresh = async (req, res, next) => {
  try {
    const result = await authService.refresh(req.body.refreshToken);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res, next) => {
  try {
    await authService.logout(req.user.id, req.body.refreshToken);
    res.json({ data: { message: 'Logged out' } });
  } catch (err) {
    next(err);
  }
};

exports.me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ data: user });
  } catch (err) {
    next(err);
  }
};
