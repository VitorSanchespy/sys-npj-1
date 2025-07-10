// src/components/Header.jsx
import { AppShell, Group, Text, Button, Avatar } from '@mantine/core';
import { IconLogout } from '@tabler/icons-react';
import api from '@/api/apiService';
import { useAuth } from '@/hooks/useAuth';
//import { getCurrentUser, logout } from '@/utils/auth';

export default function Header() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      logout();
    }
  };

  return (
    <AppShell.Header p="md">
      <Group justify="space-between">
        <Group>
          <Text fw={700} size="xl">
            Sistema NPJ
          </Text>
        </Group>

        {user && (
          <Group>
            <Avatar 
              src={user.avatar} 
              alt={user.name} 
              radius="xl"
            />
            <Text fw={500}>{user.name}</Text>
            <Button
              variant="subtle"
              leftSection={<IconLogout size={18} />}
              onClick={handleLogout}
            >
              Sair
            </Button>
          </Group>
        )}
      </Group>
    </AppShell.Header>
  );
}