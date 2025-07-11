// src/services/userService.js
import api from '@/api/apiService';

export const fetchUsers = async (params = {}) => {
  const { data } = await api.get('/usuarios', { params });
  return data;
};

export const createUser = async (userData) => {
  const { data } = await api.post('/usuarios', userData);
  return data;
};

export const updateUser = async (id, userData) => {
  const { data } = await api.put(`/usuarios/${id}`, userData);
  return data;
};

export const deleteUser = async (id) => {
  await api.delete(`/usuarios/${id}`);
};

export const fetchUserById = async (id) => {
  const { data } = await api.get(`/usuarios/${id}`);
  return data;
};

export const updateUserRole = async (id, role) => {
  const { data } = await api.patch(`/usuarios/${id}/role`, { role });
  return data;
};