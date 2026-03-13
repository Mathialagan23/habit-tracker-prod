import { create } from 'zustand';

const useThemeStore = create((set) => ({
  dark: false,

  initialize() {
    const saved = localStorage.getItem('theme');
    const dark = saved === 'dark';
    document.documentElement.classList.toggle('dark', dark);
    set({ dark });
  },

  toggle() {
    set((state) => {
      const dark = !state.dark;
      document.documentElement.classList.toggle('dark', dark);
      localStorage.setItem('theme', dark ? 'dark' : 'light');
      return { dark };
    });
  },
}));

export default useThemeStore;
