import { useState, useRef } from 'react';
import { 
  Paper, 
  Button, 
  Group, 
  Text, 
  Box,
  Progress,
  Alert,
  Stack,
  List,
  ThemeIcon,
  Badge,
  ActionIcon,
  useMantineTheme // Substituímos createStyles por useMantineTheme
} from '@mantine/core';
import { 
  IconUpload, 
  IconCheck, 
  IconX, 
  IconTrash,
  IconFile,
  IconCloudUpload
} from '@tabler/icons-react';
import api from '@/api/apiService';
import { notifications } from '@mantine/notifications';
import { formatBytes } from '@/utils/formatters';
import Dropzone from './Dropzone';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png'
];

export default function FileUpload({ processoId, folderPath = '', onUploadSuccess }) {
  const theme = useMantineTheme(); // Usamos o hook para acessar o tema
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({});
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  const handleFileChange = (selectedFiles) => {
    const newFiles = Array.from(selectedFiles);
    const validFiles = [];
    const newErrors = {};
    
    newFiles.forEach(file => {
      const fileErrors = [];
      
      // Verificar tipo
      if (!ACCEPTED_TYPES.includes(file.type)) {
        fileErrors.push(`Tipo não suportado: ${file.type}`);
      }
      
      // Verificar tamanho
      if (file.size > MAX_FILE_SIZE) {
        fileErrors.push(`Tamanho máximo: ${formatBytes(MAX_FILE_SIZE)}`);
      }
      
      if (fileErrors.length > 0) {
        newErrors[file.name] = fileErrors;
      } else {
        validFiles.push(file);
      }
    });
    
    setFiles(prev => [...prev, ...validFiles]);
    setErrors(newErrors);
  };

  const removeFile = (fileName) => {
    setFiles(prev => prev.filter(f => f.name !== fileName));
  };

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    if (processoId) formData.append('processoId', processoId);
    if (folderPath) formData.append('folder', folderPath);
    
    return api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        setProgress(prev => ({
          ...prev,
          [file.name]: percentCompleted
        }));
      }
    });
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      notifications.show({
        title: 'Nenhum arquivo selecionado',
        message: 'Selecione pelo menos um arquivo para enviar',
        color: 'yellow'
      });
      return;
    }

    setUploading(true);
    setProgress({});
    
    try {
      const uploadPromises = files.map(file => uploadFile(file));
      await Promise.all(uploadPromises);
      
      notifications.show({
        title: 'Upload concluído!',
        message: `${files.length} arquivo(s) enviado(s) com sucesso`,
        color: 'teal',
        icon: <IconCheck size={18} />,
      });
      
      setFiles([]);
      if (onUploadSuccess) onUploadSuccess();
    } catch (error) {
      notifications.show({
        title: 'Erro no upload',
        message: error.response?.data?.message || 'Falha ao enviar arquivos',
        color: 'red',
        icon: <IconX size={18} />,
      });
    } finally {
      setUploading(false);
      setProgress({});
    }
  };

  return (
    <Paper withBorder p="lg" radius="md">
      <Stack spacing="md">
        <Text size="xl" fw={600} mb="sm">
          {folderPath ? `Upload em ${folderPath}` : 'Upload de Documentos'}
        </Text>
        
        <Dropzone 
          onDrop={handleFileChange}
          accept={ACCEPTED_TYPES}
          maxSize={MAX_FILE_SIZE}
          loading={uploading}
        />
        
        {Object.keys(errors).length > 0 && (
          <Alert 
            icon={<IconX size={18} />} 
            title="Arquivos inválidos" 
            color="red"
            mb="md"
          >
            {Object.entries(errors).map(([fileName, errors]) => (
              <div key={fileName}>
                <Text fw={500}>{fileName}:</Text>
                <List size="sm">
                  {errors.map((error, i) => (
                    <List.Item key={i}>{error}</List.Item>
                  ))}
                </List>
              </div>
            ))}
          </Alert>
        )}
        
        {files.length > 0 && (
          <Box>
            <Text fw={500} mb="sm">Arquivos selecionados:</Text>
            <Stack spacing="xs">
              {files.map(file => (
                <Group 
                  key={file.name} 
                  position="apart" 
                  sx={(theme) => ({
                    border: `1px solid ${theme.colors.gray[3]}`,
                    borderRadius: theme.radius.sm,
                    padding: theme.spacing.sm,
                    marginBottom: theme.spacing.xs
                  })}
                >
                  <Group>
                    <ThemeIcon variant="light" size="md" radius="xl">
                      <IconFile size={16} />
                    </ThemeIcon>
                    <div>
                      <Text fw={500} lineClamp={1}>{file.name}</Text>
                      <Text size="sm" c="dimmed">{formatBytes(file.size)}</Text>
                    </div>
                  </Group>
                  
                  <Group spacing="xs">
                    {progress[file.name] > 0 && (
                      <Badge variant="outline">
                        {progress[file.name]}%
                      </Badge>
                    )}
                    <ActionIcon 
                      color="red" 
                      onClick={() => removeFile(file.name)}
                      disabled={uploading}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Group>
              ))}
            </Stack>
          </Box>
        )}
        
        {files.length > 0 && (
          <Button
            leftIcon={<IconCloudUpload size={18} />}
            onClick={handleUpload}
            loading={uploading}
            fullWidth
            size="md"
          >
            {uploading ? 'Enviando...' : `Enviar ${files.length} arquivo(s)`}
          </Button>
        )}
        
        <Text size="sm" c="dimmed">
          Formatos aceitos: PDF, DOC, DOCX, JPG, PNG • Tamanho máximo: {formatBytes(MAX_FILE_SIZE)}
        </Text>
      </Stack>
    </Paper>
  );
}