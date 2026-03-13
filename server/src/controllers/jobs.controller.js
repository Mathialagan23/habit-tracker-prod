const { processReminders } = require('../services/reminder.service');
const { processWeeklyReports } = require('../services/weeklyReport.service');
const logger = require('../utils/logger');

const runReminders = async (req, res, next) => {
  try {
    logger.info({ event: 'job_endpoint_hit', job: 'reminders' }, 'Reminders job triggered via HTTP');

    const processed = await processReminders();

    res.json({ success: true, processed });
  } catch (err) {
    next(err);
  }
};

const runWeeklyReports = async (req, res, next) => {
  try {
    logger.info({ event: 'job_endpoint_hit', job: 'weekly-reports' }, 'Weekly reports job triggered via HTTP');

    const processed = await processWeeklyReports();

    res.json({ success: true, processed });
  } catch (err) {
    next(err);
  }
};

module.exports = { runReminders, runWeeklyReports };
