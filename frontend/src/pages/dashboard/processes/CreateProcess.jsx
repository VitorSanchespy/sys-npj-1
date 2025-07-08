import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TextInput,
  Textarea,
  Select,
  Button,
  Paper,
  Title,
  LoadingOverlay,
  Group,
  Stack,
  Alert
} from '@mantine/core';
import { IconArrowLeft, IconCheck } from '@tabler/icons-react';
import api from '@/api/apiService';
import useNotification from '@/hooks/useNotification';
import { validateCPF } from '@/utils/validators';

const TIPOS_PROCESSO = [
  { value: 'civil', label: 'Civil' },
  { value: 'penal', label: 'Penal' },
  { value: 'trabalhista', label: 'Trabalhista' },
  { value: 'familia', label: 'Família' },
  { value: 'consumidor', label: 'Consumidor' },
];

export default function CreateProcess() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    numero: '',
    tipo: '',
    clienteCpf: '',
    clienteNome: '',
    descricao: '',
    status: 'ativo'
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateCPF(formData.clienteCpf)) {
      setError('CPF inválido');
      return;
    }

    setLoading(true);
    try {
      await api.post('/processos', formData);
      showNotification('Processo cadastrado com sucesso!', 'success');
      navigate('/processos');
    } catch (err) {
      const message = err.response?.data?.message || 'Erro ao cadastrar processo';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper withBorder p="xl" radius="md" pos="relative">
      <LoadingOverlay visible={loading} overlayBlur={2} />

      <Group mb="xl">
        <Button
          variant="subtle"
          leftIcon={<IconArrowLeft size={16} />}
          onClick={() => navigate(-1)}
        >
          Voltar
        </Button>
        <Title order={2}>Cadastrar Novo Processo</Title>
      </Group>

      {error && (
        <Alert color="red" mb="xl">
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Stack spacing="md">
          <Group grow>
            <TextInput
              label="Número do Processo"
              placeholder="0000000-00.0000.0.00.0000"
              value={formData.numero}
              onChange={(e) => handleChange('numero', e.target.value)}
              required
            />

            <Select
              label="Tipo de Processo"
              data={TIPOS_PROCESSO}
              value={formData.tipo}
              onChange={(value) => handleChange('tipo', value)}
              required
            />
          </Group>

          <Group grow>
            <TextInput
              label="CPF do Cliente"
              placeholder="000.000.000-00"
              value={formData.clienteCpf}
              onChange={(e) => handleChange('clienteCpf', e.target.value)}
              required
            />

            <TextInput
              label="Nome do Cliente"
              placeholder="Nome completo"
              value={formData.clienteNome}
              onChange={(e) => handleChange('clienteNome', e.target.value)}
              required
            />
          </Group>

          <Textarea
            label="Descrição"
            placeholder="Detalhes do caso..."
            minRows={4}
            value={formData.descricao}
            onChange={(e) => handleChange('descricao', e.target.value)}
            required
          />

          <Group position="right" mt="xl">
            <Button
              type="submit"
              leftIcon={<IconCheck size={16} />}
              size="md"
            >
              Cadastrar Processo
            </Button>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
}