import { motion } from 'framer-motion';
import { Link2 } from 'lucide-react';

function getCorrelationLabel(value) {
  if (value >= 90) return { text: 'Strong habit pair', className: 'correlation-label-strong' };
  if (value >= 70) return { text: 'Good habit pair', className: 'correlation-label-good' };
  if (value >= 50) return { text: 'Moderate habit pair', className: 'correlation-label-moderate' };
  return { text: 'Weak habit pair', className: 'correlation-label-weak' };
}

export default function HabitCorrelation({ correlations }) {
  const isEmpty = !correlations || correlations.length === 0;

  return (
    <div className="analytics-card correlation-card">
      <h4 className="analytics-card-title">
        <Link2 size={16} /> Habit Correlations
      </h4>
      <p className="correlation-subtitle">
        Discover habits you often complete together.
      </p>

      {isEmpty ? (
        <div className="correlation-empty">
          <p className="correlation-empty-title">Not enough data yet.</p>
          <p className="correlation-empty-hint">Complete more habits to discover patterns.</p>
        </div>
      ) : (
        <div className="correlation-list">
          {correlations.map((c, i) => {
            const label = getCorrelationLabel(c.correlation);
            return (
              <motion.div
                key={`${c.habitA}-${c.habitB}`}
                className="correlation-entry"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <div className="correlation-pair">
                  <span className="correlation-habit">{c.habitA}</span>
                  <span className="correlation-separator">&#8596;</span>
                  <span className="correlation-habit">{c.habitB}</span>
                </div>
                <span className="correlation-pct">{c.correlation}% correlation</span>
                <div className="correlation-bar">
                  <motion.div
                    className="correlation-bar-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${c.correlation}%` }}
                    transition={{ duration: 0.5, delay: i * 0.08 }}
                  />
                </div>
                <span className={`correlation-label ${label.className}`}>{label.text}</span>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
