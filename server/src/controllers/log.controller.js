const logService = require('../services/log.service');

function timeToMinutes(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

exports.create = async (req, res, next) => {
  try {
    const { scheduleTime } = req.body;

    if (scheduleTime) {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const nowMin = timeToMinutes(currentTime);
      const schedMin = timeToMinutes(scheduleTime);

      // Allow completing up to 60 minutes early
      if (schedMin - nowMin > 60) {
        return res.status(400).json({
          error: { message: `Too early to complete this habit. Available at ${scheduleTime}.` },
        });
      }
    }

    const log = await logService.create(req.params.habitId, req.user.id, req.body);
    res.status(201).json({ data: log });
  } catch (err) {
    next(err);
  }
};

exports.getByHabit = async (req, res, next) => {
  try {
    const logs = await logService.getByHabit(req.params.habitId, req.user.id, {
      from: req.query.from,
      to: req.query.to,
    });
    res.json({ data: logs });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const result = await logService.remove(req.params.logId, req.user.id);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
};
