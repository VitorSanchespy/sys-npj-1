import { api } from '../api/apiRequest';

// Serviço API simplificado para agendamentos locais
const apiService = {
  // GET request
  get: async (url) => {
    try {
      const token = localStorage.getItem('token');
      console.log('🔍 GET Request:', { url, hasToken: !!token });
      
      const response = await api.get(url, token);
      console.log('📥 GET Response:', { url, response });
      
      return response;
    } catch (error) {
      console.error('❌ GET Error:', { url, error });
      throw error;
    }
  },

  // POST request  
  post: async (url, data) => {
    try {
      const token = localStorage.getItem('token');
      console.log('🔍 POST Request:', { url, hasToken: !!token, data });
      
      const response = await api.post(url, data, token);
      console.log('📥 POST Response:', { url, response });
      
      return response;
    } catch (error) {
      console.error('❌ POST Error:', { url, error });
      throw error;
    }
  },

  // PUT request
  put: async (url, data) => {
    try {
      const token = localStorage.getItem('token');
      console.log('🔍 PUT Request:', { url, hasToken: !!token, data });
      
      const response = await api.put(url, data, token);
      console.log('📥 PUT Response:', { url, response });
      
      return response;
    } catch (error) {
      console.error('❌ PUT Error:', { url, error });
      throw error;
    }
  },

  // DELETE request
  delete: async (url) => {
    try {
      const token = localStorage.getItem('token');
      console.log('🔍 DELETE Request:', { url, hasToken: !!token });
      
      const response = await api.delete(url, token);
      console.log('📥 DELETE Response:', { url, response });
      
      return response;
    } catch (error) {
      console.error('❌ DELETE Error:', { url, error });
      throw error;
    }
  }
};

export default apiService;
