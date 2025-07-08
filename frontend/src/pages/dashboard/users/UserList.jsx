import { useState, useEffect } from 'react';
import { 
  Table,
  Text,
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
  Avatar,
  Modal,
  Flex
} from '@mantine/core';
import { 
  IconSearch, 
  IconPlus, 
  IconEdit, 
  IconTrash, 
  IconUser,
  IconFilter,
  IconRefresh,
  IconDotsVertical,
  IconLockOpen,
  IconMail
} from '@tabler/icons-react';
import api from '@/api/apiService';
import useNotification from '@/hooks/useNotification';
import EmptyState from '@/components/EmptyState';

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

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const { showNotification } = useNotification();

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: ITEMS_PER_PAGE,
        search: searchTerm,
        role: roleFilter,
        status: statusFilter
      };
      
      const { data } = await api.get('/usuarios', { params });
      setUsers(data.items);
      setTotalPages(data.totalPages);
    } catch (error) {
      showNotification('Erro ao carregar usuários', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage, searchTerm, roleFilter, statusFilter]);

  const handleDelete = async () => {
    try {
      await api.delete(`/usuarios/${userToDelete.id}`);
      showNotification('Usuário removido com sucesso', 'success');
      fetchUsers(currentPage);
    } catch (error) {
      showNotification('Erro ao remover usuário', 'error');
    } finally {
      setDeleteModalOpen(false);
      setUserToDelete(null);
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

  return (
    <Paper withBorder p="md" radius="md" pos="relative">
      <LoadingOverlay visible={loading} overlayBlur={2} />

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
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 1 }}
        />

        <Select
          placeholder="Filtrar por cargo"
          data={ROLE_OPTIONS}
          value={roleFilter}
          onChange={setRoleFilter}
          clearable
          icon={<IconUser size={16} />}
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
          onClick={() => fetchUsers()}
          title="Recarregar"
        >
          <IconRefresh size={18} />
        </ActionIcon>
      </Group>

      {users.length === 0 ? (
        <EmptyState
          title="Nenhum usuário encontrado"
          description={searchTerm || roleFilter || statusFilter ? 
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
              {users.map(user => (
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
                              setUserToDelete(user);
                              setDeleteModalOpen(true);
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

      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirmar exclusão"
      >
        <Text mb="xl">Tem certeza que deseja excluir o usuário {userToDelete?.nome}?</Text>
        <Flex gap="sm" justify="flex-end">
          <Button variant="default" onClick={() => setDeleteModalOpen(false)}>
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