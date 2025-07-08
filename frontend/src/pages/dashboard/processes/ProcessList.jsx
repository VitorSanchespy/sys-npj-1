import { useEffect, useState } from 'react';
import { 
  Table, 
  Button, 
  Group, 
  TextInput, 
  Select, 
  Badge, 
  Paper, 
  LoadingOverlay,
  ActionIcon,
  Menu,
  Pagination,
  Text
} from '@mantine/core';
import { 
  IconSearch, 
  IconPlus, 
  IconEdit, 
  IconTrash, 
  IconListDetails,
  IconUserPlus,
  IconFilter,
  IconRefresh
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import api from '@/api/apiService';
import { useNotification } from '@/contexts/NotificationContext';
import EmptyState from '@/components/EmptyState';

const STATUS_OPTIONS = [
  { value: 'ativo', label: 'Ativo' },
  { value: 'arquivado', label: 'Arquivado' },
  { value: 'encerrado', label: 'Encerrado' },
];

const ITEMS_PER_PAGE = 10;

export default function ProcessList() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [processes, setProcesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProcesses = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: ITEMS_PER_PAGE,
        search: searchTerm,
        status: statusFilter
      };
      
      const { data } = await api.get('/processos', { params });
      setProcesses(data.items);
      setTotalPages(data.totalPages);
    } catch (error) {
      showNotification('Erro ao carregar processos', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProcesses(currentPage);
  }, [currentPage, searchTerm, statusFilter]);

  const handleAssignStudent = async (processoId) => {
    try {
      await api.post(`/processos/${processoId}/alunos`);
      showNotification('Estagiário atribuído com sucesso', 'success');
      fetchProcesses(currentPage);
    } catch (error) {
      showNotification('Erro ao atribuir estagiário', 'error');
    }
  };

  const handleDelete = async (processoId) => {
    try {
      await api.delete(`/processos/${processoId}`);
      showNotification('Processo removido com sucesso', 'success');
      fetchProcesses(currentPage);
    } catch (error) {
      showNotification('Erro ao remover processo', 'error');
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

  const filteredProcesses = processes.filter(process =>
    process.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    process.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    process.clienteNome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Paper withBorder p="md" radius="md" pos="relative">
      <LoadingOverlay visible={loading} overlayBlur={2} />

      <Group position="apart" mb="md">
        <Text size="xl" fw={500}>Processos Jurídicos</Text>
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
          icon={<IconFilter size={16} />}
        />

        <ActionIcon
          variant="outline"
          size="lg"
          onClick={() => fetchProcesses()}
          title="Recarregar"
        >
          <IconRefresh size={18} />
        </ActionIcon>
      </Group>

      {filteredProcesses.length === 0 ? (
        <EmptyState
          title="Nenhum processo encontrado"
          description={searchTerm || statusFilter ? 
            "Tente ajustar sua busca ou filtros" : 
            "Cadastre um novo processo para começar"}
        />
      ) : (
        <>
          <Table striped highlightOnHover verticalSpacing="sm">
            <thead>
              <tr>
                <th>Número</th>
                <th>Cliente</th>
                <th>Descrição</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredProcesses.map(process => (
                <tr key={process.id}>
                  <td>{process.numero}</td>
                  <td>{process.clienteNome}</td>
                  <td>
                    <Text lineClamp={1} style={{ maxWidth: 300 }}>
                      {process.descricao}
                    </Text>
                  </td>
                  <td>
                    <Badge color={getStatusColor(process.status)}>
                      {process.status}
                    </Badge>
                  </td>
                  <td>
                    <Group spacing={4} noWrap>
                      <ActionIcon
                        color="blue"
                        onClick={() => navigate(`/processos/${process.id}`)}
                        title="Detalhes"
                      >
                        <IconListDetails size={18} />
                      </ActionIcon>

                      <ActionIcon
                        color="gray"
                        onClick={() => navigate(`/processos/editar/${process.id}`)}
                        title="Editar"
                      >
                        <IconEdit size={18} />
                      </ActionIcon>

                      <Menu position="bottom-end" withinPortal>
                        <Menu.Target>
                          <ActionIcon color="red" title="Mais opções">
                            <IconTrash size={18} />
                          </ActionIcon>
                        </Menu.Target>

                        <Menu.Dropdown>
                          <Menu.Item 
                            icon={<IconUserPlus size={16} />}
                            onClick={() => handleAssignStudent(process.id)}
                          >
                            Atribuir estagiário
                          </Menu.Item>
                          <Menu.Item 
                            icon={<IconTrash size={16} />}
                            color="red"
                            onClick={() => handleDelete(process.id)}
                          >
                            Excluir processo
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </Group>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {totalPages > 1 && (
            <Group position="center" mt="xl">
              <Pagination
                page={currentPage}
                onChange={setCurrentPage}
                total={totalPages}
                siblings={1}
                boundaries={1}
              />
            </Group>
          )}
        </>
      )}
    </Paper>
  );
}