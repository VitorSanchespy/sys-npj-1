import api from '@/api/apiService';

export const uploadFile = async (fileData) => {
  const formData = new FormData();
  formData.append('file', fileData.file);
  formData.append('processoId', fileData.processoId);
  formData.append('descricao', fileData.descricao);

  const { data } = await api.post('/api/arquivos/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return data;
};

export const fetchFilesByProcess = async (processoId) => {
  const { data } = await api.get(`/api/arquivos/processo/${processoId}`);
  return data;
};

export const deleteFile = async (fileId) => {
  await api.delete(`/api/arquivos/${fileId}`);
};