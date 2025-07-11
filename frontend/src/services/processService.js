import api from '@/api/apiService';

export const fetchProcesses = async (params) => {
  const { data } = await api.get('/processos', { params });
  return data;
};

export const createProcess = async (processData) => {
  const { data } = await api.post('/processos', processData);
  return data;
};

export const deleteProcess = async (id) => 
  await api.delete(`/processos/${id}`);