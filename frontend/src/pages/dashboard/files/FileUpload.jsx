import { useState } from 'react';
import { 
  Paper, 
  Button, 
  Group, 
  Text, 
  LoadingOverlay,
  Box,
  FileInput,
  Alert,
  Progress
} from '@mantine/core';
import { IconUpload, IconCheck, IconX } from '@tabler/icons-react';
import api from '@/api/apiService';
import { useNotification } from '@/contexts/NotificationContext';

export default function FileUpload({ processoId, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { showNotification } = useNotification();

  const handleUpload = async () => {
    if (!file) {
      showNotification('Selecione um arquivo primeiro', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('processoId', processoId);

    setLoading(true);
    setProgress(0);

    try {
      await api.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentCompleted);
        }
      });

      showNotification('Arquivo enviado com sucesso!', 'success');
      setFile(null);
      if (onUploadSuccess) onUploadSuccess();
    } catch (error) {
      showNotification(
        error.response?.data?.message || 'Erro ao enviar arquivo', 
        'error'
      );
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <Paper withBorder p="md" pos="relative">
      <LoadingOverlay 
        visible={loading} 
        overlayBlur={2} 
        loaderProps={{ size: 'lg' }}
      />
      
      <Text size="lg" fw={500} mb="md">
        Upload de Documento
      </Text>

      <Box mb="md">
        <FileInput
          value={file}
          onChange={setFile}
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          placeholder="Selecione o arquivo"
          clearable
          disabled={loading}
        />
      </Box>

      {progress > 0 && progress < 100 && (
        <Progress value={progress} striped animated mb="md" />
      )}

      {progress === 100 && (
        <Alert icon={<IconCheck size={18} />} color="green" mb="md">
          Upload concluído! Processando arquivo...
        </Alert>
      )}

      <Group justify="flex-end">
        <Button
          leftIcon={<IconUpload size={16} />}
          onClick={handleUpload}
          disabled={!file || loading}
          loading={loading}
        >
          {loading ? 'Enviando...' : 'Enviar Documento'}
        </Button>
      </Group>

      <Text mt="sm" c="dimmed" size="sm">
        Formatos aceitos: PDF, DOC, JPG, PNG (Tamanho máximo: 10MB)
      </Text>
    </Paper>
  );
}