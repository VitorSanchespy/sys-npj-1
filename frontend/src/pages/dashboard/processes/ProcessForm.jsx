import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  TextInput,
  Select,
  Button,
  Group,
  Paper,
  Title,
  Text,
  Container,
  LoadingOverlay,
  Textarea,
  Badge
} from '@mantine/core';
import { IconArrowLeft, IconCheck, IconScale } from '@tabler/icons-react';
import api from '@/api/apiService';
import { notifications } from '@mantine/notifications';
import { formatCPF } from '@/utils/formatters';

const STATUS_OPTIONS = [
  { value: 'ativo', label: 'Ativo' },
  { value: 'arquivado', label: 'Arquivado' },
  { value: 'encerrado', label: 'Encerrado' },
  { value: 'suspenso', label: 'Suspenso' },
];

const TIPO_OPTIONS = [
  { value: 'civil', label: 'Civil' },
  { value: 'penal', label: 'Penal' },
  { value: 'trabalhista', label: 'Trabalhista' },
  { value: 'familia', label: 'Família' },
  { value: 'consumidor', label: 'Consumidor' },
  { value: 'administrativo', label: 'Administrativo' },
  { value: 'ambiental', label: 'Ambiental' },
];

export function ProcessForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    numero: '',
    tipo: 'civil',
    status: 'ativo',
    dataAbertura: new Date().toISOString().split('T')[0],
    descricao: '',
    clienteNome: '',
    clienteCpf: '',
    clienteContato: '',
    advogadoNome: '',
    advogadoOAB: '',
    tribunal: '',
    vara: '',
    valorCausa: '',
  });

  useEffect(() => {
    if (id) {
      const fetchProcess = async () => {
        setLoading(true);
        try {
          const { data } = await api.get(`/processos/${id}`);
          setFormData({
            ...data,
            // Garantir que datas estejam no formato correto
            dataAbertura: data.dataAbertura.split('T')[0],
          });
        } catch (err) {
          setError('Erro ao carregar processo');
          notifications.show({
            title: 'Erro',
            message: 'Não foi possível carregar o processo',
            color: 'red'
          });
        } finally {
          setLoading(false);
        }
      };
      fetchProcess();
    }
  }, [id]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validação básica
      if (!formData.numero.trim()) {
        throw new Error('Número do processo é obrigatório');
      }
      if (!formData.clienteNome.trim()) {
        throw new Error('Nome do cliente é obrigatório');
      }

      if (id) {
        // Atualizar processo existente
        await api.put(`/processos/${id}`, formData);
        notifications.show({
          title: 'Processo atualizado!',
          message: 'As alterações foram salvas com sucesso',
          color: 'teal',
          icon: <IconCheck size={18} />,
        });
      } else {
        // Criar novo processo
        await api.post('/processos', formData);
        notifications.show({
          title: 'Processo criado!',
          message: 'O novo processo foi cadastrado com sucesso',
          color: 'teal',
          icon: <IconCheck size={18} />,
        });
      }
      
      navigate('/processos');
    } catch (err) {
      const message = err.response?.data?.message || 
                     err.message || 
                     'Erro ao salvar o processo';
      setError(message);
      notifications.show({
        title: 'Erro',
        message,
        color: 'red'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container size="md" py="xl">
      <Paper withBorder shadow="md" p="xl" radius="md" pos="relative">
        <LoadingOverlay visible={loading || isSubmitting} overlayBlur={2} />
        
        <Group mb="xl">
          <Button
            variant="subtle"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => navigate('/processos')}
          >
            Voltar
          </Button>
          <Title order={2}>
            <Group gap="sm">
              <IconScale size={24} />
              {id ? 'Editar Processo' : 'Novo Processo'}
            </Group>
          </Title>
        </Group>

        {error && (
          <Alert color="red" mb="xl">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid gutter="xl">
            <Grid.Col span={{ base: 12, md: 6 }}>
              <TextInput
                label="Número do Processo"
                placeholder="Número único do processo"
                value={formData.numero}
                onChange={(e) => handleChange('numero', e.target.value)}
                required
                mb="md"
              />
              
              <Group grow mb="md">
                <Select
                  label="Tipo"
                  data={TIPO_OPTIONS}
                  value={formData.tipo}
                  onChange={(value) => handleChange('tipo', value)}
                  required
                />
                
                <Select
                  label="Status"
                  data={STATUS_OPTIONS}
                  value={formData.status}
                  onChange={(value) => handleChange('status', value)}
                  required
                />
              </Group>
              
              <TextInput
                label="Data de Abertura"
                type="date"
                value={formData.dataAbertura}
                onChange={(e) => handleChange('dataAbertura', e.target.value)}
                required
                mb="md"
              />
              
              <TextInput
                label="Tribunal"
                placeholder="Nome do tribunal"
                value={formData.tribunal}
                onChange={(e) => handleChange('tribunal', e.target.value)}
                mb="md"
              />
              
              <TextInput
                label="Vara"
                placeholder="Número/nome da vara"
                value={formData.vara}
                onChange={(e) => handleChange('vara', e.target.value)}
                mb="md"
              />
              
              <TextInput
                label="Valor da Causa (R$)"
                placeholder="0.00"
                value={formData.valorCausa}
                onChange={(e) => handleChange('valorCausa', e.target.value)}
                mb="md"
                type="number"
                step="0.01"
              />
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Title order={4} mb="md" c="blue">
                Informações do Cliente
              </Title>
              
              <TextInput
                label="Nome Completo"
                placeholder="Nome do cliente"
                value={formData.clienteNome}
                onChange={(e) => handleChange('clienteNome', e.target.value)}
                required
                mb="md"
              />
              
              <TextInput
                label="CPF"
                placeholder="000.000.000-00"
                value={formData.clienteCpf}
                onChange={(e) => handleChange('clienteCpf', e.target.value)}
                mb="md"
              />
              
              <TextInput
                label="Contato"
                placeholder="Telefone/email"
                value={formData.clienteContato}
                onChange={(e) => handleChange('clienteContato', e.target.value)}
                mb="xl"
              />
              
              <Title order={4} mb="md" c="blue">
                Advogado Responsável
              </Title>
              
              <TextInput
                label="Nome"
                placeholder="Nome do advogado"
                value={formData.advogadoNome}
                onChange={(e) => handleChange('advogadoNome', e.target.value)}
                mb="md"
              />
              
              <TextInput
                label="OAB"
                placeholder="Número da OAB"
                value={formData.advogadoOAB}
                onChange={(e) => handleChange('advogadoOAB', e.target.value)}
                mb="xl"
              />
            </Grid.Col>
            
            <Grid.Col span={12}>
              <Textarea
                label="Descrição do Caso"
                placeholder="Detalhes sobre o processo..."
                value={formData.descricao}
                onChange={(e) => handleChange('descricao', e.target.value)}
                autosize
                minRows={3}
                maxRows={6}
              />
            </Grid.Col>
          </Grid>

          <Group justify="flex-end" mt="xl">
            <Button 
              type="submit"
              leftSection={<IconCheck size={18} />}
              loading={isSubmitting}
            >
              {id ? 'Atualizar Processo' : 'Criar Processo'}
            </Button>
          </Group>
        </form>
      </Paper>
    </Container>
  );
}

export default ProcessForm;