import apiClient from '../client';

export const userService = {
  getProfile: () => apiClient.get('/user/profile'),
  updateProfile: (data) => apiClient.put('/user/profile', data),
  getStats: () => apiClient.get('/user/stats'),
  getLeaderboard: (filters) => apiClient.get('/user/leaderboard', { params: filters }),
};
