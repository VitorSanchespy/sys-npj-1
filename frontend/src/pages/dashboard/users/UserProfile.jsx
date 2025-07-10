import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TextInput, Button, Paper, LoadingOverlay, Group, Badge, ActionIcon, Modal, Select } from '@mantine/core';
import { IconPlus, IconEdit, IconTrash, IconSearch, IconRefresh } from '@tabler/icons-react';
import api from '@/api/apiService';

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

export function UsuariosPage() {
  const navigate = useNavigate();
  const [state, setState] = useState({
    usuarios: [],
    loading: true,
    searchTerm: '',
    roleFilter: '',
    statusFilter: '',
    deleteModalOpen: false,
    userToDelete: null
  });

  useEffect(() => { fetchUsuarios(); }, [state.searchTerm, state.roleFilter, state.statusFilter]);

  const fetchUsuarios = async () => {
    const params = {
      search: state.searchTerm,
      role: state.roleFilter,
      status: state.statusFilter
    };
    const { data } = await api.get('/usuarios', { params });
    setState(prev => ({ ...prev, usuarios: data, loading: false }));
  };

  const handleDelete = async () => {
    await api.delete(`/usuarios/${state.userToDelete.id}`);
    fetchUsuarios();
    setState(prev => ({ ...prev, deleteModalOpen: false, userToDelete: null }));
  };

  return (
    <Paper withBorder p="xl" radius="md">
      <LoadingOverlay visible={state.loading} />
      
      <Group justify="space-between" mb="xl">
        <Title order={2}>Gestão de Usuários</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={() => navigate('/usuarios/novo')}>
          Novo Usuário
        </Button>
      </Group>

      <Group mb="md">
        <TextInput
          placeholder="Buscar por nome ou email..."
          leftSection={<IconSearch size={16} />}
          value={state.searchTerm}
          onChange={e => setState(prev => ({ ...prev, searchTerm: e.target.value }))}
          style={{ flex: 1 }}
        />
        <Select
          placeholder="Filtrar por cargo"
          data={ROLE_OPTIONS}
          value={state.roleFilter}
          onChange={value => setState(prev => ({ ...prev, roleFilter: value }))}
          clearable
        />
        <Select
          placeholder="Filtrar por status"
          data={STATUS_OPTIONS}
          value={state.statusFilter}
          onChange={value => setState(prev => ({ ...prev, statusFilter: value }))}
          clearable
        />
        <ActionIcon variant="outline" size="lg" onClick={fetchUsuarios} title="Recarregar">
          <IconRefresh size={18} />
        </ActionIcon>
      </Group>

      {state.usuarios.length === 0 ? (
        <Text>Nenhum usuário encontrado</Text>
      ) : (
        <Table striped>
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
            {state.usuarios.map(usuario => (
              <tr key={usuario.id}>
                <td>{usuario.nome}</td>
                <td>{usuario.email}</td>
                <td>
                  <Badge color={{ admin: 'red', advogado: 'blue', estagiario: 'yellow', cliente: 'green' }[usuario.role] || 'gray'}>
                    {ROLE_OPTIONS.find(r => r.value === usuario.role)?.label || usuario.role}
                  </Badge>
                </td>
                <td>
                  <Badge color={usuario.status === 'ativo' ? 'green' : 'red'}>
                    {STATUS_OPTIONS.find(s => s.value === usuario.status)?.label || usuario.status}
                  </Badge>
                </td>
                <td>
                  <Group noWrap>
                    <ActionIcon color="blue" onClick={() => navigate(`/usuarios/${usuario.id}`)}>
                      <IconEdit size={18} />
                    </ActionIcon>
                    <ActionIcon color="red" onClick={() => setState(prev => ({ ...prev, userToDelete: usuario, deleteModalOpen: true }))}>
                      <IconTrash size={18} />
                    </ActionIcon>
                  </Group>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal opened={state.deleteModalOpen} onClose={() => setState(prev => ({ ...prev, deleteModalOpen: false }))} title="Confirmar exclusão">
        <Text mb="xl">Tem certeza que deseja excluir o usuário {state.userToDelete?.nome}?</Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={() => setState(prev => ({ ...prev, deleteModalOpen: false }))}>Cancelar</Button>
          <Button color="red" onClick={handleDelete}>Confirmar</Button>
        </Group>
      </Modal>
    </Paper>
  );
}
export default UserProfile;