import { motion } from 'framer-motion';

export default function HabitSuccessRates({ rates }) {
  if (!rates || rates.length === 0) return null;

  return (
    <div className="analytics-card success-rates-card">
      <h4 className="analytics-card-title">Habit Success Rates</h4>
      <div className="success-rates-list">
        {rates.map((r, i) => (
          <motion.div
            key={r.habitId}
            className="success-rate-row"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div className="success-rate-header">
              <span className="success-rate-name">{r.habitName}</span>
              <span className="success-rate-pct">{r.successRate}%</span>
            </div>
            <div className="success-rate-bar">
              <motion.div
                className="success-rate-fill"
                style={{ background: r.color || 'var(--primary)' }}
                initial={{ width: 0 }}
                animate={{ width: `${r.successRate}%` }}
                transition={{ duration: 0.6, delay: i * 0.05 }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
