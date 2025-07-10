import { useRef, useState } from 'react';
import { 
  Group, 
  Text, 
  Box, 
  FileButton,
  useMantineTheme // Adicionei o hook para acessar o tema
} from '@mantine/core';
import { IconUpload, IconFile } from '@tabler/icons-react';

export default function Dropzone({ onDrop, accept, maxSize, loading }) {
  const theme = useMantineTheme(); // Acesso ao tema
  const [isActive, setIsActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (files) => {
    onDrop(files);
  };

  return (
    <FileButton 
      onChange={handleFileChange} 
      accept={accept?.join(',')}
      multiple
      disabled={loading}
    >
      {(props) => (
        <Box 
          {...props}
          sx={(theme) => ({
            border: `2px dashed ${isActive ? theme.colors.blue[6] : theme.colors.gray[4]}`,
            borderRadius: theme.radius.md,
            padding: theme.spacing.xl,
            textAlign: 'center',
            cursor: loading ? 'not-allowed' : 'pointer',
            backgroundColor: isActive 
              ? theme.fn.rgba(theme.colors.blue[0], 0.4) 
              : theme.fn.rgba(theme.colors.gray[0], 0.3),
            transition: 'all 150ms ease',
            '&:hover': loading ? {} : {
              backgroundColor: theme.fn.rgba(theme.colors.blue[0], 0.2),
              borderColor: theme.colors.blue[4]
            },
            opacity: loading ? 0.7 : 1,
          })}
          onDragEnter={() => !loading && setIsActive(true)}
          onDragLeave={() => setIsActive(false)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            setIsActive(false);
            if (!loading && e.dataTransfer.files.length > 0) {
              handleFileChange(e.dataTransfer.files);
            }
          }}
        >
          <Group position="center" spacing="xs">
            <IconUpload size={48} color={isActive ? theme.colors.blue[6] : theme.colors.gray[6]} />
            <div>
              <Text fw={500} c={isActive ? 'blue' : 'gray'}>
                Arraste arquivos aqui ou clique para selecionar
              </Text>
              <Text size="sm" c="dimmed">
                Formatos suportados: {accept?.join(', ') || 'PDF, DOC, DOCX, JPG, PNG'}
              </Text>
            </div>
          </Group>
        </Box>
      )}
    </FileButton>
  );
}