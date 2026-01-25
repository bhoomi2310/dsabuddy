import apiClient from '../client';

export const userService = {
  getProfile: () => apiClient.get('/auth/me'),
  updateProfile: (data) => apiClient.put('/user/profile', data),
  getStats: () => apiClient.get('/user/stats'),
  getLeaderboard: (filters) => apiClient.get('/user/leaderboard', { params: filters }),
  updateOnboarding: (data) => apiClient.post('/auth/onboarding', data),
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return apiClient.post('/upload/upload-avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
