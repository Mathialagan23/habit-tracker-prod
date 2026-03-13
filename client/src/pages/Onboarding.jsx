import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import StepIndicator from '../components/onboarding/StepIndicator';
import WelcomeStep from '../components/onboarding/WelcomeStep';
import GoalSelectionStep from '../components/onboarding/GoalSelectionStep';
import TemplateStep from '../components/onboarding/TemplateStep';

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [goals, setGoals] = useState([]);

  const toggleGoal = (id) => {
    setGoals((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  return (
    <div className="onboarding-page">
      <div className="onboarding-container">
        <StepIndicator current={step} total={3} />
        <AnimatePresence mode="wait">
          {step === 0 && <WelcomeStep key="welcome" onNext={() => setStep(1)} />}
          {step === 1 && (
            <GoalSelectionStep
              key="goals"
              selected={goals}
              onToggle={toggleGoal}
              onNext={() => setStep(2)}
              onBack={() => setStep(0)}
            />
          )}
          {step === 2 && (
            <TemplateStep key="template" goals={goals} onBack={() => setStep(1)} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
