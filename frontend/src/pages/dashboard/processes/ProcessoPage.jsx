import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Table, TextInput, Button, Paper, Title, 
  LoadingOverlay, Group, Badge, ActionIcon, 
  Modal, Text, Select, Alert 
} from '@mantine/core';
import { 
  IconPlus, IconEdit, IconTrash, 
  IconSearch, IconListDetails, IconRefresh 
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

export function ProcessoPage() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [state, setState] = useState({
    processos: [],
    loading: true,
    searchTerm: '',
    statusFilter: '',
    tipoFilter: '',
    deleteModalOpen: false,
    processoToDelete: null
  });

  const fetchProcessos = async () => {
    setState(s => ({ ...s, loading: true }));
    try {
      const params = {
        search: state.searchTerm,
        status: state.statusFilter,
        tipo: state.tipoFilter
      };
      const { data } = await api.get('/processos', { params });
      setState(s => ({ ...s, processos: data, loading: false }));
    } catch {
      showNotification('Erro ao carregar processos', 'error');
      setState(s => ({ ...s, loading: false }));
    }
  };

  useEffect(() => { fetchProcessos(); }, [state.searchTerm, state.statusFilter, state.tipoFilter]);

  const handleDelete = async () => {
    try {
      await api.delete(`/processos/${state.processoToDelete.id}`);
      showNotification('Processo removido com sucesso', 'success');
      fetchProcessos();
    } catch {
      showNotification('Erro ao remover processo', 'error');
    } finally {
      setState(s => ({ ...s, deleteModalOpen: false, processoToDelete: null }));
    }
  };

  const getStatusColor = status => ({
    ativo: 'green',
    arquivado: 'yellow',
    encerrado: 'red'
  }[status] || 'gray');

  const handleChange = (name, value) => setState(s => ({ ...s, [name]: value }));
  const hasFilters = state.searchTerm || state.statusFilter || state.tipoFilter;
  const isEmpty = state.processos.length === 0;

  return (
    <Paper withBorder p="xl" radius="md" pos="relative">
      <LoadingOverlay visible={state.loading} overlayBlur={2} />

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
          value={state.searchTerm}
          onChange={e => handleChange('searchTerm', e.target.value)}
          style={{ flex: 1 }}
        />

        <Select
          placeholder="Filtrar por status"
          data={STATUS_OPTIONS}
          value={state.statusFilter}
          onChange={v => handleChange('statusFilter', v)}
          clearable
        />

        <Select
          placeholder="Filtrar por tipo"
          data={TIPO_OPTIONS}
          value={state.tipoFilter}
          onChange={v => handleChange('tipoFilter', v)}
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

      {isEmpty ? (
        <Alert color="blue" title="Nenhum processo encontrado">
          {hasFilters 
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
            {state.processos.map(processo => (
              <tr key={processo.id}>
                <td>{processo.numero}</td>
                <td>{processo.clienteNome}</td>
                <td><Text lineClamp={1} maw={300}>{processo.descricao}</Text></td>
                <td><Badge color={getStatusColor(processo.status)}>{processo.status}</Badge></td>
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
                      onClick={() => setState(s => ({
                        ...s,
                        processoToDelete: processo,
                        deleteModalOpen: true
                      }))}
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
        opened={state.deleteModalOpen}
        onClose={() => setState(s => ({ ...s, deleteModalOpen: false }))}
        title="Confirmar exclusão"
      >
        <Text mb="xl">Tem certeza que deseja excluir o processo {state.processoToDelete?.numero}?</Text>
        <Group position="right">
          <Button variant="default" onClick={() => setState(s => ({ ...s, deleteModalOpen: false }))}>
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

export default ProcessoPage;