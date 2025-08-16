import { api } from '../api/apiRequest';

// Serviço API simplificado para agendamentos locais
const apiService = {
  // GET request
  get: async (url) => {
    try {
      const token = localStorage.getItem('token');
  // ...existing code...
      
      const response = await api.get(url, token);
  // ...existing code...
      
      return response;
    } catch (error) {
  // ...existing code...
      throw error;
    }
  },

  // POST request  
  post: async (url, data) => {
    try {
      const token = localStorage.getItem('token');
  // ...existing code...
      
      const response = await api.post(url, data, token);
  // ...existing code...
      
      return response;
    } catch (error) {
  // ...existing code...
      throw error;
    }
  },

  // PUT request
  put: async (url, data) => {
    try {
      const token = localStorage.getItem('token');
  // ...existing code...
      
      const response = await api.put(url, data, token);
  // ...existing code...
      
      return response;
    } catch (error) {
  // ...existing code...
      throw error;
    }
  },

  // DELETE request
  delete: async (url) => {
    try {
      const token = localStorage.getItem('token');
  // ...existing code...
      
      const response = await api.delete(url, token);
  // ...existing code...
      
      return response;
    } catch (error) {
  // ...existing code...
      throw error;
    }
  }
};

export default apiService;
