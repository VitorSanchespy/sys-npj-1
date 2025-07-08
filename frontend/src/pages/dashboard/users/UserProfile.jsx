import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Avatar,
  Text,
  Title,
  Paper,
  Group,
  Stack,
  Divider,
  Button,
  LoadingOverlay,
  Tabs,
  TextInput,
  Select,
  Badge,
  Modal,
  FileInput,
  Alert
} from '@mantine/core';
import {
  IconUser,
  IconEdit,
  IconLock,
  IconMail,
  IconPhone,
  IconArrowLeft,
  IconCheck,
  IconX,
  IconUpload
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

export default function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await api.get(`/usuarios/${id}`);
        setUser(data);
        setAvatarPreview(data.avatarUrl);
      } catch (err) {
        setError(err.response?.data?.message || 'Erro ao carregar usuário');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const handleAvatarChange = (file) => {
    setAvatarFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setAvatarPreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setAvatarPreview(user?.avatarUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('nome', user.nome);
      formData.append('email', user.email);
      formData.append('telefone', user.telefone);
      formData.append('role', user.role);
      formData.append('status', user.status);
      if (avatarFile) formData.append('avatar', avatarFile);

      await api.put(`/usuarios/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      showNotification('Perfil atualizado com sucesso!', 'success');
      setEditMode(false);
      // Refresh user data
      const { data } = await api.get(`/usuarios/${id}`);
      setUser(data);
    } catch (err) {
      showNotification(err.response?.data?.message || 'Erro ao atualizar perfil', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    try {
      await api.post(`/usuarios/${id}/reset-password`);
      showNotification('Link de redefinição enviado por email!', 'success');
      setShowPasswordModal(false);
    } catch (err) {
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

  if (loading) return <LoadingOverlay visible overlayBlur={2} />;
  if (error) return <Alert color="red">{error}</Alert>;
  if (!user) return null;

  return (
    <Paper withBorder p="xl" radius="md" pos="relative">
      <LoadingOverlay visible={loading} overlayBlur={2} />

      <Group mb="xl">
        <Button
          variant="subtle"
          leftIcon={<IconArrowLeft size={16} />}
          onClick={() => navigate(-1)}
        >
          Voltar
        </Button>
        <Title order={2}>Perfil do Usuário</Title>
      </Group>

      <Tabs defaultValue="profile">
        <Tabs.List>
          <Tabs.Tab value="profile" icon={<IconUser size={14} />}>
            Perfil
          </Tabs.Tab>
          <Tabs.Tab value="activity" icon={<IconEdit size={14} />}>
            Atividade
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="profile" pt="xl">
          <form onSubmit={handleSubmit}>
            <Group align="flex-start" spacing="xl">
              {/* Left Column - Avatar */}
              <Stack spacing="md" style={{ minWidth: 200 }}>
                <Group position="center">
                  <Avatar 
                    src={avatarPreview} 
                    size={120} 
                    radius={120}
                  >
                    {user.nome.charAt(0).toUpperCase()}
                  </Avatar>
                </Group>

                {editMode ? (
                  <FileInput
                    label="Alterar foto"
                    placeholder="Selecionar imagem"
                    accept="image/*"
                    icon={<IconUpload size={14} />}
                    value={avatarFile}
                    onChange={handleAvatarChange}
                  />
                ) : (
                  <Group position="center" spacing="xs">
                    <Badge color={getRoleColor(user.role)} size="lg">
                      {ROLE_OPTIONS.find(r => r.value === user.role)?.label || user.role}
                    </Badge>
                    <Badge color={getStatusColor(user.status)} size="lg">
                      {STATUS_OPTIONS.find(s => s.value === user.status)?.label || user.status}
                    </Badge>
                  </Group>
                )}

                {!editMode && (
                  <Button 
                    fullWidth 
                    leftIcon={<IconLock size={14} />}
                    onClick={() => setShowPasswordModal(true)}
                  >
                    Redefinir Senha
                  </Button>
                )}
              </Stack>

              {/* Right Column - User Info */}
              <Stack spacing="md" style={{ flex: 1 }}>
                {editMode ? (
                  <>
                    <TextInput
                      label="Nome Completo"
                      value={user.nome}
                      onChange={(e) => setUser({...user, nome: e.target.value})}
                      required
                      icon={<IconUser size={16} />}
                    />

                    <TextInput
                      label="Email"
                      value={user.email}
                      onChange={(e) => setUser({...user, email: e.target.value})}
                      required
                      icon={<IconMail size={16} />}
                    />

                    <TextInput
                      label="Telefone"
                      value={user.telefone || ''}
                      onChange={(e) => setUser({...user, telefone: e.target.value})}
                      icon={<IconPhone size={16} />}
                    />

                    <Group grow>
                      <Select
                        label="Cargo"
                        data={ROLE_OPTIONS}
                        value={user.role}
                        onChange={(value) => setUser({...user, role: value})}
                        required
                      />

                      <Select
                        label="Status"
                        data={STATUS_OPTIONS}
                        value={user.status}
                        onChange={(value) => setUser({...user, status: value})}
                        required
                      />
                    </Group>
                  </>
                ) : (
                  <>
                    <Title order={3}>{user.nome}</Title>
                    <Divider />

                    <Group spacing="xs">
                      <IconMail size={18} color="gray" />
                      <Text>{user.email}</Text>
                    </Group>

                    {user.telefone && (
                      <Group spacing="xs">
                        <IconPhone size={18} color="gray" />
                        <Text>{user.telefone}</Text>
                      </Group>
                    )}

                    <Group spacing="xs">
                      <IconUser size={18} color="gray" />
                      <Text>Criado em: {new Date(user.createdAt).toLocaleDateString('pt-BR')}</Text>
                    </Group>
                  </>
                )}

                <Group mt="xl">
                  {editMode ? (
                    <>
                      <Button 
                        type="submit" 
                        leftIcon={<IconCheck size={16} />}
                      >
                        Salvar Alterações
                      </Button>
                      <Button 
                        variant="default" 
                        leftIcon={<IconX size={16} />}
                        onClick={() => {
                          setEditMode(false);
                          setAvatarFile(null);
                          setAvatarPreview(user.avatarUrl);
                        }}
                      >
                        Cancelar
                      </Button>
                    </>
                  ) : (
                    <Button 
                      leftIcon={<IconEdit size={16} />}
                      onClick={() => setEditMode(true)}
                    >
                      Editar Perfil
                    </Button>
                  )}
                </Group>
              </Stack>
            </Group>
          </form>
        </Tabs.Panel>

        <Tabs.Panel value="activity" pt="xl">
          {/* User activity/logs would go here */}
          <Text color="dimmed">Histórico de atividades do usuário</Text>
        </Tabs.Panel>
      </Tabs>

      {/* Password Reset Modal */}
      <Modal
        opened={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Redefinir Senha"
      >
        <Text mb="xl">
          Um link para redefinição de senha será enviado para o email: {user.email}
        </Text>
        <Group position="right">
          <Button variant="default" onClick={() => setShowPasswordModal(false)}>
            Cancelar
          </Button>
          <Button color="blue" onClick={handlePasswordReset}>
            Confirmar
          </Button>
        </Group>
      </Modal>
    </Paper>
  );
}