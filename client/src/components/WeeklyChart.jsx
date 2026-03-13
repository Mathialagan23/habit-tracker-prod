export default function WeeklyChart({ data, totalHabits }) {
  const days = Array.isArray(data) ? data : Array.isArray(data?.days) ? data.days : [];
  if (days.length === 0) return null;

  const cap = totalHabits > 0 ? totalHabits : Math.max(...days.map((d) => d.count), 1);

  return (
    <div className="weekly-chart">
      <h3>Weekly Activity</h3>
      <div className="chart-bars">
        {days.map((day) => {
          const pct = Math.min((day.count / cap) * 100, 100);
          return (
            <div key={day.date} className="chart-bar-container">
              <span className="chart-count">{day.count}/{cap}</span>
              <div className="chart-bar-wrapper">
                <div
                  className="chart-bar"
                  style={{ height: `${Math.max(pct, day.count > 0 ? 4 : 0)}%` }}
                />
              </div>
              <span className="chart-label">
                {new Date(day.date + 'T00:00:00Z').toLocaleDateString('en', {
                  weekday: 'short',
                  timeZone: 'UTC',
                })}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
