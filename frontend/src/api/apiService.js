import axios from 'axios';
import { getCurrentToken } from '@/utils/auth';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/',
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000,
  headers: { 'Content-Type': 'application/json' }
});

// Adiciona token automático nas requisições
API.interceptors.request.use(config => {
  const token = getCurrentToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Tratamento centralizado de erros
API.interceptors.response.use(
  response => response.data,
  error => {
    const message = error.response?.data?.message || 'Erro na requisição';
    console.error('API Error:', message);
    return Promise.reject({ message, status: error.response?.status });
  }
);

export default API;