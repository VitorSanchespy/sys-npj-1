import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Paper, Title, Text, Group, Button, Badge, Tabs, Stack, LoadingOverlay, Modal, Grid, Card, Flex, Avatar, ActionIcon, Tooltip
} from '@mantine/core';
import { 
  IconArrowLeft, IconEdit, IconTrash, IconScale, IconLink, IconCopy, IconCheck, IconFolder, IconClock, IconInfoCircle, IconCalendar, IconUser
} from '@tabler/icons-react';
import api from '@/api/apiService';
import { formatDate, formatCPF } from '@/utils/formatters';
import FileUpload from '@/components/files/FileUpload';
import Timeline from '@/components/ui/Timeline';

const STATUS_COLORS = { ativo: 'green', arquivado: 'gray', encerrado: 'red', andamento: 'blue', suspenso: 'yellow' };
const STATUS_LABELS = { ativo: 'Ativo', arquivado: 'Arquivado', encerrado: 'Encerrado', andamento: 'Em Andamento', suspenso: 'Suspenso' };
const TIPO_LABELS = {
  civil: 'Civil', penal: 'Penal', trabalhista: 'Trabalhista', familia: 'Família',
  consumidor: 'Consumidor', administrativo: 'Administrativo', ambiental: 'Ambiental'
};

export function ProcessDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState({
    processo: null,
    loading: true,
    activeTab: 'details',
    relatedProcesses: [],
    deleteModalOpen: false
  });

  const fetchData = async () => {
    try {
      const [{ data: processData }, { data: relatedData }] = await Promise.all([
        api.get(`/processos/${id}?_embed=documentos&_embed=historico`),
        api.get(`/processos?clienteCpf=${state.processo?.clienteCpf}&id_ne=${id}&_limit=3`)
      ]);
      
      setState(prev => ({
        ...prev,
        processo: processData,
        relatedProcesses: relatedData,
        loading: false
      }));
    } catch (err) {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleDelete = async () => {
    try {
      await api.delete(`/processos/${id}`);
      navigate('/processos');
    } finally {
      setState(prev => ({ ...prev, deleteModalOpen: false }));
    }
  };

  const copyProcessNumber = () => {
    navigator.clipboard.writeText(state.processo.numero);
  };

  if (state.loading) return <LoadingOverlay visible overlayBlur={2} />;
  if (!state.processo) return <Text>Processo não encontrado</Text>;

  return (
    <Paper withBorder p="xl" radius="md">
      <Group justify="space-between" mb="xl">
        <Button variant="subtle" leftSection={<IconArrowLeft size={16} />} onClick={() => navigate('/processos')}>
          Processos
        </Button>
        <Group>
          <Button variant="outline" leftSection={<IconEdit size={16} />} onClick={() => navigate(`/processos/editar/${id}`)}>
            Editar
          </Button>
          <Button color="red" variant="outline" leftSection={<IconTrash size={16} />} 
            onClick={() => setState(prev => ({ ...prev, deleteModalOpen: true }))}>
            Excluir
          </Button>
        </Group>
      </Group>

      <Flex align="center" gap="md" mb="xl">
        <Avatar color="blue" radius="xl"><IconScale size={24} /></Avatar>
        <div>
          <Title order={2} mb={4}>
            {state.processo.numero}
            <Tooltip label="Copiar número">
              <ActionIcon variant="subtle" ml="sm" onClick={copyProcessNumber}>
                <IconCopy size={16} />
              </ActionIcon>
            </Tooltip>
          </Title>
          <Group>
            <Badge color={STATUS_COLORS[state.processo.status]} variant="light" leftSection={<IconInfoCircle size={14} />}>
              {STATUS_LABELS[state.processo.status]}
            </Badge>
            <Badge color="gray" variant="light" leftSection={<IconCalendar size={14} />}>
              {formatDate(state.processo.dataAbertura)}
            </Badge>
          </Group>
        </div>
      </Flex>

      <Tabs value={state.activeTab} onChange={tab => setState(prev => ({ ...prev, activeTab: tab }))} mb="xl">
        <Tabs.List>
          <Tabs.Tab value="details" leftSection={<IconScale size={16} />}>Detalhes</Tabs.Tab>
          <Tabs.Tab value="documents" leftSection={<IconFolder size={16} />}>Documentos</Tabs.Tab>
          <Tabs.Tab value="timeline" leftSection={<IconClock size={16} />}>Histórico</Tabs.Tab>
          <Tabs.Tab value="related" leftSection={<IconLink size={16} />}>Processos Relacionados</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="details" pt="xl">
          <Grid gutter="xl">
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card withBorder p="lg" mb="md">
                <Text fw={600} mb="md" c="blue">Informações do Processo</Text>
                <Stack gap="sm">
                  <Field label="Tipo" value={TIPO_LABELS[state.processo.tipo] || state.processo.tipo} />
                  <Field label="Valor da Causa" 
                    value={state.processo.valorCausa ? `R$ ${parseFloat(state.processo.valorCausa).toLocaleString('pt-BR')}` : 'Não informado'} />
                  <Field label="Tribunal/Comarca" value={state.processo.tribunal || 'Não informado'} />
                  <Field label="Vara" value={state.processo.vara || 'Não informada'} />
                </Stack>
              </Card>
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card withBorder p="lg" mb="md">
                <Text fw={600} mb="md" c="blue">Cliente</Text>
                <Stack gap="sm">
                  <Field label="Nome" value={state.processo.clienteNome} />
                  <Field label="CPF" value={formatCPF(state.processo.clienteCpf)} />
                  {state.processo.clienteContato && <Field label="Contato" value={state.processo.clienteContato} />}
                </Stack>
              </Card>
              
              <Card withBorder p="lg">
                <Text fw={600} mb="md" c="blue">Advogado Responsável</Text>
                {state.processo.advogadoNome ? (
                  <Stack gap="sm">
                    <Field label="Nome" value={state.processo.advogadoNome} />
                    {state.processo.advogadoOAB && <Field label="OAB" value={state.processo.advogadoOAB} />}
                  </Stack>
                ) : <Text c="dimmed">Não atribuído</Text>}
              </Card>
            </Grid.Col>
            
            <Grid.Col span={12}>
              <Card withBorder p="lg">
                <Text fw={600} mb="md" c="blue">Descrição do Caso</Text>
                <Text style={{ whiteSpace: 'pre-line' }}>
                  {state.processo.descricao || 'Nenhuma descrição fornecida'}
                </Text>
              </Card>
            </Grid.Col>
          </Grid>
        </Tabs.Panel>

        <Tabs.Panel value="documents" pt="xl">
          <Stack gap="xl">
            <Card withBorder p="lg" mb="md">
              <Text fw={600} mb="md" c="blue">Adicionar Documentos</Text>
              <FileUpload processoId={id} folderPath={`processos/${id}`} onUploadSuccess={fetchData} />
            </Card>
            
            <Card withBorder p="lg">
              <Text fw={600} mb="md" c="blue">Documentos Anexados</Text>
              <DocumentList documents={state.processo.documentos || []} />
            </Card>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="timeline" pt="xl">
          <Card withBorder p="lg">
            <Text fw={600} mb="md" c="blue">Histórico do Processo</Text>
            <Timeline events={state.processo.historico?.map(event => ({
              date: event.dataEvento,
              title: event.titulo,
              description: event.descricao
            })) || []} />
          </Card>
        </Tabs.Panel>
        
        <Tabs.Panel value="related" pt="xl">
          <Card withBorder p="lg">
            <Text fw={600} mb="md" c="blue">Processos Relacionados</Text>
            {state.relatedProcesses.length > 0 ? (
              <Stack>
                {state.relatedProcesses.map(process => (
                  <Card key={process.id} withBorder p="md" radius="sm" onClick={() => navigate(`/processos/${process.id}`)} style={{ cursor: 'pointer' }}>
                    <Group justify="space-between">
                      <Text fw={500}>{process.numero}</Text>
                      <Badge color={STATUS_COLORS[process.status]}>{STATUS_LABELS[process.status]}</Badge>
                    </Group>
                    <Text size="sm" c="dimmed" mt={4}>
                      {TIPO_LABELS[process.tipo] || process.tipo} • {formatDate(process.dataAbertura)}
                    </Text>
                  </Card>
                ))}
              </Stack>
            ) : <Text c="dimmed">Nenhum outro processo encontrado para este cliente</Text>}
          </Card>
        </Tabs.Panel>
      </Tabs>

      <Modal opened={state.deleteModalOpen} onClose={() => setState(prev => ({ ...prev, deleteModalOpen: false }))} title="Confirmar exclusão">
        <Text mb="xl">Tem certeza que deseja excluir permanentemente o processo abaixo?</Text>
        <Card withBorder mb="xl">
          <Text fw={600}>{state.processo.numero}</Text>
          <Text size="sm" c="dimmed">{state.processo.clienteNome} • {formatDate(state.processo.dataAbertura)}</Text>
        </Card>
        <Group justify="flex-end">
          <Button variant="default" onClick={() => setState(prev => ({ ...prev, deleteModalOpen: false }))}>Cancelar</Button>
          <Button color="red" leftSection={<IconTrash size={16} />} onClick={handleDelete}>Excluir Processo</Button>
        </Group>
      </Modal>
    </Paper>
  );
}

const Field = ({ label, value }) => (
  <div>
    <Text fw={500} size="sm" c="dimmed">{label}</Text>
    <Text>{value}</Text>
  </div>
);

const DocumentList = ({ documents }) => {
  if (!documents.length) return <Text c="dimmed" py="md">Nenhum documento anexado</Text>;
  
  return (
    <Table>
      <thead>
        <tr>
          <th>Documento</th>
          <th>Tipo</th>
          <th>Data</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        {documents.map(doc => (
          <tr key={doc.id}>
            <td><Group gap="sm"><IconFileDescription size={16} /><Text>{doc.nome}</Text></Group></td>
            <td><Badge variant="light">{doc.tipo.split('/')[1] || doc.tipo}</Badge></td>
            <td>{formatDate(doc.createdAt)}</td>
            <td>
              <ActionIcon variant="subtle" color="blue" onClick={() => window.open(doc.url, '_blank')} title="Download">
                <IconDownload size={16} />
              </ActionIcon>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};
export default ProcessDetail;