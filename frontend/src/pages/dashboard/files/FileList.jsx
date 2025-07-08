import { useState, useEffect } from 'react';
import { 
  Table, 
  Group, 
  Text, 
  ActionIcon, 
  Loader, 
  Paper, 
  Badge,
  Modal,
  Button,
  Flex,
  Breadcrumbs,
  Anchor
} from '@mantine/core';
import { 
  IconDownload, 
  IconTrash, 
  IconEye, 
  IconUpload,
  IconFolder,
  IconFile,
  IconArrowLeft
} from '@tabler/icons-react';
import api from '@/api/apiService';
import useNotification from '@/hooks/useNotification';
import UploadModal from './UploadModal';
import { formatBytes, formatDate } from '@/utils/format';

export default function FileList() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentFolder, setCurrentFolder] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const { showNotification } = useNotification();

  const fetchFiles = async (folder = '') => {
    setLoading(true);
    try {
      const { data } = await api.get(`/files?folder=${folder}`);
      setFiles(data);
      setCurrentFolder(folder);
    } catch (error) {
      showNotification('Erro ao carregar arquivos', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleDownload = (fileId, fileName) => {
    window.open(`${api.defaults.baseURL}/files/download/${fileId}`, '_blank');
    showNotification(`Download iniciado: ${fileName}`, 'success');
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/files/${fileToDelete.id}`);
      showNotification('Arquivo removido com sucesso', 'success');
      fetchFiles(currentFolder);
    } catch (error) {
      showNotification('Erro ao remover arquivo', 'error');
    } finally {
      setDeleteModalOpen(false);
    }
  };

  const handleFolderClick = (folderPath) => {
    fetchFiles(folderPath);
  };

  const handleBack = () => {
    const parentFolder = currentFolder.split('/').slice(0, -1).join('/');
    fetchFiles(parentFolder);
  };

  const getFileIcon = (type) => {
    if (type === 'directory') return <IconFolder size={18} color="#4DABF7" />;
    
    const extension = type.split('/').pop();
    switch(extension) {
      case 'pdf': return <IconFile size={18} color="#E64980" />;
      case 'doc':
      case 'docx': return <IconFile size={18} color="#339AF0" />;
      default: return <IconFile size={18} color="#495057" />;
    }
  };

  const breadcrumbs = [
    { title: 'Home', onClick: () => fetchFiles('') },
    ...currentFolder.split('/').map((part, index, parts) => ({
      title: part || 'Home',
      onClick: () => fetchFiles(parts.slice(0, index + 1).join('/'))
    }))
  ].filter(item => item.title);

  return (
    <Paper withBorder p="md" radius="md">
      <Flex justify="space-between" align="center" mb="md">
        <Breadcrumbs separator="→">
          {breadcrumbs.map((item, index) => (
            <Anchor key={index} onClick={item.onClick}>
              {item.title}
            </Anchor>
          ))}
        </Breadcrumbs>
        
        <Button 
          leftIcon={<IconUpload size={18} />}
          onClick={() => setUploadModalOpen(true)}
        >
          Upload
        </Button>
      </Flex>

      {loading ? (
        <Group position="center" py="xl">
          <Loader size="xl" variant="dots" />
        </Group>
      ) : (
        <Table striped highlightOnHover>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Tipo</th>
              <th>Tamanho</th>
              <th>Modificado</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {currentFolder && (
              <tr>
                <td colSpan={5}>
                  <Button 
                    variant="subtle" 
                    leftIcon={<IconArrowLeft size={16} />}
                    onClick={handleBack}
                  >
                    Voltar
                  </Button>
                </td>
              </tr>
            )}
            
            {files.map((file) => (
              <tr key={file.id}>
                <td>
                  <Group spacing="sm">
                    {getFileIcon(file.type)}
                    {file.type === 'directory' ? (
                      <Anchor onClick={() => handleFolderClick(file.path)}>
                        {file.name}
                      </Anchor>
                    ) : (
                      <Text>{file.name}</Text>
                    )}
                  </Group>
                </td>
                <td>
                  {file.type === 'directory' ? (
                    <Badge color="blue">Pasta</Badge>
                  ) : (
                    <Badge color="gray">{file.type}</Badge>
                  )}
                </td>
                <td>{file.type !== 'directory' ? formatBytes(file.size) : '-'}</td>
                <td>{formatDate(file.modifiedAt)}</td>
                <td>
                  <Group spacing="xs">
                    {file.type !== 'directory' && (
                      <>
                        <ActionIcon 
                          onClick={() => handleDownload(file.id, file.name)}
                          color="blue"
                        >
                          <IconDownload size={18} />
                        </ActionIcon>
                        <ActionIcon 
                          onClick={() => {
                            setFileToDelete(file);
                            setDeleteModalOpen(true);
                          }}
                          color="red"
                        >
                          <IconTrash size={18} />
                        </ActionIcon>
                      </>
                    )}
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
        <Text mb="xl">Tem certeza que deseja excluir "{fileToDelete?.name}"?</Text>
        <Group position="right">
          <Button variant="default" onClick={() => setDeleteModalOpen(false)}>
            Cancelar
          </Button>
          <Button color="red" onClick={handleDelete}>
            Excluir
          </Button>
        </Group>
      </Modal>

      <UploadModal
        opened={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        currentFolder={currentFolder}
        onUploadSuccess={() => {
          fetchFiles(currentFolder);
          showNotification('Arquivo enviado com sucesso', 'success');
        }}
      />
    </Paper>
  );
}