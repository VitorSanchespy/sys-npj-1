import axios from 'axios';
import { auth } from '@/utils/auth'; // Utilitário para gerenciar tokens

// Constantes (melhor em .env)
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000;
const FALLBACK_API_URL = 'http://localhost:3001/api';

// Configuração do Axios
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || FALLBACK_API_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de Request
API.interceptors.request.use((config) => {
  const token = auth.getToken(); // Abstraction layer
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de Response
API.interceptors.response.use(
  (response) => response.data, // Retorna apenas os dados
  (error) => {
    const originalRequest = error.config;
    
    // Tratamento de 401 (não autorizado)
    if (error.response?.status === 401 && !originalRequest._retry) {
      auth.clear(); // Limpa tokens e dados do usuário
      window.location.pathname = auth.loginPath; // Redireciona dinamicamente
    }

    // Padroniza erros da API
    return Promise.reject({
      message: error.response?.data?.message || 'Erro desconhecido',
      status: error.response?.status,
    });
  }
);

export default API;