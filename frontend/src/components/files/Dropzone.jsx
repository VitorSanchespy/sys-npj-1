import { useState } from 'react';
import { Group, Text, Box, FileButton } from '@mantine/core';
import { IconUpload } from '@tabler/icons-react';

export function Dropzone({ onDrop, accept, loading }) {
  const [isActive, setIsActive] = useState(false);

  return (
    <FileButton 
      onChange={onDrop} 
      accept={accept?.join(',')}
      multiple
      disabled={loading}
    >
      {(props) => (
        <Box 
          {...props}
          p="xl"
          style={{
            border: `2px dashed ${isActive ? '#228be6' : '#ced4da'}`,
            borderRadius: '8px',
            textAlign: 'center',
            cursor: loading ? 'not-allowed' : 'pointer',
            backgroundColor: isActive ? '#e7f5ff' : '#f8f9fa',
            transition: 'all 150ms ease',
            opacity: loading ? 0.7 : 1,
          }}
          onDragEnter={() => !loading && setIsActive(true)}
          onDragLeave={() => setIsActive(false)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            setIsActive(false);
            if (!loading && e.dataTransfer.files.length > 0) {
              onDrop(e.dataTransfer.files);
            }
          }}
        >
          <Group justify="center" gap="xs">
            <IconUpload size={48} color={isActive ? '#228be6' : '#868e96'} />
            <div>
              <Text fw={500} c={isActive ? 'blue' : 'gray'}>
                Arraste arquivos ou clique para selecionar
              </Text>
              <Text size="sm" c="dimmed">
                Formatos: {accept?.join(', ') || 'PDF, DOC, DOCX, JPG, PNG'}
              </Text>
            </div>
          </Group>
        </Box>
      )}
    </FileButton>
  );
}

export default Dropzone;