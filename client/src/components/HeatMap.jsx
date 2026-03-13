import { useMemo } from 'react';

export default function HeatMap({ data }) {
  const entries = Array.isArray(data) ? data : Array.isArray(data?.days) ? data.days : [];
  if (entries.length === 0) return null;

  const cellSize = 13;
  const gap = 3;

  const { weeks, monthLabels, max } = useMemo(() => {
    const map = {};
    let maxCount = 0;
    entries.forEach((d) => {
      map[d.date] = d.count;
      if (d.count > maxCount) maxCount = d.count;
    });

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const start = new Date(today);
    start.setUTCDate(start.getUTCDate() - 364);

    // Adjust to start on Sunday
    const dayOfWeek = start.getUTCDay();
    start.setUTCDate(start.getUTCDate() - dayOfWeek);

    const weekArr = [];
    const months = [];
    let currentWeek = [];
    let lastMonth = -1;

    const cursor = new Date(start);
    while (cursor <= today) {
      const key = cursor.toISOString().slice(0, 10);
      const month = cursor.getUTCMonth();

      if (month !== lastMonth) {
        months.push({ label: cursor.toLocaleDateString('en', { month: 'short', timeZone: 'UTC' }), weekIndex: weekArr.length });
        lastMonth = month;
      }

      currentWeek.push({ date: key, count: map[key] || 0 });

      if (currentWeek.length === 7) {
        weekArr.push(currentWeek);
        currentWeek = [];
      }

      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    if (currentWeek.length > 0) {
      weekArr.push(currentWeek);
    }

    return { weeks: weekArr, monthLabels: months, max: maxCount };
  }, [entries]);

  const getColor = (count) => {
    if (count === 0) return 'var(--heatmap-empty)';
    const ratio = count / max;
    if (ratio <= 0.25) return 'var(--heatmap-l1)';
    if (ratio <= 0.5) return 'var(--heatmap-l2)';
    if (ratio <= 0.75) return 'var(--heatmap-l3)';
    return 'var(--heatmap-l4)';
  };

  const dayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
  const labelOffset = 30;
  const svgWidth = labelOffset + weeks.length * (cellSize + gap);
  const svgHeight = 20 + 7 * (cellSize + gap);

  return (
    <div className="heatmap-container">
      <h3>Activity</h3>
      <div className="heatmap-scroll">
        <svg className="heatmap-svg" width={svgWidth} height={svgHeight}>
          {/* Month labels */}
          {monthLabels.map((m, i) => (
            <text
              key={i}
              className="heatmap-label"
              x={labelOffset + m.weekIndex * (cellSize + gap)}
              y={12}
            >
              {m.label}
            </text>
          ))}

          {/* Day labels */}
          {dayLabels.map((label, i) => (
            <text key={i} className="heatmap-label" x={0} y={20 + i * (cellSize + gap) + cellSize - 2}>
              {label}
            </text>
          ))}

          {/* Cells */}
          {weeks.map((week, wi) =>
            week.map((day, di) => (
              <rect
                key={day.date}
                className="heatmap-cell"
                x={labelOffset + wi * (cellSize + gap)}
                y={20 + di * (cellSize + gap)}
                width={cellSize}
                height={cellSize}
                rx={2}
                fill={getColor(day.count)}
              >
                <title>{`${day.date}: ${day.count}`}</title>
              </rect>
            ))
          )}
        </svg>
      </div>
      <div className="heatmap-legend">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <span
            key={level}
            className="heatmap-legend-cell"
            style={{
              background:
                level === 0
                  ? 'var(--heatmap-empty)'
                  : `var(--heatmap-l${level})`,
            }}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
