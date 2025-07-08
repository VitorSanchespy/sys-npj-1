import axios from 'axios';

// Configuração base
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
  timeout: 10000,
});

// Interceptor de Autenticação
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Interceptor de Erros
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login?sessionExpired=true';
    }
    return Promise.reject(error);
  }
);

// Factory para serviços API
const createService = (basePath) => ({
  getAll: (params) => api.get(basePath, { params }),
  getById: (id) => api.get(`${basePath}/${id}`),
  create: (data) => api.post(basePath, data),
  update: (id, data) => api.put(`${basePath}/${id}`, data),
  delete: (id) => api.delete(`${basePath}/${id}`),
});

// Serviços Específicos
export const AuthService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/registrar', userData),
  getProfile: () => api.get('/auth/profile'),
  updatePassword: (data) => api.put('/auth/password', data),
  logout: () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
};

export const UserService = createService('/api/usuarios');
export const ProcessService = {
  ...createService('/api/processos'),
  assignStudent: (processoId, alunoId) => 
    api.post(`/api/processos/${processoId}/alunos`, { aluno_id: alunoId })
};

export const FileService = {
  upload: (processoId, file) => {
    const formData = new FormData();
    formData.append('arquivo', file);
    formData.append('processo_id', processoId);
    return api.post('/api/arquivos/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  download: (fileId) => api.get(`/api/arquivos/download/${fileId}`, {
    responseType: 'blob'
  }),
  delete: (fileId) => api.delete(`/api/arquivos/${fileId}`)
};

export default api;