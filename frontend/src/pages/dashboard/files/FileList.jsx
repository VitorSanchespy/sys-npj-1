import { useState, useEffect, useCallback } from 'react';
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
  Anchor,
  ScrollArea,
  Menu,
  createStyles
} from '@mantine/core';
import { 
  IconDownload, 
  IconTrash, 
  IconEye, 
  IconUpload,
  IconFolder,
  IconFile,
  IconArrowLeft,
  IconDots,
  IconFileZip,
  IconFileText,
  IconFileSpreadsheet,
  IconFileCode,
  IconFileMusic,
  IconFileUnknown
} from '@tabler/icons-react';
import api from '@/api/apiService';
import { notifications } from '@mantine/notifications';
import UploadModal from './UploadModal';
import { formatBytes, formatDate } from '@/utils/format';
import FilePreviewModal from './FilePreviewModal';

const useStyles = createStyles((theme) => ({
  fileRow: {
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: theme.colorScheme === 'dark' 
        ? theme.colors.dark[6] 
        : theme.colors.gray[0],
    },
  },
  directoryRow: {
    backgroundColor: theme.colorScheme === 'dark' 
      ? theme.colors.dark[5] 
      : theme.colors.blue[0],
    '&:hover': {
      backgroundColor: theme.colorScheme === 'dark' 
        ? theme.colors.dark[4] 
        : theme.colors.blue[1],
    },
  },
}));

export default function FileList() {
  const { classes } = useStyles();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentFolder, setCurrentFolder] = useState('');
  const [fileToDelete, setFileToDelete] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [contextMenuFile, setContextMenuFile] = useState(null);

  const fetchFiles = useCallback(async (folder = '') => {
    setLoading(true);
    try {
      const { data } = await api.get(`/files?folder=${folder}`);
      setFiles(data);
      setCurrentFolder(folder);
    } catch (error) {
      notifications.show({
        title: 'Erro ao carregar arquivos',
        message: error.response?.data?.message || 'Tente novamente mais tarde',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleDownload = (fileId, fileName) => {
    window.open(`${api.defaults.baseURL}/files/download/${fileId}`, '_blank');
    notifications.show({
      title: 'Download iniciado',
      message: `Arquivo: ${fileName}`,
      color: 'teal',
    });
  };

  const handleDelete = async () => {
    if (!fileToDelete) return;
    
    try {
      await api.delete(`/files/${fileToDelete.id}`);
      notifications.show({
        title: 'Arquivo removido',
        message: `"${fileToDelete.name}" foi excluído`,
        color: 'green',
      });
      fetchFiles(currentFolder);
    } catch (error) {
      notifications.show({
        title: 'Erro ao remover arquivo',
        message: error.response?.data?.message || 'Tente novamente',
        color: 'red',
      });
    } finally {
      setFileToDelete(null);
    }
  };

  const handleFolderClick = (folderPath) => {
    fetchFiles(folderPath);
  };

  const handleBack = () => {
    const parentFolder = currentFolder.split('/').slice(0, -1).join('/');
    fetchFiles(parentFolder);
  };

  const getFileIcon = (fileType) => {
    if (fileType === 'directory') return <IconFolder size={18} color="#4DABF7" />;
    
    const type = fileType.split('/')[0];
    const extension = fileType.split('/').pop();
    
    const iconProps = { size: 18 };
    
    switch (type) {
      case 'image':
        return <IconFile {...iconProps} color="#E64980" />;
      case 'video':
        return <IconFile {...iconProps} color="#7950F2" />;
      case 'audio':
        return <IconFileMusic {...iconProps} color="#40C057" />;
      case 'text':
        return <IconFileText {...iconProps} color="#228BE6" />;
      case 'application':
        switch(extension) {
          case 'pdf': return <IconFileText {...iconProps} color="#E03131" />;
          case 'zip': return <IconFileZip {...iconProps} color="#FAB005" />;
          case 'vnd.ms-excel':
          case 'vnd.openxmlformats-officedocument.spreadsheetml.sheet':
            return <IconFileSpreadsheet {...iconProps} color="#37B24D" />;
          case 'msword':
          case 'vnd.openxmlformats-officedocument.wordprocessingml.document':
            return <IconFileText {...iconProps} color="#228BE6" />;
          default: return <IconFile {...iconProps} color="#495057" />;
        }
      default:
        return <IconFileUnknown {...iconProps} color="#868E96" />;
    }
  };

  const breadcrumbs = [
    { title: 'Home', onClick: () => fetchFiles('') },
    ...currentFolder.split('/').map((part, index, parts) => ({
      title: part || 'Home',
      onClick: () => fetchFiles(parts.slice(0, index + 1).join('/'))
    }))
  ].filter(item => item.title);

  const handlePreview = (file) => {
    if (file.type === 'directory') {
      handleFolderClick(file.path);
      return;
    }
    
    setPreviewFile(file);
    setPreviewModalOpen(true);
  };

  const handleContextMenu = (e, file) => {
    e.preventDefault();
    setContextMenuFile(file);
  };

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
        <ScrollArea>
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
                <tr className={classes.directoryRow}>
                  <td colSpan={5}>
                    <Button 
                      variant="subtle" 
                      leftIcon={<IconArrowLeft size={16} />}
                      onClick={handleBack}
                      fullWidth
                      justify="left"
                    >
                      Voltar
                    </Button>
                  </td>
                </tr>
              )}
              
              {files.map((file) => (
                <tr 
                  key={file.id} 
                  className={file.type === 'directory' ? classes.directoryRow : classes.fileRow}
                  onDoubleClick={() => handlePreview(file)}
                  onContextMenu={(e) => handleContextMenu(e, file)}
                >
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
                      <Menu position="bottom-end">
                        <Menu.Target>
                          <ActionIcon>
                            <IconDots size={16} />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item 
                            icon={<IconEye size={14} />}
                            onClick={() => handlePreview(file)}
                          >
                            Visualizar
                          </Menu.Item>
                          {file.type !== 'directory' && (
                            <>
                              <Menu.Item 
                                icon={<IconDownload size={14} />}
                                onClick={() => handleDownload(file.id, file.name)}
                              >
                                Baixar
                              </Menu.Item>
                              <Menu.Divider />
                              <Menu.Item 
                                color="red"
                                icon={<IconTrash size={14} />}
                                onClick={() => {
                                  setFileToDelete(file);
                                }}
                              >
                                Excluir
                              </Menu.Item>
                            </>
                          )}
                        </Menu.Dropdown>
                      </Menu>
                    </Group>
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
        <Text mb="xl">Tem certeza que deseja excluir "{fileToDelete?.name}"?</Text>
        <Group position="right">
          <Button variant="default" onClick={() => setFileToDelete(null)}>
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
          notifications.show({
            title: 'Upload concluído',
            message: 'Arquivo(s) enviado(s) com sucesso',
            color: 'teal',
          });
        }}
      />

      <FilePreviewModal
        file={previewFile}
        opened={previewModalOpen}
        onClose={() => {
          setPreviewModalOpen(false);
          setPreviewFile(null);
        }}
        onDownload={() => {
          if (previewFile) {
            handleDownload(previewFile.id, previewFile.name);
          }
        }}
      />
    </Paper>
  );
} 