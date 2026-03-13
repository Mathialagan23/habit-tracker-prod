const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config');
const requestId = require('./middleware/requestId');
const errorHandler = require('./middleware/errorHandler');

// Routes
const authRoutes = require('./routes/auth.routes');
const habitRoutes = require('./routes/habit.routes');
const logRoutes = require('./routes/log.routes');
const statsRoutes = require('./routes/stats.routes');
const userRoutes = require('./routes/user.routes');
const premiumAnalyticsRoutes = require('./routes/premiumAnalytics.routes');
const jobsRoutes = require('./routes/jobs.routes');

const app = express();

// ── Global middleware ───────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: config.cors.origin, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(requestId);

if (config.nodeEnv !== 'test') {
  app.use(morgan('short'));
}

// ── Static files ────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ── Health checks ───────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.get('/ready', (_req, res) => {
  const mongoose = require('mongoose');
  const ready = mongoose.connection.readyState === 1;
  res.status(ready ? 200 : 503).json({ ready });
});

// ── API routes ──────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/habits', logRoutes); // nested: /api/habits/:habitId/logs
app.use('/api/stats', statsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', premiumAnalyticsRoutes);

// ── Job endpoints (triggered by Cloud Scheduler) ──
app.use('/jobs', jobsRoutes);

// ── 404 handler ─────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } });
});

// ── Error handler ───────────────────────────────
app.use(errorHandler);

module.exports = app;
