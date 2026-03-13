/**
 * DEPRECATED: Weekly report scheduling has been migrated to Cloud Scheduler.
 *
 * Weekly reports are now triggered via HTTP: POST /jobs/weekly-reports
 * Core logic lives in: services/weeklyReport.service.js
 *
 * This file is kept for reference only.
 * The startWeeklyReportJob export is a no-op to prevent breakage if
 * anything still imports it.
 */
const logger = require('../utils/logger');

const startWeeklyReportJob = () => {
  logger.info(
    'startWeeklyReportJob() is deprecated — weekly reports are now triggered via POST /jobs/weekly-reports (Cloud Scheduler)'
  );
};

module.exports = { startWeeklyReportJob };
