import api from '../api/apiService';

export default {
  login: async (credentials) => {
    const { data } = await api.post('/auth/login', credentials);
    localStorage.setItem('token', data.token);
    return data;
  },

  logout: () => localStorage.removeItem('token'),

  verifyToken: async () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const { data } = await api.get('/auth/profile');
      return data;
    } catch {
      localStorage.removeItem('token');
      return null;
    }
  }
};