import { api } from '../api/apiRequest';

// Serviço API simplificado para agendamentos locais
const apiService = {
  // GET request
  get: async (url) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado. Faça login novamente.');
      }
      
      const response = await api.get(url, token);
      
      return response;
    } catch (error) {
      if (error.status === 401) {
        // Token inválido ou expirado
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
      throw error;
    }
  },

  // POST request  
  post: async (url, data) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await api.post(url, data, token);
      
      return response;
    } catch (error) {
      throw error;
    }
  },

  // PUT request
  put: async (url, data) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await api.put(url, data, token);
      
      return response;
    } catch (error) {
      throw error;
    }
  },

  // PATCH request
  patch: async (url, data) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await api.patch(url, data, token);
      
      return response;
    } catch (error) {
      throw error;
    }
  },

  // DELETE request
  delete: async (url) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await api.delete(url, token);
      
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default apiService;
