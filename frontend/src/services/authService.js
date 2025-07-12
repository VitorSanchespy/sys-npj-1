import api from '@/api/apiService';

export default {
  login: async (credentials) => {
    try {
      const { data } = await api.post('/auth/login', credentials);
      if (data.success) {
        localStorage.setItem('token', data.token);
      }
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Erro ao conectar ao servidor'
      };
    }
  },

  logout: () => localStorage.removeItem('token'),

  verifyToken: async () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const { data } = await api.get('/auth/perfil');
      return data;
    } catch {
      localStorage.removeItem('token');
      return null;
    }
  }
};