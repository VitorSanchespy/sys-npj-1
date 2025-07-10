import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Table, Button, Group, TextInput, MultiSelect, Badge, Paper, 
  LoadingOverlay, ActionIcon, Menu, Pagination, Text, Flex, Skeleton, Stack
} from '@mantine/core';
import { 
  IconSearch, IconPlus, IconEdit, IconTrash, IconListDetails, 
  IconUserPlus, IconRefresh, IconX
} from '@tabler/icons-react';
import api from '@/api/apiService';
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
  const navigate = useNavigate();
  const [state, setState] = useState({
    processes: [],
    loading: true,
    currentPage: 1,
    totalPages: 1,
    selectedProcess: null,
    filters: {
      search: '',
      status: [],
      tipo: [],
      numero: ''
    }
  });

  const fetchProcesses = async () => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      const params = {
        page: state.currentPage,
        limit: ITEMS_PER_PAGE,
        ...state.filters,
        status: state.filters.status.join(','),
        tipo: state.filters.tipo.join(',')
      };
      
      const { data } = await api.get('/processos', { params });
      setState(prev => ({ 
        ...prev, 
        processes: data.items,
        totalPages: data.totalPages,
        loading: false
      }));
    } catch {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => { fetchProcesses(); }, [
    state.currentPage, 
    state.filters.search,
    state.filters.status,
    state.filters.tipo,
    state.filters.numero
  ]);

  const handleFilterChange = (filter, value) => 
    setState(prev => ({ ...prev, filters: { ...prev.filters, [filter]: value } }));

  const handleResetFilters = () => 
    setState(prev => ({ ...prev, filters: { search: '', status: [], tipo: [], numero: '' } }));

  const activeFilters = Object.values(state.filters).filter(v => v.length > 0).length;

  return (
    <Paper withBorder p="md" radius="md">
      <Stack>
        <Group justify="space-between">
          <div>
            <Text size="xl" fw={700}>Processos Jurídicos</Text>
            <Text c="dimmed">Lista completa de processos</Text>
          </div>
          <Button 
            leftSection={<IconPlus size={16} />} 
            onClick={() => navigate('/processos/novo')}
          >
            Novo Processo
          </Button>
        </Group>

        <Paper p="md" bg="gray.1">
          <Group>
            <TextInput
              placeholder="Buscar..."
              leftSection={<IconSearch size={16} />}
              value={state.filters.search}
              onChange={e => handleFilterChange('search', e.target.value)}
              rightSection={state.filters.search && (
                <ActionIcon size="xs" onClick={() => handleFilterChange('search', '')}>
                  <IconX size={14} />
                </ActionIcon>
              )}
              style={{ flex: 2 }}
            />
            <MultiSelect
              placeholder="Status"
              data={STATUS_OPTIONS}
              value={state.filters.status}
              onChange={value => handleFilterChange('status', value)}
              clearable
              style={{ flex: 1 }}
            />
            <MultiSelect
              placeholder="Tipo"
              data={TIPO_OPTIONS}
              value={state.filters.tipo}
              onChange={value => handleFilterChange('tipo', value)}
              clearable
              style={{ flex: 1 }}
            />
            <TextInput
              placeholder="Número"
              value={state.filters.numero}
              onChange={e => handleFilterChange('numero', e.target.value)}
              rightSection={state.filters.numero && (
                <ActionIcon size="xs" onClick={() => handleFilterChange('numero', '')}>
                  <IconX size={14} />
                </ActionIcon>
              )}
              style={{ flex: 1 }}
            />
            <Group>
              <ActionIcon variant="outline" onClick={fetchProcesses}>
                <IconRefresh size={18} />
              </ActionIcon>
              {activeFilters > 0 && (
                <Button 
                  variant="outline" 
                  color="red" 
                  leftSection={<IconX size={16} />} 
                  onClick={handleResetFilters}
                >
                  Limpar filtros ({activeFilters})
                </Button>
              )}
            </Group>
          </Group>
        </Paper>

        {state.loading ? (
          <Stack>
            {[...Array(5)].map((_, i) => <Skeleton key={i} height={50} radius="sm" />)}
          </Stack>
        ) : state.processes.length === 0 ? (
          <EmptyState
            title="Nenhum processo encontrado"
            description={activeFilters > 0 ? 
              "Tente ajustar seus filtros de busca" : 
              "Cadastre um novo processo para começar"}
            action={{
              label: "Criar processo",
              leftSection: <IconPlus size={16} />,
              onClick: () => navigate('/processos/novo')
            }}
          />
        ) : (
          <>
            <Table.ScrollContainer minWidth={800}>
              <Table striped highlightOnHover>
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
                  {state.processes.map(process => (
                    <Table.Tr 
                      key={process.id} 
                      onClick={() => setState(prev => ({ 
                        ...prev, 
                        selectedProcess: prev.selectedProcess?.id === process.id ? null : process 
                      }))}
                    >
                      <Table.Td><Text fw={500}>{process.numero}</Text></Table.Td>
                      <Table.Td>
                        <Text>{process.clienteNome}</Text>
                        {process.clienteCpf && <Text size="sm" c="dimmed">{process.clienteCpf}</Text>}
                      </Table.Td>
                      <Table.Td>
                        <Badge variant="light" color="gray">{process.tipo}</Badge>
                      </Table.Td>
                      <Table.Td>{formatDate(process.dataAbertura)}</Table.Td>
                      <Table.Td>
                        <Badge color={STATUS_OPTIONS.find(s => s.value === process.status)?.color || 'gray'}>
                          {process.status}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Group noWrap>
                          <ActionIcon 
                            variant="subtle" 
                            color="blue" 
                            onClick={e => { 
                              e.stopPropagation(); 
                              navigate(`/processos/${process.id}`); 
                            }}
                          >
                            <IconListDetails size={18} />
                          </ActionIcon>
                          <ActionIcon 
                            variant="subtle" 
                            color="gray" 
                            onClick={e => { 
                              e.stopPropagation(); 
                              navigate(`/processos/editar/${process.id}`); 
                            }}
                          >
                            <IconEdit size={18} />
                          </ActionIcon>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>

            {state.totalPages > 1 && (
              <Group justify="space-between" mt="md">
                <Text c="dimmed">Página {state.currentPage} de {state.totalPages}</Text>
                <Pagination 
                  value={state.currentPage} 
                  onChange={page => setState(prev => ({ ...prev, currentPage: page }))} 
                  total={state.totalPages} 
                />
              </Group>
            )}
          </>
        )}

        {state.selectedProcess && (
          <Paper withBorder p="md" mt="md">
            <Flex justify="space-between" align="center" mb="md">
              <Text fw={600}>Detalhes: {state.selectedProcess.numero}</Text>
              <ActionIcon 
                variant="subtle" 
                onClick={() => setState(prev => ({ ...prev, selectedProcess: null }))}
              >
                <IconX size={18} />
              </ActionIcon>
            </Flex>
            <Grid>
              <Grid.Col span={4}>
                <Text size="sm" c="dimmed">Cliente</Text>
                <Text>{state.selectedProcess.clienteNome}</Text>
              </Grid.Col>
              <Grid.Col span={4}>
                <Text size="sm" c="dimmed">Status</Text>
                <Badge color={STATUS_OPTIONS.find(s => s.value === state.selectedProcess.status)?.color || 'gray'}>
                  {state.selectedProcess.status}
                </Badge>
              </Grid.Col>
              <Grid.Col span={4}>
                <Text size="sm" c="dimmed">Data</Text>
                <Text>{formatDate(state.selectedProcess.dataAbertura)}</Text>
              </Grid.Col>
              <Grid.Col span={12}>
                <Text size="sm" c="dimmed">Descrição</Text>
                <Text lineClamp={3}>{state.selectedProcess.descricao || 'Sem descrição'}</Text>
              </Grid.Col>
              <Grid.Col span={12}>
                <Button 
                  fullWidth 
                  variant="light" 
                  onClick={() => navigate(`/processos/${state.selectedProcess.id}`)}
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
export default ProcessList;