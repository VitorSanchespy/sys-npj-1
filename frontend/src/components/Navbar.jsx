import { Group, Text, NavLink } from '@mantine/core';
import { Link, useLocation } from 'react-router-dom';
import { isAuthenticated } from '@/utils/auth';
import { IconHome, IconLogin, IconLogout } from '@tabler/icons-react';

export function Navbar() {
  const location = useLocation();
  const isLoggedIn = isAuthenticated();

  // Links de navegação
  const links = [
    { path: '/', label: 'Home', icon: <IconHome size={18} /> },
    !isLoggedIn 
      ? { path: '/login', label: 'Login', icon: <IconLogin size={18} /> }
      : { path: '/logout', label: 'Sair', icon: <IconLogout size={18} /> }
  ];

  return (
    <Group justify="space-between" p="md" bg="ufmt-green.6" c="white">
      <Text size="xl" fw={700} truncate>
        Sistema NPJ - UFMT
      </Text>
      
      <Group gap={0}>
        {links.map((link) => (
          <NavLink
            key={link.path}
            component={Link}
            to={link.path}
            label={link.label}
            leftSection={link.icon}
            active={location.pathname === link.path}
            variant="subtle"
            color="white"
            style={{ borderRadius: 'var(--mantine-radius-md)' }}
          />
        ))}
      </Group>
    </Group>
  );
}