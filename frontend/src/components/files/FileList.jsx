import { useState, useEffect } from 'react';
import { 
  Table, 
  Group, 
  Text, 
  Button,
  Paper,
  Modal,
  ScrollArea,
  Menu,
  ActionIcon,
  Breadcrumbs,
  Anchor,
  Loader
} from '@mantine/core';
import { IconDownload, IconTrash, IconEye, IconUpload, IconFolder, IconFile, IconArrowLeft, IconDots } from '@tabler/icons-react';
import api from '@/api/apiService';
import Dropzone from './Dropzone';

export function FileList() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentFolder, setCurrentFolder] = useState('');
  const [fileToDelete, setFileToDelete] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async (folder = '') => {
    setLoading(true);
    try {
      const { data } = await api.get(`/files?folder=${folder}`);
      setFiles(data);
      setCurrentFolder(folder);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!fileToDelete) return;
    await api.delete(`/files/${fileToDelete.id}`);
    fetchFiles(currentFolder);
    setFileToDelete(null);
  };

  const handleFolderClick = (folderPath) => fetchFiles(folderPath);
  const handleBack = () => fetchFiles(currentFolder.split('/').slice(0, -1).join('/'));

  return (
    <Paper withBorder p="md" radius="md">
      <Group justify="space-between" mb="md">
        <Breadcrumbs>
          <Anchor onClick={() => fetchFiles()}>Home</Anchor>
          {currentFolder.split('/').map((part, i) => 
            <Anchor key={i} onClick={() => fetchFiles(currentFolder.split('/').slice(0, i+1).join('/'))}>
              {part}
            </Anchor>
          )}
        </Breadcrumbs>
        
        <Button leftSection={<IconUpload size={18}/>} onClick={() => setUploadModalOpen(true)}>
          Upload
        </Button>
      </Group>

      {loading ? (
        <Group justify="center" py="xl"><Loader /></Group>
      ) : (
        <ScrollArea>
          <Table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Tamanho</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {currentFolder && (
                <tr>
                  <td colSpan={3}>
                    <Button 
                      variant="subtle" 
                      leftSection={<IconArrowLeft size={16}/>}
                      onClick={handleBack}
                      fullWidth
                    >
                      Voltar
                    </Button>
                  </td>
                </tr>
              )}
              
              {files.map(file => (
                <tr key={file.id}>
                  <td>
                    <Group gap="sm">
                      {file.type === 'directory' 
                        ? <IconFolder color="#4DABF7"/> 
                        : <IconFile color="#495057"/>}
                      {file.name}
                    </Group>
                  </td>
                  <td>{file.type !== 'directory' ? formatBytes(file.size) : '-'}</td>
                  <td>
                    <Menu>
                      <Menu.Target>
                        <ActionIcon><IconDots size={16}/></ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item leftSection={<IconEye size={14}/>}>
                          Visualizar
                        </Menu.Item>
                        <Menu.Item leftSection={<IconDownload size={14}/>}>
                          Baixar
                        </Menu.Item>
                        <Menu.Item 
                          color="red" 
                          leftSection={<IconTrash size={14}/>}
                          onClick={() => setFileToDelete(file)}
                        >
                          Excluir
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </ScrollArea>
      )}

      <Modal
        opened={!!fileToDelete}
        onClose={() => setFileToDelete(null)}
        title="Confirmar exclusão"
      >
        <Text mb="xl">Excluir "{fileToDelete?.name}"?</Text>
        <Group justify="right">
          <Button variant="default" onClick={() => setFileToDelete(null)}>Cancelar</Button>
          <Button color="red" onClick={handleDelete}>Excluir</Button>
        </Group>
      </Modal>

      <Modal
        opened={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="Upload de arquivos"
      >
        <Dropzone 
          onDrop={(files) => {
            console.log('Files uploaded:', files);
            setUploadModalOpen(false);
            fetchFiles(currentFolder);
          }}
          accept={['image/*', 'application/pdf']}
        />
      </Modal>
    </Paper>
  );
}

// Helper function
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default FileList;