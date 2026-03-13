import api from './client';

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  logout: (refreshToken) => api.post('/auth/logout', { refreshToken }),
  me: () => api.get('/auth/me'),
};

export const habitsApi = {
  list: (archived = false) => api.get(`/habits?archived=${archived}`),
  getById: (id) => api.get(`/habits/${id}`),
  create: (data) => api.post('/habits', data),
  update: (id, data) => api.patch(`/habits/${id}`, data),
  remove: (id) => api.delete(`/habits/${id}`),
  templates: () => api.get('/habits/templates'),
};

export const logsApi = {
  create: (habitId, data = {}) => api.post(`/habits/${habitId}/logs`, data),
  getByHabit: (habitId, params) => api.get(`/habits/${habitId}/logs`, { params }),
  remove: (habitId, logId) => api.delete(`/habits/${habitId}/logs/${logId}`),
};

export const statsApi = {
  dashboard: () => api.get('/stats/dashboard'),
  streaks: () => api.get('/stats/streaks'),
  weekly: () => api.get('/stats/weekly'),
  monthly: () => api.get('/stats/monthly'),
  heatmap: () => api.get('/stats/heatmap'),
  scores: () => api.get('/stats/scores'),
  gamification: () => api.get('/stats/gamification'),
};

export const usersApi = {
  updateProfile: (data) => api.put('/users/profile', data),
  uploadAvatar: (formData) => api.post('/users/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updatePreferences: (data) => api.patch('/users/preferences', data),
  changePassword: (data) => api.put('/users/password', data),
  deleteAccount: () => api.delete('/users'),
};

export const analyticsApi = {
  premium: () => api.get('/analytics/premium'),
};
