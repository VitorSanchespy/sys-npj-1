import api from '../api/apiService';

const auth = {
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error) {
      throw new Error('Falha no login: ' + error.response?.data?.message || error.message);
    }
  },

  logout: () => {
    localStorage.removeItem('token');
  },

  verifyToken: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
      
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error) {
      localStorage.removeItem('token');
      return null;
    }
  }
};

export default auth;