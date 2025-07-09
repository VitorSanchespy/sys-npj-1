import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TextInput,
  Textarea,
  Select,
  Button,
  Paper,
  Title,
  Group,
  Stack,
  Alert,
  Loader,
  Fieldset,
  Grid,
  Box
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconArrowLeft, IconCheck, IconUser, IconGavel } from '@tabler/icons-react';
import api from '@/api/apiService';
import { validateCPF, formatCPF } from '@/utils/format';

const TIPOS_PROCESSO = [
  { value: 'civil', label: 'Civil' },
  { value: 'penal', label: 'Penal' },
  { value: 'trabalhista', label: 'Trabalhista' },
  { value: 'familia', label: 'Família' },
  { value: 'consumidor', label: 'Consumidor' },
  { value: 'administrativo', label: 'Administrativo' },
  { value: 'ambiental', label: 'Ambiental' },
];

const STATUS_PROCESSO = [
  { value: 'ativo', label: 'Ativo' },
  { value: 'arquivado', label: 'Arquivado' },
  { value: 'encerrado', label: 'Encerrado' },
  { value: 'suspenso', label: 'Suspenso' },
];

export default function CreateProcess() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const form = useForm({
    initialValues: {
      numero: '',
      tipo: '',
      clienteCpf: '',
      clienteNome: '',
      descricao: '',
      status: 'ativo',
      valorCausa: '',
      dataAbertura: new Date().toISOString().split('T')[0],
    },
    validate: {
      numero: (value) => value.trim().length < 5 ? 'Número muito curto' : null,
      clienteCpf: (value) => validateCPF(value) ? null : 'CPF inválido',
      clienteNome: (value) => value.trim().length < 3 ? 'Nome muito curto' : null,
      tipo: (value) => value ? null : 'Selecione o tipo',
    },
  });

  const handleSubmit = async (values) => {
    setLoading(true);
    
    try {
      await api.post('/processos', {
        ...values,
        clienteCpf: values.clienteCpf.replace(/\D/g, ''),
      });
      
      notifications.show({
        title: 'Processo cadastrado!',
        message: 'O processo foi registrado com sucesso',
        color: 'teal',
        icon: <IconCheck size={18} />,
      });
      
      navigate('/processos');
    } catch (err) {
      const message = err.response?.data?.message || 'Erro ao cadastrar processo';
      
      notifications.show({
        title: 'Erro no cadastro',
        message,
        color: 'red',
        icon: <IconGavel size={18} />,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCpfChange = (e) => {
    const formattedValue = formatCPF(e.target.value);
    form.setFieldValue('clienteCpf', formattedValue);
  };

  return (
    <Paper withBorder p="xl" radius="md">
      <Group mb="xl">
        <Button
          variant="subtle"
          leftSection={<IconArrowLeft size={16} />}
          onClick={() => navigate('/processos')}
        >
          Voltar aos Processos
        </Button>
        <Title order={2}>
          <Group gap="xs">
            <IconGavel size={28} />
            Cadastrar Novo Processo
          </Group>
        </Title>
      </Group>

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Grid gutter="xl">
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Fieldset legend="Dados do Processo" radius="md" p="md">
              <Stack>
                <TextInput
                  label="Número do Processo"
                  placeholder="0000000-00.0000.0.00.0000"
                  required
                  {...form.getInputProps('numero')}
                  description="Formato: NNNNNNN-DD.AAAA.J.TR.OOOO"
                />

                <Group grow>
                  <Select
                    label="Tipo de Processo"
                    data={TIPOS_PROCESSO}
                    required
                    {...form.getInputProps('tipo')}
                  />
                  
                  <Select
                    label="Status"
                    data={STATUS_PROCESSO}
                    required
                    {...form.getInputProps('status')}
                  />
                </Group>

                <TextInput
                  label="Valor da Causa (R$)"
                  placeholder="0,00"
                  {...form.getInputProps('valorCausa')}
                  leftSection={<span>R$</span>}
                />

                <TextInput
                  label="Data de Abertura"
                  type="date"
                  {...form.getInputProps('dataAbertura')}
                />
              </Stack>
            </Fieldset>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <Fieldset legend="Dados do Cliente" radius="md" p="md">
              <Stack>
                <TextInput
                  label="CPF do Cliente"
                  placeholder="000.000.000-00"
                  required
                  value={form.values.clienteCpf}
                  onChange={handleCpfChange}
                  error={form.errors.clienteCpf}
                  maxLength={14}
                  leftSection={<IconUser size={16} />}
                />

                <TextInput
                  label="Nome Completo do Cliente"
                  placeholder="Nome completo"
                  required
                  {...form.getInputProps('clienteNome')}
                />
              </Stack>
            </Fieldset>
          </Grid.Col>

          <Grid.Col span={12}>
            <Fieldset legend="Descrição do Caso" radius="md" p="md">
              <Textarea
                placeholder="Detalhe os fatos, pedidos e fundamentos jurídicos..."
                minRows={6}
                required
                {...form.getInputProps('descricao')}
                autosize
              />
            </Fieldset>
          </Grid.Col>
        </Grid>

        <Group justify="flex-end" mt="xl">
          <Button
            type="submit"
            leftSection={loading ? <Loader size="sm" /> : <IconCheck size={16} />}
            size="md"
            disabled={loading}
          >
            {loading ? 'Cadastrando...' : 'Cadastrar Processo'}
          </Button>
        </Group>
      </form>
    </Paper>
  );
}