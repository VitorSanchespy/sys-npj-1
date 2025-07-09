import { useRef, useState } from 'react';
import { 
  Group, 
  Text, 
  Box, 
  createStyles,
  FileButton
} from '@mantine/core';
import { IconUpload, IconFile } from '@tabler/icons-react';

const useStyles = createStyles((theme) => ({
  dropzone: {
    border: `2px dashed ${theme.colors.gray[4]}`,
    borderRadius: theme.radius.md,
    padding: theme.spacing.xl,
    textAlign: 'center',
    cursor: 'pointer',
    backgroundColor: theme.fn.rgba(theme.colors.gray[0], 0.3),
    transition: 'all 150ms ease',
    '&:hover': {
      backgroundColor: theme.fn.rgba(theme.colors.blue[0], 0.2),
      borderColor: theme.colors.blue[4]
    }
  },
  active: {
    backgroundColor: theme.fn.rgba(theme.colors.blue[0], 0.4),
    borderColor: theme.colors.blue[6]
  }
}));

export default function Dropzone({ onDrop, accept, maxSize, loading }) {
  const { classes, cx } = useStyles();
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
          className={cx(classes.dropzone, { [classes.active]: isActive })}
          onDragEnter={() => setIsActive(true)}
          onDragLeave={() => setIsActive(false)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            setIsActive(false);
            if (e.dataTransfer.files.length > 0) {
              handleFileChange(e.dataTransfer.files);
            }
          }}
        >
          <Group position="center" spacing="xs">
            <IconUpload size={48} color="#868E96" />
            <div>
              <Text fw={500}>Arraste arquivos aqui ou clique para selecionar</Text>
              <Text size="sm" c="dimmed">
                Formatos suportados: PDF, DOC, DOCX, JPG, PNG
              </Text>
            </div>
          </Group>
        </Box>
      )}
    </FileButton>
  );
}