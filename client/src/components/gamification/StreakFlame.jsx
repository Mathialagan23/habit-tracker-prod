import { motion } from 'framer-motion';

const TIERS = [
  { min: 100, label: 'Legendary', color: '#8b5cf6' },
  { min: 30, label: 'Gold', color: '#f59e0b' },
  { min: 7, label: 'Silver', color: '#94a3b8' },
  { min: 3, label: 'Bronze', color: '#f97316' },
];

function getTier(streak) {
  return TIERS.find((t) => streak >= t.min) || null;
}

export default function StreakFlame({ streak, habitName }) {
  const tier = getTier(streak);

  if (!streak || streak < 1) {
    return (
      <div className="streak-flame streak-flame-empty">
        <span className="streak-flame-icon">🔥</span>
        <div className="streak-flame-info">
          <span className="streak-flame-count">No active streak</span>
          <span className="streak-flame-sub">Complete a habit to start</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="streak-flame"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <span className="streak-flame-icon" style={{ color: tier?.color || '#f59e0b' }}>
        🔥
      </span>
      <div className="streak-flame-info">
        <span className="streak-flame-label">Best Streak</span>
        <span className="streak-flame-count">
          {streak} {streak === 1 ? 'day' : 'days'}
        </span>
        {habitName && (
          <span className="streak-flame-habit">{habitName}</span>
        )}
        {tier && (
          <span className="streak-flame-tier" style={{ color: tier.color }}>
            {tier.label}
          </span>
        )}
      </div>
    </motion.div>
  );
}
