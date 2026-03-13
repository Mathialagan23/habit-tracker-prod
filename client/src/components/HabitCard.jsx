import { useState, useMemo } from 'react';
import { Check, Circle, Pencil, Trash2, MessageSquare, Clock, Lock } from 'lucide-react';

function currentHHMM() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

function timeToMinutes(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

export default function HabitCard({ habit, onToggle, onScheduleToggle, onEdit, onDelete }) {
  const [animating, setAnimating] = useState(false);
  const [showNote, setShowNote] = useState(false);
  const [note, setNote] = useState('');

  const isMultiSchedule = Array.isArray(habit.schedule) && habit.schedule.length > 1;
  const completedTimes = habit.todayScheduleLogs || [];

  // Recompute which times are available (within 60‑min grace window)
  const nowStr = useMemo(() => currentHHMM(), [habit]);
  const nowMin = timeToMinutes(nowStr);

  const isTimeAvailable = (time) => {
    const schedMin = timeToMinutes(time);
    return schedMin - nowMin <= 60;
  };

  const handleToggle = () => {
    if (isMultiSchedule) return; // multi-schedule uses per-time toggles
    if (!habit.completedToday) {
      setAnimating(true);
      setTimeout(() => setAnimating(false), 600);
      onToggle(note);
      setShowNote(false);
      setNote('');
    } else {
      onToggle('');
    }
  };

  const handleScheduleToggle = (time) => {
    if (completedTimes.includes(time)) return;
    if (onScheduleToggle) {
      onScheduleToggle(habit._id, time, note);
      setNote('');
      setShowNote(false);
    }
  };

  const handleNoteToggle = (e) => {
    e.stopPropagation();
    setShowNote((prev) => !prev);
  };

  const progress = habit.dailyProgress;

  return (
    <div
      className={`habit-card ${animating ? 'habit-card-pop' : ''}`}
      style={{ borderLeftColor: habit.color }}
    >
      {!isMultiSchedule && (
        <button
          className={`habit-toggle ${habit.completedToday ? 'completed' : ''}`}
          onClick={handleToggle}
        >
          {habit.completedToday ? (
            <Check size={22} className={animating ? 'check-animate' : ''} />
          ) : (
            <Circle size={22} />
          )}
        </button>
      )}
      {isMultiSchedule && (
        <div className="habit-toggle-placeholder">
          <Clock size={20} style={{ color: habit.color, opacity: 0.7 }} />
        </div>
      )}
      <div className="habit-card-body" style={{ flex: 1 }}>
        <div className="habit-card-top">
          <h3 className={habit.completedToday ? 'line-through' : ''}>{habit.name}</h3>
          <div className="habit-card-actions">
            {!habit.completedToday && (
              <button className="btn-icon" onClick={handleNoteToggle} title="Add note">
                <MessageSquare size={14} />
              </button>
            )}
            <button className="btn-icon" onClick={() => onEdit(habit)}>
              <Pencil size={14} />
            </button>
            <button className="btn-icon btn-icon-danger" onClick={() => onDelete(habit._id)}>
              <Trash2 size={14} />
            </button>
          </div>
        </div>
        {habit.description && (
          <p className="text-muted" style={{ fontSize: '0.8rem' }}>
            {habit.description}
          </p>
        )}

        {isMultiSchedule && (
          <div className="schedule-checklist">
            {habit.schedule.map((time) => {
              const done = completedTimes.includes(time);
              const available = isTimeAvailable(time);
              const locked = !done && !available;
              return (
                <button
                  key={time}
                  className={`schedule-item ${done ? 'schedule-done' : ''} ${locked ? 'schedule-locked' : ''}`}
                  onClick={() => !locked && handleScheduleToggle(time)}
                  disabled={done || locked}
                  title={locked ? `Available at ${time}` : ''}
                >
                  {done ? <Check size={14} /> : locked ? <Lock size={12} /> : <Circle size={14} />}
                  <span>{time}</span>
                </button>
              );
            })}
            {progress && (
              <div className="schedule-progress">
                <div className="schedule-progress-bar">
                  <div
                    className="schedule-progress-fill"
                    style={{
                      width: `${(progress.completed / progress.total) * 100}%`,
                      background: habit.color,
                    }}
                  />
                </div>
                <span className="schedule-progress-text">
                  {progress.completed} / {progress.total}
                </span>
              </div>
            )}
          </div>
        )}

        {showNote && !habit.completedToday && (
          <input
            className="habit-note-input"
            type="text"
            placeholder="Add a note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={500}
            onClick={(e) => e.stopPropagation()}
          />
        )}
        <div className="habit-card-meta">
          {habit.category && habit.category !== 'other' && (
            <span className="category-badge">{habit.category}</span>
          )}
          {habit.difficulty && (
            <span
              className="difficulty-badge"
              style={{
                color: habit.difficulty === 'hard' ? '#f43f5e' : habit.difficulty === 'easy' ? '#10b981' : '#f59e0b',
              }}
            >
              {habit.difficulty}
            </span>
          )}
          {habit.currentStreak > 0 && (
            <span className="streak-badge">{habit.currentStreak}d streak</span>
          )}
        </div>
      </div>
    </div>
  );
}
