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
    const message = error.response?.data?.message || 'Erro na requisição';
    console.error('API Error:', message);
    return Promise.reject({ message, status: error.response?.status });
  }
);

export default api;