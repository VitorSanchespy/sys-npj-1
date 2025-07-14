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

export function FileList({ processoId }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  useEffect(() => {
    fetchFiles();
    // eslint-disable-next-line
  }, [processoId]);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/api/arquivos/processo/${processoId}`);
      setFiles(data);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!fileToDelete) return;
    await api.delete(`/api/arquivos/${fileToDelete.id}`);
    fetchFiles();
    setFileToDelete(null);
  };

  return (
    <Paper withBorder p="md" radius="md">
      <Group justify="space-between" mb="md">
        <Text size="lg" fw={500}>Arquivos do Processo</Text>
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
                <th>Tipo</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {files.map(file => (
                <tr key={file.id}>
                  <td>
                    <Group gap="sm">
                      <IconFile color="#495057"/>
                      {file.nome}
                    </Group>
                  </td>
                  <td>{formatBytes(file.tamanho)}</td>
                  <td>{file.tipo}</td>
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
                          <a href={file.url} target="_blank" rel="noopener noreferrer" style={{textDecoration: 'none', color: 'inherit'}}>Baixar</a>
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
        <Text mb="xl">Excluir "{fileToDelete?.nome}"?</Text>
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
            // Implemente a lógica de upload aqui
            setUploadModalOpen(false);
            fetchFiles();
          }}
          accept={['image/*', 'application/pdf']}
        />
      </Modal>
    </Paper>
  );
}

// Helper function
function formatBytes(bytes) {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default FileList;