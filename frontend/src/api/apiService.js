import axios from 'axios';
import { getToken, clearToken } from '@/utils/auth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 15000
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
  response => response,
  error => {
    let message = 'Erro na requisição';
    if (error.response) {
      message = error.response.data?.message ||
                error.response.data?.erro ||
                `Erro ${error.response.status}: ${error.response.statusText}`;
      if (error.response.status === 401) {
        clearToken();
        window.location.href = '/login';
      }
    } else if (error.request) {
      message = 'Sem resposta do servidor';
    }
    return Promise.reject({ ...error, message });
  }
);

export default api;