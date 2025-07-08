import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Paper,
  Title,
  Text,
  Group,
  Button,
  LoadingOverlay,
  Badge,
  Divider,
  Tabs,
  Stack,
  Table,
  ActionIcon,
  Modal,
  Alert
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
  IconScale
} from '@tabler/icons-react';
import api from '@/api/apiService';
import useNotification from '@/hooks/useNotification';
import FileUpload from '../files/FileUpload';
import Timeline from '@/components/Timeline';

const STATUS_COLORS = {
  ativo: 'green',
  arquivado: 'gray',
  encerrado: 'red',
  andamento: 'blue'
};

export default function ProcessDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [processo, setProcesso] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    const fetchProcesso = async () => {
      try {
        const { data } = await api.get(`/processos/${id}`);
        setProcesso(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Erro ao carregar processo');
        showNotification('Erro ao carregar processo', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchProcesso();
  }, [id]);

  const handleDelete = async () => {
    try {
      await api.delete(`/processos/${id}`);
      showNotification('Processo removido com sucesso', 'success');
      navigate('/processos');
    } catch (err) {
      showNotification('Erro ao remover processo', 'error');
    } finally {
      setDeleteModalOpen(false);
    }
  };

  const handleFileUploadSuccess = () => {
    // Refresh files list or process details
    showNotification('Documento adicionado com sucesso', 'success');
  };

  if (loading) return <LoadingOverlay visible overlayBlur={2} />;
  if (error) return <Alert color="red">{error}</Alert>;
  if (!processo) return null;

  return (
    <Paper withBorder p="xl" radius="md">
      <Group position="apart" mb="xl">
        <Button
          variant="subtle"
          leftIcon={<IconArrowLeft size={16} />}
          onClick={() => navigate(-1)}
        >
          Voltar
        </Button>
        
        <Group>
          <Button
            leftIcon={<IconEdit size={16} />}
            onClick={() => navigate(`/processos/editar/${id}`)}
          >
            Editar
          </Button>
          <Button
            color="red"
            leftIcon={<IconTrash size={16} />}
            onClick={() => setDeleteModalOpen(true)}
          >
            Excluir
          </Button>
        </Group>
      </Group>

      <Title order={2} mb="sm">
        Processo: {processo.numero}
        <Badge 
          color={STATUS_COLORS[processo.status]} 
          ml="sm" 
          size="lg"
        >
          {processo.status.toUpperCase()}
        </Badge>
      </Title>

      <Tabs value={activeTab} onTabChange={setActiveTab} mb="xl">
        <Tabs.List>
          <Tabs.Tab value="details" icon={<IconScale size={14} />}>Detalhes</Tabs.Tab>
          <Tabs.Tab value="documents" icon={<IconFileDownload size={14} />}>Documentos</Tabs.Tab>
          <Tabs.Tab value="timeline" icon={<IconClock size={14} />}>Histórico</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="details" pt="xl">
          <Stack spacing="md">
            <Group grow>
              <div>
                <Text fw={500}>Tipo:</Text>
                <Text>{processo.tipo}</Text>
              </div>
              <div>
                <Text fw={500}>Data de Abertura:</Text>
                <Text>{new Date(processo.dataAbertura).toLocaleDateString('pt-BR')}</Text>
              </div>
            </Group>

            <Divider />

            <Group grow>
              <div>
                <Text fw={500}>Cliente:</Text>
                <Text>{processo.clienteNome}</Text>
                <Text size="sm" c="dimmed">{processo.clienteCpf}</Text>
              </div>
              <div>
                <Text fw={500}>Advogado Responsável:</Text>
                <Text>{processo.advogadoNome || 'Não atribuído'}</Text>
              </div>
            </Group>

            <Divider />

            <div>
              <Text fw={500}>Descrição:</Text>
              <Text style={{ whiteSpace: 'pre-line' }}>{processo.descricao}</Text>
            </div>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="documents" pt="xl">
          <Stack spacing="xl">
            <FileUpload 
              processoId={id} 
              onUploadSuccess={handleFileUploadSuccess} 
            />

            <Table striped>
              <thead>
                <tr>
                  <th>Documento</th>
                  <th>Tipo</th>
                  <th>Data</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {processo.documentos?.length > 0 ? (
                  processo.documentos.map((doc) => (
                    <tr key={doc.id}>
                      <td>{doc.nome}</td>
                      <td>{doc.tipo}</td>
                      <td>{new Date(doc.dataUpload).toLocaleDateString('pt-BR')}</td>
                      <td>
                        <Group spacing="xs">
                          <ActionIcon 
                            color="blue"
                            onClick={() => window.open(doc.url, '_blank')}
                          >
                            <IconFileDownload size={18} />
                          </ActionIcon>
                        </Group>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} align="center">
                      Nenhum documento encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="timeline" pt="xl">
          <Timeline events={processo.historico || []} />
        </Tabs.Panel>
      </Tabs>

      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirmar exclusão"
      >
        <Text mb="xl">Tem certeza que deseja excluir este processo permanentemente?</Text>
        <Group position="right">
          <Button variant="default" onClick={() => setDeleteModalOpen(false)}>
            Cancelar
          </Button>
          <Button color="red" onClick={handleDelete}>
            Excluir
          </Button>
        </Group>
      </Modal>
    </Paper>
  );
}