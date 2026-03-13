import { Trophy, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BestDayCard({ bestDay, completionCount, dayCounts }) {
  const maxCount = Math.max(1, ...Object.values(dayCounts || {}));
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dayKeys = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="analytics-card best-day-card">
      <h4 className="analytics-card-title">
        <Calendar size={16} /> Best Productivity Day
      </h4>
      <div className="best-day-highlight">
        <Trophy size={24} style={{ color: '#f59e0b' }} />
        <div>
          <span className="best-day-name">{bestDay}</span>
          <span className="best-day-count">{completionCount} completions</span>
        </div>
      </div>
      <div className="best-day-bars">
        {dayKeys.map((key, i) => {
          const count = dayCounts?.[key] || 0;
          const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
          const isHighest = key === bestDay;
          return (
            <div key={key} className="best-day-bar-col">
              <div className="best-day-bar-track">
                <motion.div
                  className={`best-day-bar-fill ${isHighest ? 'highlight' : ''}`}
                  initial={{ height: 0 }}
                  animate={{ height: `${pct}%` }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                />
              </div>
              <span className="best-day-bar-label">{days[i]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
