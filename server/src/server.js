const mongoose = require('mongoose');
const app = require('./app');
const config = require('./config');
const connectDB = require('./config/database');
const achievementService = require('./services/achievement.service');
const logger = require('./utils/logger');
require('./models/HabitLog'); // Ensure model is registered before syncIndexes

/**
 * Drop the old habitId+date unique index that prevents multi-schedule logging.
 * The new index is habitId+date+scheduleTime (defined in HabitLog model).
 * This runs once — after the old index is gone it becomes a no-op.
 */
const migrateHabitLogIndex = async () => {
  try {
    const collection = mongoose.connection.collection('habitlogs');
    const indexes = await collection.indexes();
    const oldIndex = indexes.find(
      (idx) =>
        idx.unique &&
        idx.key &&
        idx.key.habitId === 1 &&
        idx.key.date === 1 &&
        !idx.key.scheduleTime
    );
    if (oldIndex) {
      await collection.dropIndex(oldIndex.name);
      logger.info(`Dropped stale index "${oldIndex.name}" on habitlogs`);
    }
  } catch (err) {
    // Collection may not exist yet on fresh installs — safe to ignore
    if (err.codeName !== 'NamespaceNotFound') {
      logger.warn({ err }, 'Index migration check failed (non-fatal)');
    }
  }
};

const start = async () => {
  const server = app.listen(config.port, () => {
    logger.info(`Server running on port ${config.port} [${config.nodeEnv}]`);
  });

  try {
    await connectDB();

    await migrateHabitLogIndex();
    await mongoose.model('HabitLog').syncIndexes();

    await achievementService.seed();
  } catch (err) {
    logger.error({ err }, 'Startup tasks failed');
  }

  const shutdown = async (signal) => {
    logger.info({ signal }, 'Shutting down server');
    server.close();
    await mongoose.connection.close();
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

start().catch((err) => {
  logger.error({ err }, 'Server startup failed');
  process.exit(1);
});
