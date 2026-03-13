export default function MonthlyChart({ data }) {
  if (!data) return null;

  const days = Array.isArray(data.days) ? data.days : [];
  const today = new Date().toISOString().slice(0, 10);
  const max = Math.max(...days.map((d) => d.count), 1);

  const getIntensity = (count) => {
    if (count === 0) return 0;
    const ratio = count / max;
    if (ratio <= 0.25) return 1;
    if (ratio <= 0.5) return 2;
    if (ratio <= 0.75) return 3;
    return 4;
  };

  return (
    <div className="monthly-chart">
      <div className="monthly-chart-header">
        <h3>Monthly Progress</h3>
        <div className="monthly-stats">
          <span className="monthly-stat">
            Rate: <strong>{data.completionRate || 0}%</strong>
          </span>
          <span className="monthly-stat">
            Consistency: <strong>{data.consistencyScore || 0}%</strong>
          </span>
        </div>
      </div>
      <div className="monthly-grid">
        {days.map((day) => (
          <div
            key={day.date}
            className={`monthly-cell intensity-${getIntensity(day.count)} ${day.date === today ? 'today' : ''}`}
            title={`${day.date}: ${day.count} completions`}
          >
            <span className="monthly-day-num">{new Date(day.date + 'T00:00:00Z').getUTCDate()}</span>
            {day.count > 0 && <span className="monthly-count">{day.count}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
