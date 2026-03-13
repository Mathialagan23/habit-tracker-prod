import { motion } from 'framer-motion';

export default function ConsistencyScoreCard({ score, level }) {
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  const levelColor =
    level === 'Excellent' ? '#10b981' :
    level === 'Very Consistent' ? '#6366f1' :
    level === 'Moderate' ? '#f59e0b' :
    '#f43f5e';

  return (
    <div className="analytics-card consistency-card">
      <h4 className="analytics-card-title">Consistency Score</h4>
      <div className="consistency-chart">
        <svg width="128" height="128" viewBox="0 0 128 128">
          <circle
            cx="64" cy="64" r="54"
            fill="none"
            stroke="var(--border)"
            strokeWidth="8"
          />
          <motion.circle
            cx="64" cy="64" r="54"
            fill="none"
            stroke={levelColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: 'easeOut' }}
            transform="rotate(-90 64 64)"
          />
        </svg>
        <div className="consistency-value">
          <span className="consistency-number">{score}</span>
          <span className="consistency-max">/ 100</span>
        </div>
      </div>
      <span className="consistency-level" style={{ color: levelColor }}>{level}</span>
    </div>
  );
}
