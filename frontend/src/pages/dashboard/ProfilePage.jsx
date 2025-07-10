import { useState, useEffect } from 'react';
import { 
  Avatar, 
  TextInput, 
  Button, 
  Group, 
  Text, 
  Paper, 
  Container, 
  LoadingOverlay, 
  Tabs, 
  Badge,
  Divider,
  FileInput,
  Alert,
  Stack
} from '@mantine/core';
import { 
  IconUser, 
  IconMail, 
  IconLock, 
  IconDeviceMobile,
  IconUpload,
  IconShield,
  IconCalendar,
  IconCheck,
  IconX
} from '@tabler/icons-react';
import api from '@/api/apiService';
import { useNotification } from '@/contexts/NotificationContext';
import { validatePassword } from '@/utils/validators';

export function ProfilePage() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [activeTab, setActiveTab] = useState('info');
  const { showNotification } = useNotification();

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/auth/profile');
      setUser(data);
      setFormData({
        nome: data.nome,
        email: data.email,
        telefone: data.telefone || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setAvatarPreview(data.avatarUrl);
    } catch (error) {
      showNotification('Erro ao carregar perfil', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

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

  const handleInfoUpdate = async () => {
    setUpdating(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('nome', formData.nome);
      formDataToSend.append('telefone', formData.telefone);
      if (avatarFile) formDataToSend.append('avatar', avatarFile);

      await api.put('/auth/profile', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      showNotification('Perfil atualizado com sucesso!', 'success');
      fetchProfile();
    } catch (error) {
      showNotification(error.response?.data?.message || 'Erro ao atualizar perfil', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      showNotification('As senhas não coincidem', 'error');
      return;
    }

    if (!validatePassword(formData.newPassword)) {
      showNotification('A senha deve ter pelo menos 6 caracteres', 'error');
      return;
    }

    setUpdating(true);
    try {
      await api.put('/auth/password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      showNotification('Senha atualizada com sucesso!', 'success');
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      showNotification(error.response?.data?.message || 'Erro ao atualizar senha', 'error');
    } finally {
      setUpdating(false);
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

  if (loading) return <LoadingOverlay visible overlayBlur={2} />;
  if (!user) return <Alert color="red">Erro ao carregar perfil</Alert>;

  return (
    <Container size="md" py="xl">
      <Title order={2} mb="xl">Meu Perfil</Title>

      <Paper withBorder p="xl" radius="md" pos="relative">
        <LoadingOverlay visible={updating} overlayBlur={2} />

        <Group align="flex-start" spacing="xl">
          {/* Left Column - Avatar and Basic Info */}
          <Stack spacing="md" style={{ minWidth: 250 }}>
            <Group position="center">
              <Avatar 
                src={avatarPreview} 
                size={120} 
                radius={120}
              >
                {user.nome.charAt(0).toUpperCase()}
              </Avatar>
            </Group>

            <FileInput
              label="Alterar foto"
              placeholder="Selecionar imagem"
              accept="image/*"
              icon={<IconUpload size={14} />}
              value={avatarFile}
              onChange={handleAvatarChange}
              clearable
            />

            <Divider />

            <Stack spacing="xs">
              <Group spacing="xs">
                <IconShield size={18} />
                <Badge color={getRoleColor(user.role)}>
                  {user.role}
                </Badge>
              </Group>
              <Group spacing="xs">
                <IconCalendar size={18} />
                <Text size="sm">
                  Membro desde {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                </Text>
              </Group>
            </Stack>
          </Stack>

          {/* Right Column - Editable Info */}
          <Stack style={{ flex: 1 }} spacing="xl">
            <Tabs value={activeTab} onTabChange={setActiveTab}>
              <Tabs.List>
                <Tabs.Tab value="info">Informações Pessoais</Tabs.Tab>
                <Tabs.Tab value="password">Alterar Senha</Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="info" pt="xl">
                <Stack spacing="md">
                  <TextInput
                    label="Nome Completo"
                    icon={<IconUser size={16} />}
                    value={formData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                    required
                  />

                  <TextInput
                    label="Email"
                    icon={<IconMail size={16} />}
                    value={formData.email}
                    readOnly
                    disabled
                  />

                  <TextInput
                    label="Telefone"
                    icon={<IconDeviceMobile size={16} />}
                    value={formData.telefone}
                    onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                    placeholder="(00) 00000-0000"
                  />

                  <Group position="right" mt="md">
                    <Button 
                      leftIcon={<IconCheck size={16} />}
                      onClick={handleInfoUpdate}
                    >
                      Salvar Alterações
                    </Button>
                  </Group>
                </Stack>
              </Tabs.Panel>

              <Tabs.Panel value="password" pt="xl">
                <Stack spacing="md">
                  <PasswordInput
                    label="Senha Atual"
                    icon={<IconLock size={16} />}
                    value={formData.currentPassword}
                    onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                    required
                  />

                  <PasswordInput
                    label="Nova Senha"
                    icon={<IconLock size={16} />}
                    value={formData.newPassword}
                    onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                    required
                  />

                  <PasswordInput
                    label="Confirmar Nova Senha"
                    icon={<IconLock size={16} />}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    required
                  />

                  <Group position="right" mt="md">
                    <Button 
                      leftIcon={<IconCheck size={16} />}
                      onClick={handlePasswordUpdate}
                    >
                      Alterar Senha
                    </Button>
                  </Group>
                </Stack>
              </Tabs.Panel>
            </Tabs>
          </Stack>
        </Group>
      </Paper>
    </Container>
  );
}

export default ProfilePage;