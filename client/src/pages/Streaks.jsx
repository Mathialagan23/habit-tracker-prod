import { useState, useEffect } from 'react';
import { Flame, Trophy } from 'lucide-react';
import { statsApi } from '../api';
import toast from 'react-hot-toast';

export default function Streaks() {
  const [streaks, setStreaks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const streakRes = await statsApi.streaks();
        setStreaks(streakRes.data.data || []);
      } catch (err) {
        toast.error('Failed to load streaks');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="page">
      <h1>Streaks</h1>
      {streaks.length === 0 ? (
        <div className="empty-state">No habits yet. Create one to start tracking streaks!</div>
      ) : (
        <div className="streak-list">
          {streaks.map((habit) => (
            <div key={habit._id} className="streak-card">
              <div className="streak-icon">
                <Flame
                  size={28}
                  color={habit.currentStreak > 0 ? '#f59e0b' : '#cbd5e1'}
                />
              </div>
              <div className="streak-info">
                <h3>{habit.name}</h3>
                <div className="streak-numbers">
                  <span className="current-streak">
                    <Flame size={14} />
                    Current: {habit.currentStreak} {habit.currentStreak === 1 ? 'day' : 'days'}
                  </span>
                  <span className="best-streak">
                    <Trophy size={14} />
                    Best: {habit.bestStreak} {habit.bestStreak === 1 ? 'day' : 'days'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
