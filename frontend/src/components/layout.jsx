import { AppShell } from '@mantine/core'; // Importação principal
import { 
  AppShellNavbar, 
  AppShellHeader, 
  Group, 
  Button, 
  Text, 
  Image 
} from '@mantine/core';
import { Link, useNavigate } from 'react-router-dom';
import { IconLogout, IconDashboard, IconFiles, IconUsers, IconUser } from '@tabler/icons-react';

export default function Layout({ children }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || {};

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const NavLink = ({ to, icon, label }) => (
    <Button
      component={Link}
      to={to}
      variant="subtle"
      color="ufmt-green"
      fullWidth
      leftIcon={icon}
      styles={{ inner: { justifyContent: 'flex-start' } }}
    >
      {label}
    </Button>
  );

  return (
    <AppShell
      padding="md"
      navbar={
        <AppShellNavbar width={{ base: 280 }} p="xs" bg="ufmt-green.6">
          <AppShellNavbar.Section p="sm">
            <Group justify="center">
              <Image 
                src="/ufmt-logo.png" 
                alt="UFMT Logo" 
                width={150}
                withPlaceholder
              />
            </Group>
          </AppShellNavbar.Section>
          <AppShellNavbar.Section grow mt="md">
            <NavLink to="/dashboard" icon={<IconDashboard size={18} />} label="Dashboard" />
            <NavLink to="/processos" icon={<IconFiles size={18} />} label="Processos Jurídicos" />
            <NavLink to="/arquivos" icon={<IconFiles size={18} />} label="Documentos" />
            <NavLink to="/perfil" icon={<IconUser size={18} />} label="Meu Perfil" />
            {user.role === 'admin' && (
              <NavLink to="/usuarios" icon={<IconUsers size={18} />} label="Gestão de Usuários" />
            )}
          </AppShellNavbar.Section>
          <AppShellNavbar.Section>
            <Button
              leftIcon={<IconLogout size={18} />}
              variant="light"
              color="red"
              fullWidth
              onClick={logout}
            >
              Sair do Sistema
            </Button>
          </AppShellNavbar.Section>
        </AppShellNavbar>
      }
      header={
        <AppShellHeader p="xs" bg="ufmt-green.6" c="white">
          <Group justify="space-between">
            <Text size="xl" fw={700}>
              Sistema NPJ - Núcleo de Práticas Jurídicas
            </Text>
            <Text>Bem-vindo, {user.nome || 'Usuário'}</Text>
          </Group>
        </AppShellHeader>
      }
    >
      {children}
    </AppShell>
  );
}