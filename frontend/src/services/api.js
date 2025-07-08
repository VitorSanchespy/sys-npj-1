import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
});

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Processos
export const getProcesses = (filters = {}) => api.get('/api/processos', { params: filters });
export const createProcess = (data) => api.post('/api/processos', data);
export const assignStudent = (processoId, alunoId) => api.post(`/api/processos/${processoId}/alunos`, { aluno_id: alunoId });

// Usuários
export const getUsers = () => api.get('/api/usuarios');
export const createUser = (userData) => api.post('/api/usuarios', userData);
export const updateUser = (id, userData) => api.put(`/api/usuarios/${id}`, userData);

// Autenticação
export const login = (credentials) => api.post('/auth/login', credentials);
export const register = (userData) => api.post('/auth/registrar', userData);

// Arquivos
export const uploadFile = (processoId, file) => {
  const formData = new FormData();
  formData.append('arquivo', file);
  formData.append('processo_id', processoId);
  return api.post('/api/arquivos/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export default api;