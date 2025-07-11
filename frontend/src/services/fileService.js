// src/services/fileService.js
import api from '@/api/apiService';

export const uploadFile = async (fileData) => {
  const formData = new FormData();
  formData.append('file', fileData.file);
  formData.append('processoId', fileData.processoId);
  formData.append('descricao', fileData.descricao);

  const { data } = await api.post('/arquivos/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return data;
};

export const fetchFilesByProcess = async (processoId) => {
  const { data } = await api.get(`/arquivos/processo/${processoId}`);
  return data;
};

export const downloadFile = async (fileId) => {
  const response = await api.get(`/arquivos/download/${fileId}`, {
    responseType: 'blob'
  });
  return response.data;
};

export const deleteFile = async (fileId) => {
  await api.delete(`/arquivos/${fileId}`);
};

export const fetchFileMetadata = async (fileId) => {
  const { data } = await api.get(`/arquivos/${fileId}/metadata`);
  return data;
};