import { Modal, Text, Group, Button } from '@mantine/core';
import { IconDownload, IconX } from '@tabler/icons-react';

export function FilePreviewModal({ file, opened, onClose, onDownload }) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={file?.name || 'Pré-visualização'}
      size="md"
    >
      <Text mb="xl">
        Pré-visualização não disponível para este arquivo
      </Text>
      
      <Group justify="flex-end">
        <Button 
          variant="default" 
          leftSection={<IconX size={16} />}
          onClick={onClose}
        >
          Fechar
        </Button>
        <Button 
          leftSection={<IconDownload size={16} />}
          onClick={onDownload}
        >
          Baixar
        </Button>
      </Group>
    </Modal>
  );
}

export default FilePreviewModal;