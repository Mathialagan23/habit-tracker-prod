import { useEffect, useRef } from 'react';

export default function useHabitReminder(habits) {
  const notifiedRef = useRef(new Set());

  useEffect(() => {
    if (!habits || habits.length === 0) return;

    const check = () => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      habits.forEach((habit) => {
        if (habit.completedToday) return;

        const isMultiSchedule = Array.isArray(habit.schedule) && habit.schedule.length > 1;
        const timesToCheck = isMultiSchedule ? habit.schedule : (habit.reminderTime ? [habit.reminderTime] : []);

        timesToCheck.forEach((time) => {
          if (time !== currentTime) return;

          // For multi-schedule, skip times already completed
          if (isMultiSchedule && habit.todayScheduleLogs?.includes(time)) return;

          const key = `${habit._id}-${time}`;
          if (notifiedRef.current.has(key)) return;
          notifiedRef.current.add(key);

          if (Notification.permission === 'granted') {
            const body = isMultiSchedule
              ? `Scheduled: ${habit.name} (${time})`
              : `Time to complete: ${habit.name}`;
            new Notification('Habit Reminder', { body, icon: '/vite.svg' });
          }
        });
      });
    };

    check();
    const interval = setInterval(check, 60_000);

    return () => clearInterval(interval);
  }, [habits]);
}
