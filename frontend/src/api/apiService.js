import axios from 'axios';
import { getToken } from '@/utils/auth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 15000, // Timeout de 15s
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  response => response.data,
  error => {
    let message = 'Erro na requisição';
    
    if (error.response) {
      // Erros 4xx e 5xx
      message = error.response.data?.message || 
               `Erro ${error.response.status}: ${error.response.statusText}`;
      
      // Tratar token expirado
      if (error.response.status === 401) {
        localStorage.removeItem('authToken');
        window.location.reload();
      }
    } else if (error.request) {
      // A requisição foi feita mas não houve resposta
      message = 'Sem resposta do servidor';
    }
    
    console.error('API Error:', message);
    return Promise.reject({ message });
  }
);

export default api;