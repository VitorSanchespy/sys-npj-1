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
  Alert,
  Switch,
  Avatar
} from '@mantine/core';
import { 
  IconPlus, 
  IconEdit, 
  IconTrash, 
  IconSearch,
  IconUser,
  IconRefresh,
  IconMail,
  IconShield,
  IconUserOff,
  IconUserCheck
} from '@tabler/icons-react';
import api from '@/api/apiService';
import useNotification from '@/hooks/useNotification';

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

export default function UsuariosPage() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const params = {
        search: searchTerm,
        role: roleFilter,
        status: statusFilter
      };
      const { data } = await api.get('/usuarios', { params });
      setUsuarios(data);
    } catch (error) {
      showNotification('Erro ao carregar usuários', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, [searchTerm, roleFilter, statusFilter]);

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await api.put(`/usuarios/${id}/status`, { 
        status: currentStatus === 'ativo' ? 'inativo' : 'ativo' 
      });
      showNotification('Status do usuário atualizado', 'success');
      fetchUsuarios();
    } catch (error) {
      showNotification('Erro ao atualizar status', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/usuarios/${userToDelete.id}`);
      showNotification('Usuário removido com sucesso', 'success');
      fetchUsuarios();
    } catch (error) {
      showNotification('Erro ao remover usuário', 'error');
    } finally {
      setDeleteModalOpen(false);
      setUserToDelete(null);
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
    <Paper withBorder p="xl" radius="md" pos="relative">
      <LoadingOverlay visible={loading} overlayBlur={2} />

      <Group position="apart" mb="xl">
        <Title order={2}>Gestão de Usuários</Title>
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
          icon={<IconShield size={16} />}
        />

        <Select
          placeholder="Filtrar por status"
          data={STATUS_OPTIONS}
          value={statusFilter}
          onChange={setStatusFilter}
          clearable
          icon={<IconUser size={16} />}
        />

        <ActionIcon
          variant="outline"
          size="lg"
          onClick={fetchUsuarios}
          title="Recarregar"
        >
          <IconRefresh size={18} />
        </ActionIcon>
      </Group>

      {usuarios.length === 0 ? (
        <Alert color="blue" title="Nenhum usuário encontrado">
          {searchTerm || roleFilter || statusFilter 
            ? "Tente ajustar sua busca ou filtros" 
            : "Nenhum usuário cadastrado ainda"}
        </Alert>
      ) : (
        <Table striped highlightOnHover>
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
            {usuarios.map((usuario) => (
              <tr key={usuario.id}>
                <td>
                  <Group spacing="sm">
                    <Avatar src={usuario.avatar} size={36} radius="xl">
                      {usuario.nome.charAt(0).toUpperCase()}
                    </Avatar>
                    <Text>{usuario.nome}</Text>
                  </Group>
                </td>
                <td>
                  <Group spacing="xs">
                    <IconMail size={16} color="gray" />
                    <Text>{usuario.email}</Text>
                  </Group>
                </td>
                <td>
                  <Badge color={getRoleColor(usuario.role)}>
                    {ROLE_OPTIONS.find(r => r.value === usuario.role)?.label || usuario.role}
                  </Badge>
                </td>
                <td>
                  <Group spacing="xs">
                    <Switch
                      checked={usuario.status === 'ativo'}
                      onChange={() => handleToggleStatus(usuario.id, usuario.status)}
                      color="teal"
                      size="md"
                      thumbIcon={
                        usuario.status === 'ativo' ? (
                          <IconUserCheck size={12} color="green" />
                        ) : (
                          <IconUserOff size={12} color="red" />
                        )
                      }
                    />
                    <Badge color={getStatusColor(usuario.status)}>
                      {STATUS_OPTIONS.find(s => s.value === usuario.status)?.label || usuario.status}
                    </Badge>
                  </Group>
                </td>
                <td>
                  <Group spacing={4} noWrap>
                    <ActionIcon
                      color="blue"
                      onClick={() => navigate(`/usuarios/${usuario.id}`)}
                      title="Editar"
                    >
                      <IconEdit size={18} />
                    </ActionIcon>

                    <ActionIcon
                      color="red"
                      onClick={() => {
                        setUserToDelete(usuario);
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
        <Text mb="xl">Tem certeza que deseja excluir o usuário {userToDelete?.nome}?</Text>
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