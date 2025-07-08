import { useState } from 'react';
import { Paper, Button, Group, Text, LoadingOverlay } from '@mantine/core';
import { IconUpload } from '@tabler/icons-react';
import { uploadFile } from '../../../services/api';

export default function FileUpload({ processoId }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      setError('Selecione um arquivo primeiro');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      await uploadFile(processoId, file);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.erro || 'Erro ao enviar arquivo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper withBorder p="md" style={{ position: 'relative' }}>
      <LoadingOverlay visible={loading} />
      <Text size="lg" mb="md">Upload de Arquivo</Text>
      
      <Group>
        <input 
          type="file" 
          onChange={(e) => setFile(e.target.files[0])} 
          accept=".pdf,.jpg,.jpeg,.png"
        />
        <Button 
          leftIcon={<IconUpload size={14} />}
          onClick={handleUpload}
          disabled={!file || loading}
        >
          Enviar
        </Button>
      </Group>

      {error && <Text color="red" mt="sm">{error}</Text>}
      {success && <Text color="green" mt="sm">Arquivo enviado com sucesso!</Text>}
    </Paper>
  );
}