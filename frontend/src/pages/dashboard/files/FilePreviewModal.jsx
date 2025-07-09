import { Modal, Image, Text, Group, Button } from '@mantine/core';
import { IconDownload, IconX } from '@tabler/icons-react';

export default function FilePreviewModal({ file, opened, onClose, onDownload }) {
  if (!file) return null;

  const isImage = file.type.startsWith('image/');
  
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={file.name}
      size="lg"
      overflow="inside"
    >
      {isImage ? (
        <Image 
          src={`${api.defaults.baseURL}/files/preview/${file.id}`} 
          alt={file.name}
          fit="contain"
          style={{ maxHeight: '60vh' }}
        />
      ) : (
        <Group position="center" my="xl">
          <Text color="dimmed">
            Pré-visualização não disponível para este tipo de arquivo
          </Text>
        </Group>
      )}
      
      <Group position="right" mt="md">
        <Button 
          variant="default" 
          leftIcon={<IconX size={18} />}
          onClick={onClose}
        >
          Fechar
        </Button>
        <Button 
          leftIcon={<IconDownload size={18} />}
          onClick={onDownload}
        >
          Baixar
        </Button>
      </Group>
    </Modal>
  );
}