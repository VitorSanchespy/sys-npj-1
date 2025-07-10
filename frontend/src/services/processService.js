// src/services/processService.js
import api from '@/api/apiService';

export const fetchProcesses = async (params) => {
  const response = await api.get('/processos', { params });
  return response.data;
};

export const createProcess = async (processData) => {
  const response = await api.post('/processos', processData);
  return response.data;
};

export const deleteProcess = async (id) => {
  await api.delete(`/processos/${id}`);
};