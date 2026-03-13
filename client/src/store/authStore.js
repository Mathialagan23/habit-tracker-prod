import { create } from 'zustand';
import { authApi } from '../api';

let _initPromise = null;

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  initialize: async () => {
    if (_initPromise) return _initPromise;

    _initPromise = (async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        set({ isLoading: false });
        return;
      }
      try {
        const { data } = await authApi.me();
        set({ user: data.data, isAuthenticated: true, isLoading: false });
      } catch (err) {
        const status = err.response?.status;
        if (status === 401) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          set({ user: null, isAuthenticated: false, isLoading: false });
        } else {
          set({ isLoading: false });
        }
      }
    })();

    return _initPromise;
  },

  login: async (email, password) => {
    const { data } = await authApi.login({ email, password });
    localStorage.setItem('accessToken', data.data.accessToken);
    localStorage.setItem('refreshToken', data.data.refreshToken);
    set({ user: data.data.user, isAuthenticated: true });
  },

  register: async (name, email, password) => {
    const { data } = await authApi.register({ name, email, password });
    localStorage.setItem('accessToken', data.data.accessToken);
    localStorage.setItem('refreshToken', data.data.refreshToken);
    set({ user: data.data.user, isAuthenticated: true });
  },

  logout: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      await authApi.logout(refreshToken);
    } catch {}
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ user: null, isAuthenticated: false });
  },
}));

export default useAuthStore;
