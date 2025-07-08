import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TextInput,
  Button,
  Paper,
  Title,
  LoadingOverlay,
  Group,
  Badge,
  ActionIcon,
  Modal,
  Text,
  Select,
  Stack,
  Alert
} from '@mantine/core';
import { 
  IconPlus, 
  IconEdit, 
  IconTrash, 
  IconSearch,
  IconListDetails,
  IconRefresh
} from '@tabler/icons-react';
import api from '@/api/apiService';
import useNotification from '@/hooks/useNotification';

const STATUS_OPTIONS = [
  { value: 'ativo', label: 'Ativo' },
  { value: 'arquivado', label: 'Arquivado' },
  { value: 'encerrado', label: 'Encerrado' },
];

const TIPO_OPTIONS = [
  { value: 'civil', label: 'Civil' },
  { value: 'penal', label: 'Penal' },
  { value: 'trabalhista', label: 'Trabalhista' },
  { value: 'familia', label: 'Família' },
];

export default function ProcessoPage() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [processos, setProcessos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [processoToDelete, setProcessoToDelete] = useState(null);

  const fetchProcessos = async () => {
    setLoading(true);
    try {
      const params = {
        search: searchTerm,
        status: statusFilter,
        tipo: tipoFilter
      };
      const { data } = await api.get('/processos', { params });
      setProcessos(data);
    } catch (error) {
      showNotification('Erro ao carregar processos', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProcessos();
  }, [searchTerm, statusFilter, tipoFilter]);

  const handleDelete = async () => {
    try {
      await api.delete(`/processos/${processoToDelete.id}`);
      showNotification('Processo removido com sucesso', 'success');
      fetchProcessos();
    } catch (error) {
      showNotification('Erro ao remover processo', 'error');
    } finally {
      setDeleteModalOpen(false);
      setProcessoToDelete(null);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'ativo': return 'green';
      case 'arquivado': return 'yellow';
      case 'encerrado': return 'red';
      default: return 'gray';
    }
  };

  const filteredProcessos = processos.filter(processo =>
    processo.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    processo.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    processo.clienteNome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Paper withBorder p="xl" radius="md" pos="relative">
      <LoadingOverlay visible={loading} overlayBlur={2} />

      <Group position="apart" mb="xl">
        <Title order={2}>Processos Jurídicos</Title>
        <Button
          leftIcon={<IconPlus size={16} />}
          onClick={() => navigate('/processos/novo')}
        >
          Novo Processo
        </Button>
      </Group>

      <Group mb="md" spacing="md">
        <TextInput
          placeholder="Buscar por número, descrição ou cliente..."
          icon={<IconSearch size={16} />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 1 }}
        />

        <Select
          placeholder="Filtrar por status"
          data={STATUS_OPTIONS}
          value={statusFilter}
          onChange={setStatusFilter}
          clearable
        />

        <Select
          placeholder="Filtrar por tipo"
          data={TIPO_OPTIONS}
          value={tipoFilter}
          onChange={setTipoFilter}
          clearable
        />

        <ActionIcon
          variant="outline"
          size="lg"
          onClick={fetchProcessos}
          title="Recarregar"
        >
          <IconRefresh size={18} />
        </ActionIcon>
      </Group>

      {filteredProcessos.length === 0 ? (
        <Alert color="blue" title="Nenhum processo encontrado">
          {searchTerm || statusFilter || tipoFilter 
            ? "Tente ajustar sua busca ou filtros" 
            : "Nenhum processo cadastrado ainda"}
        </Alert>
      ) : (
        <Table striped highlightOnHover>
          <thead>
            <tr>
              <th>Número</th>
              <th>Cliente</th>
              <th>Descrição</th>
              <th>Status</th>
              <th>Tipo</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredProcessos.map((processo) => (
              <tr key={processo.id}>
                <td>{processo.numero}</td>
                <td>{processo.clienteNome}</td>
                <td>
                  <Text lineClamp={1} style={{ maxWidth: 300 }}>
                    {processo.descricao}
                  </Text>
                </td>
                <td>
                  <Badge color={getStatusColor(processo.status)}>
                    {processo.status}
                  </Badge>
                </td>
                <td>
                  <Badge variant="outline">
                    {TIPO_OPTIONS.find(t => t.value === processo.tipo)?.label || processo.tipo}
                  </Badge>
                </td>
                <td>
                  <Group spacing={4} noWrap>
                    <ActionIcon
                      color="blue"
                      onClick={() => navigate(`/processos/${processo.id}`)}
                      title="Detalhes"
                    >
                      <IconListDetails size={18} />
                    </ActionIcon>

                    <ActionIcon
                      color="gray"
                      onClick={() => navigate(`/processos/editar/${processo.id}`)}
                      title="Editar"
                    >
                      <IconEdit size={18} />
                    </ActionIcon>

                    <ActionIcon
                      color="red"
                      onClick={() => {
                        setProcessoToDelete(processo);
                        setDeleteModalOpen(true);
                      }}
                      title="Excluir"
                    >
                      <IconTrash size={18} />
                    </ActionIcon>
                  </Group>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirmar exclusão"
      >
        <Text mb="xl">Tem certeza que deseja excluir o processo {processoToDelete?.numero}?</Text>
        <Group position="right">
          <Button variant="default" onClick={() => setDeleteModalOpen(false)}>
            Cancelar
          </Button>
          <Button color="red" onClick={handleDelete}>
            Confirmar Exclusão
          </Button>
        </Group>
      </Modal>
    </Paper>
  );
}