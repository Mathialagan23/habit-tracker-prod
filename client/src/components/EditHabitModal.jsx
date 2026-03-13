import { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';

const COLORS = ['#6366f1', '#f43f5e', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6'];
const CATEGORIES = ['fitness', 'learning', 'productivity', 'mindfulness', 'health', 'other'];
const DIFFICULTIES = ['easy', 'medium', 'hard'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function EditHabitModal({ habit, onSave, onClose }) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    color: '#6366f1',
    category: 'other',
    difficulty: 'medium',
    reminderTime: '',
    frequency: { type: 'daily', daysOfWeek: [0, 1, 2, 3, 4, 5, 6] },
    schedule: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (habit) {
      setForm({
        name: habit.name || '',
        description: habit.description || '',
        color: habit.color || '#6366f1',
        category: habit.category || 'other',
        difficulty: habit.difficulty || 'medium',
        reminderTime: habit.reminderTime || '',
        frequency: habit.frequency || { type: 'daily', daysOfWeek: [0, 1, 2, 3, 4, 5, 6] },
        schedule: habit.schedule || [],
      });
    }
  }, [habit]);

  const isMultiSchedule = form.schedule.length > 1;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validSchedule = form.schedule.filter(Boolean);
    setLoading(true);
    try {
      await onSave(habit._id, {
        ...form,
        reminderTime: isMultiSchedule ? null : (form.reminderTime || null),
        schedule: validSchedule,
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (day) => {
    const current = form.frequency.daysOfWeek;
    const updated = current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day].sort();
    setForm({ ...form, frequency: { ...form.frequency, daysOfWeek: updated } });
  };

  const addScheduleTime = () => {
    setForm({ ...form, schedule: [...form.schedule, ''] });
  };

  const updateScheduleTime = (index, value) => {
    const updated = [...form.schedule];
    updated[index] = value;
    setForm({ ...form, schedule: updated });
  };

  const removeScheduleTime = (index) => {
    setForm({ ...form, schedule: form.schedule.filter((_, i) => i !== index) });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Habit</h2>
          <button className="btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              maxLength={120}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              maxLength={500}
            />
          </div>

          <div className="form-group">
            <label>Color</label>
            <div className="color-picker">
              {COLORS.map((c) => (
                <div
                  key={c}
                  className={`color-swatch ${form.color === c ? 'active' : ''}`}
                  style={{ background: c }}
                  onClick={() => setForm({ ...form, color: c })}
                />
              ))}
            </div>
          </div>

          <div className="form-row">
            <div className="form-half">
              <div className="form-group">
                <label>Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-half">
              <div className="form-group">
                <label>Difficulty</label>
                <select
                  value={form.difficulty}
                  onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                >
                  {DIFFICULTIES.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Reminder Time (optional)</label>
            <input
              type="time"
              value={form.reminderTime}
              onChange={(e) => setForm({ ...form, reminderTime: e.target.value })}
              disabled={isMultiSchedule}
            />
            {isMultiSchedule && (
              <span className="form-hint">Disabled — schedule times act as reminders</span>
            )}
          </div>

          <div className="form-group">
            <label>Schedule Times</label>
            <div className="schedule-times-editor">
              {form.schedule.map((time, i) => (
                <div key={i} className="schedule-time-row">
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => updateScheduleTime(i, e.target.value)}
                  />
                  <button type="button" className="btn-icon btn-icon-danger" onClick={() => removeScheduleTime(i)}>
                    <X size={14} />
                  </button>
                </div>
              ))}
              <button type="button" className="btn btn-secondary btn-sm" onClick={addScheduleTime}>
                <Plus size={14} /> Add Time
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Frequency</label>
            <select
              value={form.frequency.type}
              onChange={(e) =>
                setForm({
                  ...form,
                  frequency: { ...form.frequency, type: e.target.value },
                })
              }
            >
              <option value="daily">Daily</option>
              <option value="custom">Custom Days</option>
            </select>
          </div>

          {form.frequency.type === 'custom' && (
            <div className="form-group">
              <label>Days</label>
              <div className="day-picker">
                {DAYS.map((label, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`day-btn ${form.frequency.daysOfWeek.includes(i) ? 'active' : ''}`}
                    onClick={() => toggleDay(i)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
