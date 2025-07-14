import api from '@/api/apiService';

export const fetchUsers = async (params = {}) => {
  const { data } = await api.get('/api/usuarios', { params });
  return data;
};

export const createUser = async (userData) => {
  const { data } = await api.post('/api/usuarios', userData);
  return data;
};

export const updateUser = async (id, userData) => {
  const { data } = await api.put(`/api/usuarios/${id}`, userData);
  return data;
};

export const deleteUser = async (id) => {
  await api.delete(`/api/usuarios/${id}`);
};

export const fetchUserById = async (id) => {
  const { data } = await api.get(`/api/usuarios/${id}`);
  return data;
};