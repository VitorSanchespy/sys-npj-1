import { AppShell, Group, Button, Text, Image, NavLink } from '@mantine/core';
import { Link, useNavigate } from 'react-router-dom';
import { 
  IconLogout, 
  IconDashboard, 
  IconFiles, 
  IconUsers, 
  IconUser 
} from '@tabler/icons-react';
import { useAuth } from '@/hooks/useAuth'; // Adicionar import

export default function Layout({ children }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/dashboard', icon: <IconDashboard size={18} />, label: 'Dashboard' },
    { to: '/processos', icon: <IconFiles size={18} />, label: 'Processos Jurídicos' },
    { to: '/arquivos', icon: <IconFiles size={18} />, label: 'Documentos' },
    { to: '/perfil', icon: <IconUser size={18} />, label: 'Meu Perfil' },
  ];

  if (user.role === 'admin') {
    navLinks.push({ 
      to: '/usuarios', 
      icon: <IconUsers size={18} />, 
      label: 'Gestão de Usuários' 
    });
  }

  return (
    <AppShell
      padding="md"
      navbar={{
        width: 280,
        breakpoint: 'sm',
      }}
      header={{ height: 60 }}
    >
      <AppShell.Header bg="ufmt-green.6" c="white">
        <Group justify="space-between" h="100%" px="md">
          <Text size="xl" fw={700} truncate>
            Sistema NPJ - Núcleo de Práticas Jurídicas
          </Text>
          <Text truncate>Bem-vindo, {user.nome || 'Usuário'}</Text>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="xs" bg="ufmt-green.6">
        <AppShell.Section p="sm">
          <Group justify="center">
            <Image 
              src="/ufmt-logo.png" 
              alt="UFMT Logo" 
              width={150}
            />
          </Group>
        </AppShell.Section>

        <AppShell.Section grow mt="md">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              component={Link}
              to={link.to}
              label={link.label}
              leftSection={link.icon}
              variant="subtle"
              color="white"
              active={location.pathname === link.to}
              styles={{
                root: {
                  borderRadius: 'var(--mantine-radius-md)',
                  marginBottom: 'var(--mantine-spacing-xs)',
                },
                body: {
                  color: 'white',
                  fontWeight: 500,
                }
              }}
            />
          ))}
        </AppShell.Section>

        <AppShell.Section>
          <Button
            leftSection={<IconLogout size={18} />}
            variant="light"
            color="red"
            fullWidth
            onClick={handleLogout}
          >
            Sair do Sistema
          </Button>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>
        {children}
      </AppShell.Main>
    </AppShell>
  );
}