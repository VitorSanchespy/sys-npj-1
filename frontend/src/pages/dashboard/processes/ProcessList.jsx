import { useState, useEffect, useCallback } from 'react';
import { 
  Table, 
  Button, 
  Group, 
  TextInput, 
  Select, 
  Badge, 
  Paper, 
  ActionIcon,
  Menu,
  Pagination,
  Text,
  Grid,
  Stack,
  Loader,
  Skeleton,
  Flex,
  MultiSelect,
  Input,
  useMantineTheme // Adicionado hook para acessar o tema
} from '@mantine/core';
import { 
  IconSearch, 
  IconPlus, 
  IconEdit, 
  IconTrash, 
  IconListDetails,
  IconUserPlus,
  IconFilter,
  IconRefresh,
  IconX,
  IconFile
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import api from '@/api/apiService';
import { notifications } from '@mantine/notifications';
import EmptyState from '@/components/common/EmptyState';
import { formatDate } from '@/utils/formatters';

const STATUS_OPTIONS = [
  { value: 'ativo', label: 'Ativo', color: 'green' },
  { value: 'arquivado', label: 'Arquivado', color: 'yellow' },
  { value: 'encerrado', label: 'Encerrado', color: 'red' },
  { value: 'suspenso', label: 'Suspenso', color: 'blue' },
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

const ITEMS_PER_PAGE = 10;

export function ProcessList() {
  const theme = useMantineTheme(); // Acesso ao tema
  const navigate = useNavigate();
  const [processes, setProcesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [activeFilters, setActiveFilters] = useState([]);

  // Filtros
  const [filters, setFilters] = useState({
    search: '',
    status: [],
    tipo: [],
    cliente: '',
    numero: '',
  });

  const fetchProcesses = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: ITEMS_PER_PAGE,
        ...filters,
        status: filters.status.join(','),
        tipo: filters.tipo.join(','),
      };
      
      const { data } = await api.get('/processos', { params });
      setProcesses(data.items);
      setTotalPages(data.totalPages);
      setSelectedProcess(null);
    } catch (error) {
      notifications.show({
        title: 'Erro ao carregar processos',
        message: error.response?.data?.message || 'Tente novamente mais tarde',
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProcesses(currentPage);
  }, [currentPage, filters, fetchProcesses]);

  const handleAssignStudent = async (processoId) => {
    try {
      await api.post(`/processos/${processoId}/alunos`);
      notifications.show({
        title: 'Estagiário atribuído',
        message: 'Um estagiário foi designado para este processo',
        color: 'teal'
      });
      fetchProcesses(currentPage);
    } catch (error) {
      notifications.show({
        title: 'Erro ao atribuir estagiário',
        message: error.response?.data?.message || 'Tente novamente',
        color: 'red'
      });
    }
  };

  const handleDelete = async (processoId) => {
    try {
      await api.delete(`/processos/${processoId}`);
      notifications.show({
        title: 'Processo removido',
        message: 'O processo foi excluído com sucesso',
        color: 'green'
      });
      fetchProcesses(currentPage);
    } catch (error) {
      notifications.show({
        title: 'Erro ao remover processo',
        message: error.response?.data?.message || 'Tente novamente',
        color: 'red'
      });
    }
  };

  const handleFilterChange = (filter, value) => {
    setFilters(prev => ({ ...prev, [filter]: value }));
    
    // Atualizar filtros ativos
    if (value && value.length > 0) {
      if (!activeFilters.includes(filter)) {
        setActiveFilters(prev => [...prev, filter]);
      }
    } else {
      setActiveFilters(prev => prev.filter(f => f !== filter));
    }
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      status: [],
      tipo: [],
      cliente: '',
      numero: '',
    });
    setActiveFilters([]);
    setCurrentPage(1);
  };

  const handleRowClick = (process) => {
    setSelectedProcess(selectedProcess?.id === process.id ? null : process);
  };

  const handleViewDetails = (id, e) => {
    e.stopPropagation();
    navigate(`/processos/${id}`);
  };

  const handleEdit = (id, e) => {
    e.stopPropagation();
    navigate(`/processos/editar/${id}`);
  };

  return (
    <Paper withBorder p="md" radius="md">
      <Stack spacing="lg">
        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={3} fw={700} mb={4}>Processos Jurídicos</Title>
            <Text c="dimmed">Lista completa de processos do sistema</Text>
          </div>
          <Button 
            leftSection={<IconPlus size={16} />} 
            onClick={() => navigate('/processos/novo')}
          >
            Novo Processo
          </Button>
        </Group>

        {/* Barra de filtros */}
        <Paper 
          sx={(theme) => ({
            backgroundColor: theme.colorScheme === 'dark' 
              ? theme.colors.dark[7] 
              : theme.colors.gray[1],
            borderRadius: theme.radius.md,
            padding: theme.spacing.md,
          })}
        >
          <Grid gutter="md">
            <Grid.Col span={{ base: 12, md: 3 }}>
              <TextInput
                placeholder="Buscar..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                leftSection={<IconSearch size={16} />}
                rightSection={filters.search && (
                  <ActionIcon size="xs" onClick={() => handleFilterChange('search', '')}>
                    <IconX size={14} />
                  </ActionIcon>
                )}
              />
            </Grid.Col>
            
            <Grid.Col span={{ base: 6, md: 2 }}>
              <MultiSelect
                placeholder="Status"
                data={STATUS_OPTIONS}
                value={filters.status}
                onChange={(value) => handleFilterChange('status', value)}
                clearable
                leftSection={<IconFilter size={16} />}
              />
            </Grid.Col>
            
            <Grid.Col span={{ base: 6, md: 2 }}>
              <MultiSelect
                placeholder="Tipo"
                data={TIPO_OPTIONS}
                value={filters.tipo}
                onChange={(value) => handleFilterChange('tipo', value)}
                clearable
              />
            </Grid.Col>
            
            <Grid.Col span={{ base: 6, md: 2 }}>
              <TextInput
                placeholder="Número"
                value={filters.numero}
                onChange={(e) => handleFilterChange('numero', e.target.value)}
                rightSection={filters.numero && (
                  <ActionIcon size="xs" onClick={() => handleFilterChange('numero', '')}>
                    <IconX size={14} />
                  </ActionIcon>
                )}
              />
            </Grid.Col>
            
            <Grid.Col span={{ base: 6, md: 3 }}>
              <Group justify="flex-end">
                <Button 
                  variant="subtle" 
                  leftSection={<IconRefresh size={16} />}
                  onClick={() => fetchProcesses(currentPage)}
                >
                  Atualizar
                </Button>
                {activeFilters.length > 0 && (
                  <Button 
                    variant="outline" 
                    color="red"
                    leftSection={<IconX size={16} />}
                    onClick={handleResetFilters}
                  >
                    Limpar filtros ({activeFilters.length})
                  </Button>
                )}
              </Group>
            </Grid.Col>
          </Grid>
        </Paper>

        {loading ? (
          <LoadingSkeleton />
        ) : processes.length === 0 ? (
          <EmptyState
            title="Nenhum processo encontrado"
            description={activeFilters.length > 0 ? 
              "Tente ajustar seus filtros de busca" : 
              "Cadastre um novo processo para começar"}
            action={{
              label: "Criar processo",
              props: { 
                onClick: () => navigate('/processos/novo'),
                leftSection: <IconPlus size={16} />
              }
            }}
          />
        ) : (
          <>
            <Table.ScrollContainer minWidth={800}>
              <Table striped highlightOnHover verticalSpacing="sm">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Número</Table.Th>
                    <Table.Th>Cliente</Table.Th>
                    <Table.Th>Tipo</Table.Th>
                    <Table.Th>Data</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Ações</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {processes.map(process => (
                    <Table.Tr 
                      key={process.id} 
                      sx={(theme) => ({
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: theme.colorScheme === 'dark' 
                            ? theme.colors.dark[6] 
                            : theme.colors.gray[0],
                        },
                        ...(selectedProcess?.id === process.id && {
                          backgroundColor: theme.colorScheme === 'dark' 
                            ? theme.colors.dark[5] 
                            : theme.colors.blue[0],
                        }),
                      })}
                      onClick={() => handleRowClick(process)}
                    >
                      <Table.Td>
                        <Text fw={500}>{process.numero}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Text>{process.clienteNome}</Text>
                        {process.clienteCpf && (
                          <Text size="sm" c="dimmed">{process.clienteCpf}</Text>
                        )}
                      </Table.Td>
                      <Table.Td>
                        <Badge variant="light" color="gray">
                          {process.tipo}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text>{formatDate(process.dataAbertura)}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge color={STATUS_OPTIONS.find(s => s.value === process.status)?.color || 'gray'}>
                          {process.status}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Group gap={4} wrap="nowrap">
                          <ActionIcon
                            variant="subtle"
                            color="blue"
                            onClick={(e) => handleViewDetails(process.id, e)}
                            title="Detalhes"
                          >
                            <IconListDetails size={18} />
                          </ActionIcon>

                          <ActionIcon
                            variant="subtle"
                            color="gray"
                            onClick={(e) => handleEdit(process.id, e)}
                            title="Editar"
                          >
                            <IconEdit size={18} />
                          </ActionIcon>

                          <Menu position="bottom-end" withinPortal>
                            <Menu.Target>
                              <ActionIcon variant="subtle" color="red" title="Mais opções">
                                <IconFile size={18} />
                              </ActionIcon>
                            </Menu.Target>

                            <Menu.Dropdown>
                              <Menu.Item 
                                leftSection={<IconUserPlus size={16} />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAssignStudent(process.id);
                                }}
                              >
                                Atribuir estagiário
                              </Menu.Item>
                              <Menu.Item 
                                leftSection={<IconTrash size={16} />}
                                color="red"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(process.id);
                                }}
                              >
                                Excluir processo
                              </Menu.Item>
                            </Menu.Dropdown>
                          </Menu>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>

            {totalPages > 1 && (
              <Group justify="space-between" mt="xl">
                <Text c="dimmed">
                  Página {currentPage} de {totalPages} • {processes.length} processos
                </Text>
                <Pagination
                  value={currentPage}
                  onChange={setCurrentPage}
                  total={totalPages}
                  siblings={1}
                  boundaries={1}
                />
              </Group>
            )}
          </>
        )}

        {/* Painel de detalhes rápido */}
        {selectedProcess && (
          <Paper withBorder p="md" radius="md" mt="md">
            <Flex justify="space-between" align="center" mb="md">
              <Title order={4} fw={600}>
                Detalhes: {selectedProcess.numero}
              </Title>
              <ActionIcon 
                variant="subtle" 
                color="gray"
                onClick={() => setSelectedProcess(null)}
              >
                <IconX size={18} />
              </ActionIcon>
            </Flex>
            
            <Grid gutter="md">
              <Grid.Col span={4}>
                <Text fw={500} size="sm" c="dimmed">Cliente</Text>
                <Text>{selectedProcess.clienteNome}</Text>
              </Grid.Col>
              <Grid.Col span={4}>
                <Text fw={500} size="sm" c="dimmed">Status</Text>
                <Badge color={STATUS_OPTIONS.find(s => s.value === selectedProcess.status)?.color || 'gray'}>
                  {selectedProcess.status}
                </Badge>
              </Grid.Col>
              <Grid.Col span={4}>
                <Text fw={500} size="sm" c="dimmed">Data de Abertura</Text>
                <Text>{formatDate(selectedProcess.dataAbertura)}</Text>
              </Grid.Col>
              
              <Grid.Col span={12}>
                <Text fw={500} size="sm" c="dimmed">Descrição</Text>
                <Text lineClamp={3}>{selectedProcess.descricao || 'Sem descrição'}</Text>
              </Grid.Col>
              
              <Grid.Col span={12}>
                <Button
                  fullWidth
                  variant="light"
                  onClick={() => navigate(`/processos/${selectedProcess.id}`)}
                >
                  Ver detalhes completos
                </Button>
              </Grid.Col>
            </Grid>
          </Paper>
        )}
      </Stack>
    </Paper>
  );
}

function LoadingSkeleton() {
  return (
    <Stack>
      {Array.from({ length: 5 }).map((_, index) => (
        <Skeleton key={index} height={50} radius="sm" />
      ))}
    </Stack>
  );
}

export default ProcessList;