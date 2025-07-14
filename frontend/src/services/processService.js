import api from "@/api/apiService";

// Busca todos os processos, pode receber filtros
export const fetchProcesses = async (params = {}) => {
  const { data } = await api.get("/api/processos", { params });
  return data;
};

// Busca detalhes de um processo por ID
export const fetchProcessById = async (id) => {
  const { data } = await api.get(`/api/processos/${id}`);
  return data;
};

// Cria novo processo
export const createProcess = async (processData) => {
  const { data } = await api.post("/api/processos", processData);
  return data;
};

// Atualiza processo existente
export const updateProcess = async (id, processData) => {
  const { data } = await api.put(`/api/processos/${id}`, processData);
  return data;
};

// Deleta processo
export const deleteProcess = async (id) => {
  await api.delete(`/api/processos/${id}`);
};