import { AppShell, Group, Text, Button, Avatar } from '@mantine/core';
import { IconLogout } from '@tabler/icons-react';
import { useAuth } from '@/hooks/useAuth';

export function Header() {
  const { user, logout } = useAuth();

  return (
    <AppShell.Header p="md">
      <Group justify="space-between">
        <Text fw={700} size="xl">Sistema NPJ</Text>
        
        {user && (
          <Group>
            <Avatar src={user.avatar} alt={user.name} radius="xl" />
            <Text fw={500}>{user.name}</Text>
            <Button
              variant="subtle"
              leftSection={<IconLogout size={18} />}
              onClick={logout}
            >
              Sair
            </Button>
          </Group>
        )}
      </Group>
    </AppShell.Header>
  );
}
export default Header;