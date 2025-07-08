import { useState } from 'react';
import { 
  Paper,
  Title,
  Text,
  Group,
  Button,
  LoadingOverlay,
  FileInput,
  Progress,
  List,
  Alert,
  Badge,
  Table,
  ActionIcon,
  Modal
} from '@mantine/core';
import { 
  IconUpload, 
  IconCheck, 
  IconX, 
  IconTrash,
  IconDownload,
  IconFileDescription
} from '@tabler/icons-react';
import api from '@/api/apiService';
import useNotification from '@/hooks/useNotification';

const ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

export default function ArquivoPage() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchUploadedFiles();
  }, []);

  const fetchUploadedFiles = async () => {
    try {
      const { data } = await api.get('/arquivos');
      setUploadedFiles(data);
    } catch (error) {
      showNotification('Erro ao carregar arquivos', 'error');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      showNotification('Selecione um arquivo primeiro', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('arquivo', file);
    
    setLoading(true);
    setProgress(0);

    try {
      await api.post('/arquivos/upload', formData, {
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
      fetchUploadedFiles();
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

  const handleDelete = async () => {
    try {
      await api.delete(`/arquivos/${fileToDelete.id}`);
      showNotification('Arquivo removido com sucesso', 'success');
      fetchUploadedFiles();
    } catch (error) {
      showNotification('Erro ao remover arquivo', 'error');
    } finally {
      setDeleteModalOpen(false);
      setFileToDelete(null);
    }
  };

  const getFileIcon = (type) => {
    if (type.includes('pdf')) return <IconFileDescription color="#E64980" />;
    if (type.includes('image')) return <IconFileDescription color="#40C057" />;
    if (type.includes('word')) return <IconFileDescription color="#228BE6" />;
    return <IconFileDescription color="#495057" />;
  };

  return (
    <Paper withBorder p="xl" radius="md" pos="relative">
      <LoadingOverlay visible={loading} overlayBlur={2} />

      <Title order={2} mb="xl">Gerenciamento de Arquivos</Title>

      <Paper withBorder p="md" mb="xl">
        <Text size="lg" mb="md">Upload de Arquivos</Text>
        
        <Group align="flex-end">
          <FileInput
            value={file}
            onChange={setFile}
            accept={ACCEPTED_FILE_TYPES.join(',')}
            placeholder="Selecione o arquivo"
            style={{ flex: 1 }}
            clearable
          />
          <Button
            leftIcon={<IconUpload size={16} />}
            onClick={handleUpload}
            disabled={!file || loading}
          >
            Enviar
          </Button>
        </Group>

        {progress > 0 && progress < 100 && (
          <Progress value={progress} striped animated mt="md" />
        )}

        <Text size="sm" c="dimmed" mt="sm">
          Formatos aceitos: PDF, JPG, PNG, DOC, DOCX (Máx. 10MB)
        </Text>
      </Paper>

      <Title order={3} mb="md">Arquivos Enviados</Title>

      {uploadedFiles.length === 0 ? (
        <Alert color="blue" icon={<IconFileDescription />}>
          Nenhum arquivo foi enviado ainda
        </Alert>
      ) : (
        <Table striped highlightOnHover>
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
            {uploadedFiles.map((file) => (
              <tr key={file.id}>
                <td>
                  <Group spacing="sm">
                    {getFileIcon(file.tipo)}
                    <Text>{file.nome}</Text>
                  </Group>
                </td>
                <td>
                  <Badge color="gray" variant="outline">
                    {file.tipo.split('/')[1]}
                  </Badge>
                </td>
                <td>{(file.tamanho / (1024 * 1024)).toFixed(2)} MB</td>
                <td>{new Date(file.dataUpload).toLocaleDateString('pt-BR')}</td>
                <td>
                  <Group spacing={4} noWrap>
                    <ActionIcon
                      color="blue"
                      onClick={() => window.open(file.url, '_blank')}
                      title="Download"
                    >
                      <IconDownload size={18} />
                    </ActionIcon>
                    <ActionIcon
                      color="red"
                      onClick={() => {
                        setFileToDelete(file);
                        setDeleteModalOpen(true);
                      }}
                      title="Excluir"
                    >
                      <IconTrash size={18} />
                    </ActionIcon>
                  </Group>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirmar exclusão"
      >
        <Text mb="xl">Tem certeza que deseja excluir o arquivo "{fileToDelete?.nome}"?</Text>
        <Group position="right">
          <Button variant="default" onClick={() => setDeleteModalOpen(false)}>
            Cancelar
          </Button>
          <Button color="red" onClick={handleDelete}>
            Excluir
          </Button>
        </Group>
      </Modal>
    </Paper>
  );
}