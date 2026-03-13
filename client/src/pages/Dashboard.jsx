import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, BarChart3, LayoutDashboard, ListChecks } from 'lucide-react';
import { habitsApi, logsApi, statsApi, analyticsApi } from '../api';
import HabitCard from '../components/HabitCard';
import EditHabitModal from '../components/EditHabitModal';
import WeeklyChart from '../components/WeeklyChart';
import MonthlyChart from '../components/MonthlyChart';
import HeatMap from '../components/HeatMap';
import ConfettiAnimation from '../components/celebration/ConfettiAnimation';
import XPProgress from '../components/gamification/XPProgress';
import StreakFlame from '../components/gamification/StreakFlame';
import AchievementBadge from '../components/gamification/AchievementBadge';
import ConsistencyScoreCard from '../components/analytics/ConsistencyScoreCard';
import BestDayCard from '../components/analytics/BestDayCard';
import HabitSuccessRates from '../components/analytics/HabitSuccessRates';
import HabitCorrelation from '../components/analytics/HabitCorrelation';
import useHabitReminder from '../hooks/useHabitReminder';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [weekly, setWeekly] = useState(null);
  const [monthly, setMonthly] = useState(null);
  const [heatmap, setHeatmap] = useState(null);
  const [gamification, setGamification] = useState(null);
  const [premium, setPremium] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editHabit, setEditHabit] = useState(null);
  const [activeSection, setActiveSection] = useState('dash-overview');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showCelebration, setShowCelebration] = useState(false);

  useHabitReminder(dashboard?.habits);

  const overviewRef = useRef(null);
  const analyticsRef = useRef(null);
  const habitsRef = useRef(null);

  const fetchData = useCallback(async () => {
    try {
      const [dashRes, weekRes, monthRes, heatRes, gamRes, premRes] = await Promise.all([
        statsApi.dashboard(),
        statsApi.weekly(),
        statsApi.monthly(),
        statsApi.heatmap(),
        statsApi.gamification(),
        analyticsApi.premium(),
      ]);
      setDashboard(dashRes.data.data);
      setWeekly(weekRes.data.data);
      setMonthly(monthRes.data.data);
      setHeatmap(heatRes.data.data);
      setGamification(gamRes.data.data);
      setPremium(premRes.data.data);
    } catch (err) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Redirect to onboarding if user has no habits
  useEffect(() => {
    if (!loading && dashboard && dashboard.habits && dashboard.habits.length === 0) {
      navigate('/onboarding', { replace: true });
    }
  }, [loading, dashboard, navigate]);

  // Scroll spy
  useEffect(() => {
    const sections = [
      overviewRef.current,
      analyticsRef.current,
      habitsRef.current
    ].filter(Boolean);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-120px 0px -40% 0px",
        threshold: 0.25
      }
    );

    sections.forEach((section) => observer.observe(section));

    // Detect when user reaches bottom → activate habits
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 50
      ) {
        setActiveSection("dash-habits");
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, [loading]);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleToggle = async (habitId, note) => {
    const habit = habits.find((h) => h._id === habitId);
    const wasCompleted = habit?.completedToday;
    try {
      await logsApi.create(habitId, note ? { note } : {});
      if (!wasCompleted) {
        setShowCelebration(true);
      }
      await fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to toggle habit');
    }
  };

  const handleScheduleToggle = async (habitId, scheduleTime, note) => {
    try {
      await logsApi.create(habitId, { scheduleTime, ...(note ? { note } : {}) });
      setShowCelebration(true);
      await fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to complete schedule');
    }
  };

  const handleEdit = (habit) => {
    setEditHabit(habit);
  };

  const handleSave = async (id, data) => {
    try {
      await habitsApi.update(id, data);
      setEditHabit(null);
      toast.success('Habit updated');
      await fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to update habit');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this habit? This cannot be undone.')) return;
    try {
      await habitsApi.remove(id);
      toast.success('Habit deleted');
      await fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to delete habit');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  const habits = dashboard?.habits || [];
  const stats = dashboard || {};
  const CATEGORIES = ['all', 'fitness', 'learning', 'productivity', 'mindfulness', 'health', 'other'];
  const filteredHabits = categoryFilter === 'all'
    ? habits
    : habits.filter((h) => h.category === categoryFilter);

  return (
    <div className="page">
      <nav className="dash-nav">
        <button
          className={`dash-nav-btn ${activeSection === 'dash-overview' ? 'active' : ''}`}
          onClick={() => scrollTo('dash-overview')}
        >
          <LayoutDashboard size={14} /> Dashboard
        </button>
        <button
          className={`dash-nav-btn ${activeSection === 'dash-analytics' ? 'active' : ''}`}
          onClick={() => scrollTo('dash-analytics')}
        >
          <BarChart3 size={14} /> Analytics
        </button>
        <button
          className={`dash-nav-btn ${activeSection === 'dash-habits' ? 'active' : ''}`}
          onClick={() => scrollTo('dash-habits')}
        >
          <ListChecks size={14} /> Habits
        </button>
      </nav>

      <div id="dash-overview" ref={overviewRef}>
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <Link to="/habits/new" className="btn btn-primary">
            <Plus size={18} /> New Habit
          </Link>
        </div>

        <div className="stats-row">
          <div className="stat-card">
            <span className="stat-value">{stats.todayCompleted || 0}</span>
            <span className="stat-label">Done Today</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.totalActiveHabits || 0}</span>
            <span className="stat-label">Active Habits</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.weeklyCompletionRate || 0}%</span>
            <span className="stat-label">Weekly Completion</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{monthly?.consistencyScore || 0}%</span>
            <span className="stat-label">Overall Consistency</span>
          </div>
        </div>

        {gamification && (
          <div className="gamification-row">
            <div className="gamification-card">
              <StreakFlame
                streak={Math.max(0, ...habits.map((h) => h.currentStreak || 0))}
                habitName={
                  habits.length > 0
                    ? habits.reduce((best, h) =>
                        (h.currentStreak || 0) > (best.currentStreak || 0) ? h : best
                      ).name
                    : undefined
                }
              />
            </div>
            <div className="gamification-card">
              <XPProgress xp={gamification.xp} level={gamification.level} />
            </div>
          </div>
        )}
      </div>

      <div id="dash-analytics" ref={analyticsRef}>
        <HeatMap data={heatmap} />

        <div className="charts-row">
          <WeeklyChart data={weekly} totalHabits={stats.totalActiveHabits || 0} />
          <MonthlyChart data={monthly} />
        </div>

        {gamification?.achievements?.length > 0 && (
          <div className="achievements-section">
            <h3 className="section-title">Achievements</h3>
            <div className="achievements-grid">
              {gamification.achievements.map((a) => (
                <AchievementBadge key={a._id} achievement={a} unlocked={a.unlocked} />
              ))}
            </div>
          </div>
        )}

        {premium && (
          <div className="premium-insights">
            <h2 className="section-title">Premium Insights</h2>
            <div className="premium-grid">
              <ConsistencyScoreCard
                score={premium.consistencyScore?.score || 0}
                level={premium.consistencyScore?.level || 'Needs Improvement'}
              />
              <BestDayCard
                bestDay={premium.bestDay?.bestDay || 'N/A'}
                completionCount={premium.bestDay?.completionCount || 0}
                dayCounts={premium.bestDay?.dayCounts}
              />
              <HabitSuccessRates rates={premium.habitSuccessRates} />
              <HabitCorrelation correlations={premium.correlations} />
            </div>
          </div>
        )}
      </div>

      <div id="dash-habits" ref={habitsRef}>
        <h2 className="section-title">Your Habits</h2>
        <div className="category-filter">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              className={`category-filter-btn ${categoryFilter === c ? 'active' : ''}`}
              onClick={() => setCategoryFilter(c)}
            >
              {c}
            </button>
          ))}
        </div>
        {filteredHabits.length === 0 ? (
          <div className="empty-state">
            {habits.length === 0 ? (
              <>No habits yet. <Link to="/habits/new">Create your first habit</Link></>
            ) : (
              'No habits in this category.'
            )}
          </div>
        ) : (
          <div className="habit-list">
            {filteredHabits.map((habit) => (
              <HabitCard
                key={habit._id}
                habit={habit}
                onToggle={(note) => handleToggle(habit._id, note)}
                onScheduleToggle={handleScheduleToggle}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {editHabit && (
        <EditHabitModal
          habit={editHabit}
          onSave={handleSave}
          onClose={() => setEditHabit(null)}
        />
      )}

      <ConfettiAnimation
        show={showCelebration}
        onDone={() => setShowCelebration(false)}
      />
    </div>
  );
}
