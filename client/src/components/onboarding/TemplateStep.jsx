import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { habitsApi } from '../../api';
import { Pen, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.3 },
  }),
};

export default function TemplateStep({ goals, onBack }) {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [selected, setSelected] = useState(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    habitsApi.templates().then((res) => {
      const all = res.data.data;
      if (goals.length > 0) {
        const filtered = all.filter((t) => goals.includes(t.category));
        setTemplates(filtered.length > 0 ? filtered : all);
      } else {
        setTemplates(all);
      }
    }).catch(() => {});
  }, [goals]);

  const handleCreate = async () => {
    if (!selected) return;
    setCreating(true);
    try {
      await habitsApi.create({
        name: selected.name,
        description: selected.description || '',
        category: selected.category || 'other',
        difficulty: selected.difficulty || 'medium',
        color: '#6366f1',
        frequency: { type: 'daily', daysOfWeek: [0, 1, 2, 3, 4, 5, 6] },
      });
      toast.success('Habit created! Welcome aboard!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to create habit');
    } finally {
      setCreating(false);
    }
  };

  const handleSkip = () => {
    navigate('/habits/new');
  };

  return (
    <motion.div
      className="onboarding-step"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h2>Pick your first habit</h2>
      <p className="onboarding-subtitle">Choose a template to get started quickly, or create your own.</p>
      <div className="templates-grid">
        {templates.map((t, i) => (
          <motion.button
            key={t.name}
            type="button"
            className={`template-card ${selected?.name === t.name ? 'template-selected' : ''}`}
            onClick={() => setSelected(t)}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ y: -4, boxShadow: '0 8px 25px rgba(0,0,0,0.15)' }}
            whileTap={{ scale: 0.97 }}
          >
            <span className="template-name">{t.name}</span>
            <span className="template-desc">{t.description}</span>
            <span className="template-meta">
              <span className="category-badge">{t.category}</span>
              <span className="difficulty-badge" style={{
                color: t.difficulty === 'hard' ? '#f43f5e' : t.difficulty === 'easy' ? '#10b981' : '#f59e0b',
              }}>{t.difficulty}</span>
            </span>
          </motion.button>
        ))}
      </div>
      <div className="onboarding-actions">
        <button className="btn btn-back" onClick={onBack}>Back</button>
        <div className="onboarding-actions-right">
          <button className="btn btn-secondary" onClick={handleSkip}>
            <Pen size={14} /> Create Custom
          </button>
          <button
            className="btn btn-gradient onboarding-btn"
            onClick={handleCreate}
            disabled={!selected || creating}
          >
            {creating ? 'Creating...' : 'Create Habit'} {!creating && <ArrowRight size={16} />}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
