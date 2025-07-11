import { useState } from 'react';
import { Paper, Button, Text, Group, Stack, ActionIcon } from '@mantine/core';
import { IconTrash, IconFile, IconCloudUpload } from '@tabler/icons-react';
import Dropzone from './Dropzone';

export function FileUpload() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (newFiles) => {
    setFiles([...files, ...newFiles.slice(0, 5)]);
  };

  const removeFile = (fileName) => {
    setFiles(files.filter(f => f.name !== fileName));
  };

  const handleUpload = () => {
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      setFiles([]);
      alert('Upload concluído!');
    }, 2000);
  };

  return (
    <Paper withBorder p="lg" radius="md">
      <Stack gap="md">
        <Text size="xl" fw={600}>Upload de Documentos</Text>
        
        <Dropzone onDrop={handleFileChange} accept={['image/*', 'application/pdf']}/>
        
        {files.length > 0 && (
          <div>
            <Text fw={500} mb="sm">Arquivos:</Text>
            <Stack gap="xs">
              {files.map(file => (
                <Group key={file.name} justify="space-between" p="sm" bg="#f8f9fa">
                  <Group>
                    <IconFile size={16} />
                    <Text fw={500}>{file.name}</Text>
                  </Group>
                  <ActionIcon color="red" onClick={() => removeFile(file.name)}>
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              ))}
            </Stack>
          </div>
        )}
        
        {files.length > 0 && (
          <Button
            leftSection={<IconCloudUpload size={18} />}
            onClick={handleUpload}
            loading={uploading}
          >
            {uploading ? 'Enviando...' : `Enviar ${files.length} arquivo(s)`}
          </Button>
        )}
      </Stack>
    </Paper>
  );
}

export default FileUpload;