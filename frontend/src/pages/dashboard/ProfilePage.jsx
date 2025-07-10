import { useState, useEffect } from 'react';
import { 
  Avatar, TextInput, Button, Group, Text, 
  Paper, Container, LoadingOverlay, Tabs, 
  Badge, Divider, FileInput, Alert, Stack, PasswordInput
} from '@mantine/core';
import { 
  IconUser, IconMail, IconLock, IconDeviceMobile,
  IconUpload, IconShield, IconCalendar, IconCheck
} from '@tabler/icons-react';
import api from '@/api/apiService';
import { useNotification } from '@/contexts/NotificationContext';
import { validatePassword } from '@/utils/validators';

export function ProfilePage() {
  const [state, setState] = useState({
    user: null,
    formData: { nome: '', email: '', telefone: '', currentPassword: '', newPassword: '', confirmPassword: '' },
    loading: true,
    updating: false,
    avatarFile: null,
    avatarPreview: null,
    activeTab: 'info'
  });
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchProfile = async () => {
      setState(s => ({ ...s, loading: true }));
      try {
        const { data } = await api.get('/auth/profile');
        setState({
          user: data,
          formData: {
            nome: data.nome,
            email: data.email,
            telefone: data.telefone || '',
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          },
          avatarPreview: data.avatarUrl,
          loading: false,
          updating: false,
          avatarFile: null,
          activeTab: 'info'
        });
      } catch {
        showNotification('Erro ao carregar perfil', 'error');
        setState(s => ({ ...s, loading: false }));
      }
    };
    fetchProfile();
  }, []);

  const handleAvatarChange = file => {
    setState(s => ({ ...s, avatarFile: file }));
    if (file) {
      const reader = new FileReader();
      reader.onload = e => setState(s => ({ ...s, avatarPreview: e.target.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleInfoUpdate = async () => {
    setState(s => ({ ...s, updating: true }));
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('nome', state.formData.nome);
      formDataToSend.append('telefone', state.formData.telefone);
      if (state.avatarFile) formDataToSend.append('avatar', state.avatarFile);

      await api.put('/auth/profile', formDataToSend, { headers: { 'Content-Type': 'multipart/form-data' } });
      showNotification('Perfil atualizado com sucesso!', 'success');
      fetchProfile();
    } catch (error) {
      showNotification(error.response?.data?.message || 'Erro ao atualizar perfil', 'error');
      setState(s => ({ ...s, updating: false }));
    }
  };

  const handlePasswordUpdate = async () => {
    const { currentPassword, newPassword, confirmPassword } = state.formData;
    if (newPassword !== confirmPassword) {
      showNotification('As senhas não coincidem', 'error');
      return;
    }

    if (!validatePassword(newPassword)) {
      showNotification('A senha deve ter pelo menos 6 caracteres', 'error');
      return;
    }

    setState(s => ({ ...s, updating: true }));
    try {
      await api.put('/auth/password', { currentPassword, newPassword });
      showNotification('Senha atualizada com sucesso!', 'success');
      setState(s => ({
        ...s, 
        formData: { ...s.formData, currentPassword: '', newPassword: '', confirmPassword: '' }
      }));
    } catch (error) {
      showNotification(error.response?.data?.message || 'Erro ao atualizar senha', 'error');
    } finally {
      setState(s => ({ ...s, updating: false }));
    }
  };

  const getRoleColor = role => ({
    admin: 'red',
    advogado: 'blue',
    estagiario: 'yellow',
    cliente: 'green'
  }[role] || 'gray');

  const { user, formData, loading, updating, avatarPreview, activeTab } = state;

  if (loading) return <LoadingOverlay visible overlayBlur={2} />;
  if (!user) return <Alert color="red">Erro ao carregar perfil</Alert>;

  return (
    <Container size="md" py="xl">
      <Title order={2} mb="xl">Meu Perfil</Title>

      <Paper withBorder p="xl" radius="md" pos="relative">
        <LoadingOverlay visible={updating} overlayBlur={2} />

        <Group align="flex-start" spacing="xl">
          <Stack spacing="md" style={{ minWidth: 250 }}>
            <Group position="center">
              <Avatar src={avatarPreview} size={120} radius={120}>
                {user.nome.charAt(0).toUpperCase()}
              </Avatar>
            </Group>

            <FileInput
              label="Alterar foto"
              placeholder="Selecionar imagem"
              accept="image/*"
              icon={<IconUpload size={14} />}
              onChange={handleAvatarChange}
              clearable
            />

            <Divider />

            <Stack spacing="xs">
              <Group spacing="xs">
                <IconShield size={18} />
                <Badge color={getRoleColor(user.role)}>{user.role}</Badge>
              </Group>
              <Group spacing="xs">
                <IconCalendar size={18} />
                <Text size="sm">Membro desde {new Date(user.createdAt).toLocaleDateString('pt-BR')}</Text>
              </Group>
            </Stack>
          </Stack>

          <Stack style={{ flex: 1 }} spacing="xl">
            <Tabs value={activeTab} onTabChange={tab => setState(s => ({ ...s, activeTab: tab }))}>
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
                    onChange={e => setState(s => ({ 
                      ...s, 
                      formData: { ...s.formData, nome: e.target.value } 
                    }))}
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
                    onChange={e => setState(s => ({ 
                      ...s, 
                      formData: { ...s.formData, telefone: e.target.value } 
                    }))}
                    placeholder="(00) 00000-0000"
                  />

                  <Group position="right" mt="md">
                    <Button leftIcon={<IconCheck size={16} />} onClick={handleInfoUpdate}>
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
                    onChange={e => setState(s => ({ 
                      ...s, 
                      formData: { ...s.formData, currentPassword: e.target.value } 
                    }))}
                    required
                  />

                  <PasswordInput
                    label="Nova Senha"
                    icon={<IconLock size={16} />}
                    value={formData.newPassword}
                    onChange={e => setState(s => ({ 
                      ...s, 
                      formData: { ...s.formData, newPassword: e.target.value } 
                    }))}
                    required
                  />

                  <PasswordInput
                    label="Confirmar Nova Senha"
                    icon={<IconLock size={16} />}
                    value={formData.confirmPassword}
                    onChange={e => setState(s => ({ 
                      ...s, 
                      formData: { ...s.formData, confirmPassword: e.target.value } 
                    }))}
                    required
                  />

                  <Group position="right" mt="md">
                    <Button leftIcon={<IconCheck size={16} />} onClick={handlePasswordUpdate}>
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