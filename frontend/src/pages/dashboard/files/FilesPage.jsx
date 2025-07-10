import { useState, useEffect } from 'react';
import { Paper, Title, Text, Group, Button, LoadingOverlay, FileInput, Progress, Table, ActionIcon, Modal } from '@mantine/core';
import { IconUpload, IconTrash, IconDownload, IconFileDescription, IconX } from '@tabler/icons-react';
import api from '@/api/apiService';

const ACCEPTED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

export function FilesPage() {
  const [state, setState] = useState({
    file: null,
    loading: false,
    progress: 0,
    uploadedFiles: [],
    deleteModalOpen: false,
    fileToDelete: null
  });

  useEffect(() => { fetchUploadedFiles(); }, []);

  const fetchUploadedFiles = async () => {
    const { data } = await api.get('/arquivos');
    setState(prev => ({ ...prev, uploadedFiles: data }));
  };

  const handleUpload = async () => {
    if (!state.file) return;
    
    const formData = new FormData();
    formData.append('arquivo', state.file);
    
    setState(prev => ({ ...prev, loading: true, progress: 0 }));
    
    try {
      await api.post('/arquivos/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: e => {
          const percent = Math.round((e.loaded * 100) / e.total);
          setState(prev => ({ ...prev, progress: percent }));
        }
      });
      fetchUploadedFiles();
      setState(prev => ({ ...prev, file: null }));
    } finally {
      setState(prev => ({ ...prev, loading: false, progress: 0 }));
    }
  };

  const handleDelete = async () => {
    await api.delete(`/arquivos/${state.fileToDelete.id}`);
    fetchUploadedFiles();
    setState(prev => ({ ...prev, deleteModalOpen: false, fileToDelete: null }));
  };

  return (
    <Paper withBorder p="xl" radius="md">
      <LoadingOverlay visible={state.loading} />
      <Title order={2} mb="xl">Gerenciamento de Arquivos</Title>

      <Paper withBorder p="md" mb="xl">
        <Text size="lg" mb="md">Upload de Arquivos</Text>
        <Group align="flex-end">
          <FileInput
            value={state.file}
            onChange={file => setState(prev => ({ ...prev, file }))}
            accept={ACCEPTED_FILE_TYPES.join(',')}
            placeholder="Selecione o arquivo"
            style={{ flex: 1 }}
            clearable
          />
          <Button leftSection={<IconUpload size={16} />} onClick={handleUpload} disabled={!state.file}>
            Enviar
          </Button>
        </Group>
        {state.progress > 0 && <Progress value={state.progress} striped animated mt="md" />}
        <Text size="sm" c="dimmed" mt="sm">Formatos aceitos: PDF, JPG, PNG, DOC, DOCX (Máx. 10MB)</Text>
      </Paper>

      <Title order={3} mb="md">Arquivos Enviados</Title>

      {state.uploadedFiles.length === 0 ? (
        <Text c="dimmed">Nenhum arquivo foi enviado ainda</Text>
      ) : (
        <Table striped>
          <thead>
            <tr>
              <th>Arquivo</th>
              <th>Tipo</th>
              <th>Tamanho</th>
              <th>Data</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {state.uploadedFiles.map(file => (
              <tr key={file.id}>
                <td><Group><IconFileDescription size={16} /><Text>{file.nome}</Text></Group></td>
                <td><Badge color="gray" variant="outline">{file.tipo.split('/')[1]}</Badge></td>
                <td>{(file.tamanho / (1024 * 1024)).toFixed(2)} MB</td>
                <td>{new Date(file.dataUpload).toLocaleDateString('pt-BR')}</td>
                <td>
                  <Group noWrap>
                    <ActionIcon color="blue" onClick={() => window.open(file.url, '_blank')} title="Download">
                      <IconDownload size={18} />
                    </ActionIcon>
                    <ActionIcon color="red" onClick={() => setState(prev => ({ ...prev, fileToDelete: file, deleteModalOpen: true }))}>
                      <IconTrash size={18} />
                    </ActionIcon>
                  </Group>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal opened={state.deleteModalOpen} onClose={() => setState(prev => ({ ...prev, deleteModalOpen: false }))} title="Confirmar exclusão">
        <Text mb="xl">Tem certeza que deseja excluir o arquivo "{state.fileToDelete?.nome}"?</Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={() => setState(prev => ({ ...prev, deleteModalOpen: false }))}>Cancelar</Button>
          <Button color="red" onClick={handleDelete}>Excluir</Button>
        </Group>
      </Modal>
    </Paper>
  );
}
export default FilesPage;