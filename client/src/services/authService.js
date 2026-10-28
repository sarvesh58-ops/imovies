import api from './api';

export const authService = {
  login: async (credentials) => {
    return api.post('/auth/login', credentials);
  },
  register: async (userData) => {
    return api.post('/auth/register', userData);
  },
  getMe: async () => {
    return api.get('/auth/me');
  },
  updateProfile: async (profileData) => {
    return api.put('/users/profile', profileData);
  },
  changePassword: async (passwordData) => {
    return api.put('/users/change-password', passwordData);
  }
};
