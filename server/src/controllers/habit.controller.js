const habitService = require('../services/habit.service');
const habitTemplates = require('../data/habitTemplates');

exports.list = async (req, res, next) => {
  try {
    const includeArchived = req.query.archived === 'true';
    const habits = await habitService.list(req.user.id, includeArchived);
    res.json({ data: habits });
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const habit = await habitService.getById(req.params.id, req.user.id);
    res.json({ data: habit });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const habit = await habitService.create(req.user.id, req.body);
    res.status(201).json({ data: habit });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const habit = await habitService.update(req.params.id, req.user.id, req.body);
    res.json({ data: habit });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const result = await habitService.delete(req.params.id, req.user.id);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
};

exports.templates = (_req, res) => {
  res.json({ data: habitTemplates });
};
