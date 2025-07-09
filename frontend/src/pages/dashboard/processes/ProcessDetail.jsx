import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Paper,
  Title,
  Text,
  Group,
  Button,
  Badge,
  Divider,
  Tabs,
  Stack,
  Loader,
  Modal,
  Alert,
  Grid,
  Card,
  Flex,
  Avatar,
  ActionIcon,
  Tooltip,
  CopyButton,
  Box
} from '@mantine/core';
import { 
  IconArrowLeft, 
  IconEdit, 
  IconTrash, 
  IconFileUpload,
  IconFileDownload,
  IconClock,
  IconCalendar,
  IconUser,
  IconScale,
  IconLink,
  IconCopy,
  IconCheck,
  IconFolder,
  IconInfoCircle
} from '@tabler/icons-react';
import api from '@/api/apiService';
import { notifications } from '@mantine/notifications';
import FileUpload from '../files/FileUpload';
import Timeline from '@/components/Timeline';
import DocumentTable from './DocumentTable';
import { formatDate, formatCPF } from '@/utils/format';

const STATUS_COLORS = {
  ativo: 'green',
  arquivado: 'gray',
  encerrado: 'red',
  andamento: 'blue',
  suspenso: 'yellow'
};

const STATUS_LABELS = {
  ativo: 'Ativo',
  arquivado: 'Arquivado',
  encerrado: 'Encerrado',
  andamento: 'Em Andamento',
  suspenso: 'Suspenso'
};

const TIPO_LABELS = {
  civil: 'Civil',
  penal: 'Penal',
  trabalhista: 'Trabalhista',
  familia: 'Família',
  consumidor: 'Consumidor',
  administrativo: 'Administrativo',
  ambiental: 'Ambiental'
};

export default function ProcessDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [processo, setProcesso] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [relatedProcesses, setRelatedProcesses] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Buscar processo principal
        const { data: processData } = await api.get(`/processos/${id}?_embed=documentos&_embed=historico`);
        setProcesso(processData);
        
        // Buscar processos relacionados
        if (processData.clienteCpf) {
          const { data: relatedData } = await api.get(`/processos?clienteCpf=${processData.clienteCpf}&id_ne=${id}&_limit=3`);
          setRelatedProcesses(relatedData);
        }
        
      } catch (err) {
        setError(err.response?.data?.message || 'Erro ao carregar processo');
        notifications.show({
          title: 'Erro',
          message: 'Não foi possível carregar o processo',
          color: 'red'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleDelete = async () => {
    try {
      await api.delete(`/processos/${id}`);
      notifications.show({
        title: 'Processo removido',
        message: 'O processo foi excluído com sucesso',
        color: 'green'
      });
      navigate('/processos');
    } catch (err) {
      notifications.show({
        title: 'Erro',
        message: 'Falha ao excluir o processo',
        color: 'red'
      });
    } finally {
      setDeleteModalOpen(false);
    }
  };

  const handleFileUploadSuccess = () => {
    // Refresh files list or process details
    notifications.show({
      title: 'Documento adicionado',
      message: 'O arquivo foi vinculado ao processo',
      color: 'teal'
    });
    fetchProcess();
  };

  const fetchProcess = async () => {
    try {
      const { data } = await api.get(`/processos/${id}?_embed=documentos&_embed=historico`);
      setProcesso(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao recarregar processo');
    }
  };

  const copyProcessNumber = () => {
    navigator.clipboard.writeText(processo.numero);
    notifications.show({
      title: 'Número copiado!',
      message: 'O número do processo foi copiado para a área de transferência',
      color: 'blue',
      icon: <IconCheck size={16} />
    });
  };

  if (loading) {
    return (
      <Paper withBorder p="xl" radius="md" style={{ minHeight: '70vh' }}>
        <Group justify="center" align="center" h="100%">
          <Loader size="xl" variant="dots" />
        </Group>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper withBorder p="xl" radius="md">
        <Alert color="red" title="Erro" icon={<IconInfoCircle />} mb="xl">
          {error}
        </Alert>
        <Button 
          leftSection={<IconArrowLeft size={16} />}
          onClick={() => navigate('/processos')}
        >
          Voltar para lista de processos
        </Button>
      </Paper>
    );
  }

  if (!processo) return null;

  return (
    <Paper withBorder p="xl" radius="md">
      <Group justify="space-between" mb="xl" wrap="nowrap">
        <Button
          variant="subtle"
          leftSection={<IconArrowLeft size={16} />}
          onClick={() => navigate('/processos')}
        >
          Processos
        </Button>
        
        <Group>
          <Button
            variant="outline"
            leftSection={<IconEdit size={16} />}
            onClick={() => navigate(`/processos/editar/${id}`)}
          >
            Editar
          </Button>
          <Button
            color="red"
            variant="outline"
            leftSection={<IconTrash size={16} />}
            onClick={() => setDeleteModalOpen(true)}
          >
            Excluir
          </Button>
        </Group>
      </Group>

      <Flex align="center" gap="md" mb="xl">
        <Avatar color="blue" radius="xl">
          <IconScale size={24} />
        </Avatar>
        <div>
          <Title order={2} mb={4}>
            {processo.numero}
            <Tooltip label="Copiar número" position="right" withArrow>
              <ActionIcon variant="subtle" ml="sm" onClick={copyProcessNumber}>
                <IconCopy size={16} />
              </ActionIcon>
            </Tooltip>
          </Title>
          
          <Group>
            <Badge 
              color={STATUS_COLORS[processo.status]} 
              size="lg"
              variant="light"
              leftSection={<IconInfoCircle size={14} />}
            >
              {STATUS_LABELS[processo.status]}
            </Badge>
            
            <Badge 
              color="gray"
              size="lg"
              variant="light"
              leftSection={<IconCalendar size={14} />}
            >
              {formatDate(processo.dataAbertura)}
            </Badge>
          </Group>
        </div>
      </Flex>

      <Tabs 
        value={activeTab} 
        onChange={setActiveTab}
        mb="xl"
        keepMounted={false}
      >
        <Tabs.List>
          <Tabs.Tab value="details" leftSection={<IconScale size={16} />}>
            Detalhes
          </Tabs.Tab>
          <Tabs.Tab value="documents" leftSection={<IconFolder size={16} />}>
            Documentos
          </Tabs.Tab>
          <Tabs.Tab value="timeline" leftSection={<IconClock size={16} />}>
            Histórico
          </Tabs.Tab>
          <Tabs.Tab value="related" leftSection={<IconLink size={16} />}>
            Processos Relacionados
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="details" pt="xl">
          <Grid gutter="xl">
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card withBorder radius="md" p="lg">
                <Text fw={600} mb="md" c="blue">
                  Informações do Processo
                </Text>
                
                <Stack gap="sm">
                  <div>
                    <Text fw={500} size="sm" c="dimmed">Tipo</Text>
                    <Text>{TIPO_LABELS[processo.tipo] || processo.tipo}</Text>
                  </div>
                  
                  <div>
                    <Text fw={500} size="sm" c="dimmed">Valor da Causa</Text>
                    <Text>{processo.valorCausa ? `R$ ${parseFloat(processo.valorCausa).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'Não informado'}</Text>
                  </div>
                  
                  <div>
                    <Text fw={500} size="sm" c="dimmed">Tribunal/Comarca</Text>
                    <Text>{processo.tribunal || 'Não informado'}</Text>
                  </div>
                  
                  <div>
                    <Text fw={500} size="sm" c="dimmed">Vara</Text>
                    <Text>{processo.vara || 'Não informada'}</Text>
                  </div>
                </Stack>
              </Card>
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card withBorder radius="md" p="lg">
                <Text fw={600} mb="md" c="blue">
                  Cliente
                </Text>
                
                <Stack gap="sm">
                  <div>
                    <Text fw={500} size="sm" c="dimmed">Nome</Text>
                    <Text>{processo.clienteNome}</Text>
                  </div>
                  
                  <div>
                    <Text fw={500} size="sm" c="dimmed">CPF</Text>
                    <Text>{formatCPF(processo.clienteCpf)}</Text>
                  </div>
                  
                  {processo.clienteContato && (
                    <div>
                      <Text fw={500} size="sm" c="dimmed">Contato</Text>
                      <Text>{processo.clienteContato}</Text>
                    </div>
                  )}
                </Stack>
              </Card>
              
              <Card withBorder radius="md" p="lg" mt="md">
                <Text fw={600} mb="md" c="blue">
                  Advogado Responsável
                </Text>
                
                {processo.advogadoNome ? (
                  <Stack gap="sm">
                    <div>
                      <Text fw={500} size="sm" c="dimmed">Nome</Text>
                      <Text>{processo.advogadoNome}</Text>
                    </div>
                    
                    {processo.advogadoOAB && (
                      <div>
                        <Text fw={500} size="sm" c="dimmed">OAB</Text>
                        <Text>{processo.advogadoOAB}</Text>
                      </div>
                    )}
                  </Stack>
                ) : (
                  <Text c="dimmed" fs="italic">Não atribuído</Text>
                )}
              </Card>
            </Grid.Col>
            
            <Grid.Col span={12}>
              <Card withBorder radius="md" p="lg">
                <Text fw={600} mb="md" c="blue">
                  Descrição do Caso
                </Text>
                <Text style={{ whiteSpace: 'pre-line' }}>
                  {processo.descricao || 'Nenhuma descrição fornecida'}
                </Text>
              </Card>
            </Grid.Col>
          </Grid>
        </Tabs.Panel>

        <Tabs.Panel value="documents" pt="xl">
          <Stack gap="xl">
            <Card withBorder radius="md" p="lg">
              <Text fw={600} mb="md" c="blue">
                Adicionar Documentos
              </Text>
              <FileUpload 
                processoId={id} 
                folderPath={`processos/${id}`}
                onUploadSuccess={handleFileUploadSuccess} 
              />
            </Card>
            
            <Card withBorder radius="md" p="lg">
              <Text fw={600} mb="md" c="blue">
                Documentos Anexados
              </Text>
              <DocumentTable documents={processo.documentos || []} />
            </Card>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="timeline" pt="xl">
          <Card withBorder radius="md" p="lg">
            <Text fw={600} mb="md" c="blue">
              Histórico do Processo
            </Text>
            <Timeline 
              events={processo.historico?.map(event => ({
                ...event,
                date: event.dataEvento,
                title: event.titulo,
                description: event.descricao
              })) || []} 
            />
          </Card>
        </Tabs.Panel>
        
        <Tabs.Panel value="related" pt="xl">
          <Card withBorder radius="md" p="lg">
            <Text fw={600} mb="md" c="blue">
              Processos Relacionados
            </Text>
            
            {relatedProcesses.length > 0 ? (
              <Stack>
                {relatedProcesses.map(process => (
                  <Card 
                    key={process.id} 
                    withBorder 
                    p="md" 
                    radius="sm"
                    onClick={() => navigate(`/processos/${process.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <Group justify="space-between">
                      <Text fw={500}>{process.numero}</Text>
                      <Badge color={STATUS_COLORS[process.status]}>
                        {STATUS_LABELS[process.status]}
                      </Badge>
                    </Group>
                    <Text size="sm" c="dimmed" mt={4}>
                      {TIPO_LABELS[process.tipo] || process.tipo} • {formatDate(process.dataAbertura)}
                    </Text>
                  </Card>
                ))}
              </Stack>
            ) : (
              <Text c="dimmed" fs="italic">
                Nenhum outro processo encontrado para este cliente
              </Text>
            )}
          </Card>
        </Tabs.Panel>
      </Tabs>

      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirmar exclusão"
        centered
      >
        <Text mb="xl">Tem certeza que deseja excluir permanentemente o processo abaixo?</Text>
        
        <Card withBorder mb="xl">
          <Text fw={600}>{processo.numero}</Text>
          <Text size="sm" c="dimmed">
            {processo.clienteNome} • {formatDate(processo.dataAbertura)}
          </Text>
        </Card>
        
        <Text size="sm" c="dimmed" mb="xl">
          Todos os documentos e histórico associados serão removidos permanentemente.
        </Text>
        
        <Group justify="flex-end">
          <Button 
            variant="default" 
            onClick={() => setDeleteModalOpen(false)}
          >
            Cancelar
          </Button>
          <Button 
            color="red" 
            leftSection={<IconTrash size={16} />}
            onClick={handleDelete}
          >
            Excluir Processo
          </Button>
        </Group>
      </Modal>
    </Paper>
  );
}

function DocumentTable({ documents }) {
  if (!documents || documents.length === 0) {
    return (
      <Text c="dimmed" fs="italic" py="md">
        Nenhum documento anexado
      </Text>
    );
  }

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={{ textAlign: 'left', padding: '8px 0' }}>Documento</th>
          <th style={{ textAlign: 'left', padding: '8px 0' }}>Tipo</th>
          <th style={{ textAlign: 'left', padding: '8px 0' }}>Data</th>
          <th style={{ textAlign: 'right', padding: '8px 0' }}>Ações</th>
        </tr>
      </thead>
      <tbody>
        {documents.map((doc) => (
          <tr key={doc.id}>
            <td style={{ padding: '12px 0' }}>
              <Group gap="sm">
                <IconFile size={16} />
                <Text>{doc.nome}</Text>
              </Group>
            </td>
            <td style={{ padding: '12px 0' }}>
              <Badge variant="light">
                {doc.tipo.split('/')[1] || doc.tipo}
              </Badge>
            </td>
            <td style={{ padding: '12px 0' }}>
              {formatDate(doc.createdAt)}
            </td>
            <td style={{ padding: '12px 0', textAlign: 'right' }}>
              <Group gap={4} justify="flex-end">
                <Tooltip label="Visualizar" withArrow>
                  <ActionIcon 
                    variant="subtle"
                    color="blue"
                    onClick={() => window.open(doc.url, '_blank')}
                  >
                    <IconFileDownload size={16} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}