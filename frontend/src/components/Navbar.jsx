import { Group, Button, Text } from '@mantine/core';
import { Link, useLocation } from 'react-router-dom';

export function Navbar() {
  const location = useLocation();

  // Define os links e suas rotas
  const links = [
    { path: '/', label: 'Home' },
    { path: '/login', label: 'Login' }
  ];

  return (
    <Group justify="space-between" p="md" bg="ufmt-green.6" c="white">
      <Text size="xl" fw={700}>Sistema NPJ - UFMT</Text>
      <Group gap="sm">
        {links.map((link) => (
          <Button
            key={link.path}
            component={Link}
            to={link.path}
            variant={location.pathname === link.path ? 'filled' : 'outline'}
            color="white"
          >
            {link.label}
          </Button>
        ))}
      </Group>
    </Group>
  );
}