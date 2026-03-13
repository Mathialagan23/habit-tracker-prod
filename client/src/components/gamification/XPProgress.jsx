import { motion } from 'framer-motion';

export default function XPProgress({ xp, level }) {
  const xpInLevel = xp % 100;
  const xpForNext = 100;
  const percent = (xpInLevel / xpForNext) * 100;

  return (
    <div className="xp-progress">
      <div className="xp-progress-header">
        <span className="xp-level">Level {level}</span>
        <span className="xp-amount">{xpInLevel} / {xpForNext} XP</span>
      </div>
      <div className="xp-bar">
        <motion.div
          className="xp-bar-fill"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
