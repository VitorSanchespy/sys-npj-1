import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Table, Text, Button, Group, TextInput, Select, Badge, Paper, 
  LoadingOverlay, ActionIcon, Menu, Pagination, Avatar, Modal, Flex 
} from '@mantine/core';
import { 
  IconSearch, IconPlus, IconEdit, IconTrash, IconUser,
  IconFilter, IconRefresh, IconDotsVertical, IconLockOpen, IconMail
} from '@tabler/icons-react';
import api from '@/api/apiService';
import { useNotification } from '@/contexts/NotificationContext';
import EmptyState from '@/components/common/EmptyState';

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Administrador' },
  { value: 'advogado', label: 'Advogado' },
  { value: 'estagiario', label: 'Estagiário' },
  { value: 'cliente', label: 'Cliente' },
];

const STATUS_OPTIONS = [
  { value: 'ativo', label: 'Ativo' },
  { value: 'inativo', label: 'Inativo' },
  { value: 'pendente', label: 'Pendente' },
];

const ITEMS_PER_PAGE = 10;

export function UserList() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  
  const [state, setState] = useState({
    users: [],
    loading: true,
    searchTerm: '',
    roleFilter: '',
    statusFilter: '',
    currentPage: 1,
    totalPages: 1,
    deleteModalOpen: false,
    userToDelete: null
  });

  const fetchUsers = async (page = 1) => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      const params = {
        page,
        limit: ITEMS_PER_PAGE,
        search: state.searchTerm,
        role: state.roleFilter,
        status: state.statusFilter
      };
      
      const { data } = await api.get('/usuarios', { params });
      setState(prev => ({ 
        ...prev, 
        users: data.items,
        totalPages: data.totalPages,
        loading: false
      }));
    } catch (error) {
      showNotification('Erro ao carregar usuários', 'error');
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchUsers(state.currentPage);
  }, [state.currentPage, state.searchTerm, state.roleFilter, state.statusFilter]);

  const handleDelete = async () => {
    try {
      await api.delete(`/usuarios/${state.userToDelete.id}`);
      showNotification('Usuário removido com sucesso', 'success');
      fetchUsers(state.currentPage);
      setState(prev => ({ ...prev, deleteModalOpen: false, userToDelete: null }));
    } catch (error) {
      showNotification('Erro ao remover usuário', 'error');
    }
  };

  const handleResetPassword = async (userId) => {
    try {
      await api.post(`/usuarios/${userId}/reset-password`);
      showNotification('Link de redefinição enviado por email', 'success');
    } catch (error) {
      showNotification('Erro ao enviar link de redefinição', 'error');
    }
  };

  const getRoleColor = (role) => {
    switch(role) {
      case 'admin': return 'red';
      case 'advogado': return 'blue';
      case 'estagiario': return 'yellow';
      case 'cliente': return 'green';
      default: return 'gray';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'ativo': return 'green';
      case 'inativo': return 'red';
      case 'pendente': return 'yellow';
      default: return 'gray';
    }
  };

  const updateState = (key, value) => {
    setState(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Paper withBorder p="md" radius="md" pos="relative">
      <LoadingOverlay visible={state.loading} overlayBlur={2} />

      <Group position="apart" mb="md">
        <Text size="xl" fw={500}>Gerenciamento de Usuários</Text>
        <Button 
          leftIcon={<IconPlus size={16} />} 
          onClick={() => navigate('/usuarios/novo')}
        >
          Novo Usuário
        </Button>
      </Group>

      <Group mb="md" spacing="md">
        <TextInput
          placeholder="Buscar por nome ou email..."
          icon={<IconSearch size={16} />}
          value={state.searchTerm}
          onChange={(e) => updateState('searchTerm', e.target.value)}
          style={{ flex: 1 }}
        />

        <Select
          placeholder="Filtrar por cargo"
          data={ROLE_OPTIONS}
          value={state.roleFilter}
          onChange={(value) => updateState('roleFilter', value)}
          clearable
          icon={<IconUser size={16} />}
        />

        <Select
          placeholder="Filtrar por status"
          data={STATUS_OPTIONS}
          value={state.statusFilter}
          onChange={(value) => updateState('statusFilter', value)}
          clearable
          icon={<IconFilter size={16} />}
        />

        <ActionIcon
          variant="outline"
          size="lg"
          onClick={() => fetchUsers()}
          title="Recarregar"
        >
          <IconRefresh size={18} />
        </ActionIcon>
      </Group>

      {state.users.length === 0 ? (
        <EmptyState
          title="Nenhum usuário encontrado"
          description={state.searchTerm || state.roleFilter || state.statusFilter ? 
            "Tente ajustar sua busca ou filtros" : 
            "Cadastre um novo usuário para começar"}
        />
      ) : (
        <>
          <Table striped highlightOnHover verticalSpacing="sm">
            <thead>
              <tr>
                <th>Usuário</th>
                <th>Email</th>
                <th>Cargo</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {state.users.map(user => (
                <tr key={user.id}>
                  <td>
                    <Group spacing="sm">
                      <Avatar src={user.avatar} size={36} radius="xl">
                        {user.nome.charAt(0).toUpperCase()}
                      </Avatar>
                      <Text fw={500}>{user.nome}</Text>
                    </Group>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <Badge color={getRoleColor(user.role)}>
                      {ROLE_OPTIONS.find(r => r.value === user.role)?.label || user.role}
                    </Badge>
                  </td>
                  <td>
                    <Badge color={getStatusColor(user.status)}>
                      {STATUS_OPTIONS.find(s => s.value === user.status)?.label || user.status}
                    </Badge>
                  </td>
                  <td>
                    <Group spacing={4} noWrap>
                      <ActionIcon
                        color="blue"
                        onClick={() => navigate(`/usuarios/${user.id}`)}
                        title="Detalhes"
                      >
                        <IconEdit size={18} />
                      </ActionIcon>

                      <Menu position="bottom-end" withinPortal>
                        <Menu.Target>
                          <ActionIcon>
                            <IconDotsVertical size={18} />
                          </ActionIcon>
                        </Menu.Target>

                        <Menu.Dropdown>
                          <Menu.Item 
                            icon={<IconMail size={16} />}
                            onClick={() => navigate(`/usuarios/${user.id}/editar`)}
                          >
                            Editar
                          </Menu.Item>
                          <Menu.Item 
                            icon={<IconLockOpen size={16} />}
                            onClick={() => handleResetPassword(user.id)}
                          >
                            Redefinir senha
                          </Menu.Item>
                          <Menu.Item 
                            icon={<IconTrash size={16} />}
                            color="red"
                            onClick={() => {
                              updateState('userToDelete', user);
                              updateState('deleteModalOpen', true);
                            }}
                          >
                            Excluir
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </Group>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {state.totalPages > 1 && (
            <Group position="center" mt="xl">
              <Pagination
                page={state.currentPage}
                onChange={(page) => updateState('currentPage', page)}
                total={state.totalPages}
                siblings={1}
                boundaries={1}
              />
            </Group>
          )}
        </>
      )}

      <Modal
        opened={state.deleteModalOpen}
        onClose={() => updateState('deleteModalOpen', false)}
        title="Confirmar exclusão"
      >
        <Text mb="xl">
          Tem certeza que deseja excluir o usuário {state.userToDelete?.nome}?
        </Text>
        <Flex gap="sm" justify="flex-end">
          <Button variant="default" onClick={() => updateState('deleteModalOpen', false)}>
            Cancelar
          </Button>
          <Button color="red" onClick={handleDelete}>
            Confirmar Exclusão
          </Button>
        </Flex>
      </Modal>
    </Paper>
  );
}

export default UserList;