import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Box,
  UnstyledButton,
  Stack,
  Group,
  Tooltip,
  Avatar,
  Text,
  rem,
  Divider,
} from '@mantine/core';
import {
  IconHome,
  IconFileText,
  IconUsers,
  IconSettings,
  IconFolder,
  IconScale,
  IconMenu2,
  IconLogout,
  IconChevronLeft,
  IconChevronRight,
} from '@tabler/icons-react';
import { useAuth } from '@/contexts/AuthContext';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: <IconHome size={22} />, path: '/' },
  { label: 'Processos', icon: <IconScale size={22} />, path: '/processos' },
  { label: 'Documentos', icon: <IconFolder size={22} />, path: '/arquivos' },
  { label: 'Usuários', icon: <IconUsers size={22} />, path: '/usuarios', admin: true },
  { label: 'Configurações', icon: <IconSettings size={22} />, path: '/configuracoes' },
];

export default function Navbar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const isAdmin = user?.role === 'admin';

  return (
    <Box
      style={{
        width: collapsed ? 72 : 240,
        background: '#fff',
        minHeight: '100vh',
        borderRight: '1.5px solid #e0e6ed',
        position: 'sticky',
        top: 0,
        boxShadow: '0 1px 14px rgba(0,0,0,0.04)',
        transition: 'width 0.25s cubic-bezier(.4,2,.3,1)',
        zIndex: 100,
        paddingTop: rem(24),
        paddingBottom: rem(16),
        display: 'flex',
        flexDirection: 'column',
      }}
    >

      {/* Top: Logo e botão de colapsar */}
      <Group px="md" mb="lg" justify="space-between">
        {!collapsed && (
          <Text
            fw={800}
            size="lg"
            style={{
              color: '#003366',
              fontFamily: 'Georgia, serif',
              letterSpacing: 1,
              textTransform: 'uppercase',
              fontSize: rem(22),
            }}
          >
            NPJ UFMT
          </Text>
        )}
        <UnstyledButton
          onClick={() => setCollapsed((c) => !c)}
          style={{
            background: 'none',
            border: 'none',
            padding: 6,
            borderRadius: 6,
            color: '#003366',
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
        >
          {collapsed
            ? <IconChevronRight size={22} />
            : <IconChevronLeft size={22} />
          }
        </UnstyledButton>
      </Group>

      <Divider mb="sm" />

      {/* Menu */}
      <Stack gap={2} flex={1}>
        {NAV_ITEMS.filter(item => (item.admin ? isAdmin : true)).map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Tooltip
              key={item.path}
              label={item.label}
              position="right"
              disabled={!collapsed}
              transitionProps={{ transition: 'slide-right', duration: 200 }}
              withArrow
              arrowSize={6}
              offset={2}
              color="#003366"
            >
              <NavLink
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: collapsed ? '11px 10px' : '11px 18px',
                  borderRadius: 8,
                  textDecoration: 'none',
                  color: isActive ? '#003366' : '#3a4352',
                  background: isActive
                    ? 'rgba(0, 102, 204, 0.08)'
                    : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: rem(16),
                  letterSpacing: 0.2,
                  marginBottom: 2,
                  boxShadow: isActive ? '0 2px 6px rgba(0,102,204,0.07)' : 'none',
                  borderLeft: isActive ? '4px solid #003366' : '4px solid transparent',
                  transition: 'all 0.14s',
                }}
              >
                {item.icon}
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            </Tooltip>
          );
        })}
      </Stack>

      <Divider mt="sm" mb={!collapsed ? "sm" : 0} />

      {/* User e logout */}
      <Box mt="auto" px={collapsed ? 0 : "md"}>
        <Group gap="xs" mb={collapsed ? 0 : "xs"} align="center" justify={collapsed ? "center" : "flex-start"}>
          <Avatar
            radius="xl"
            src={user?.avatar}
            size={collapsed ? 36 : 44}
            color="blue"
            style={{
              border: '2px solid #003366',
              backgroundColor: '#e6f0ff',
            }}
          >
            {user?.nome?.[0]?.toUpperCase() || 'U'}
          </Avatar>
          {!collapsed && (
            <Box>
              <Text fw={600} size="sm" c="#003366" truncate>
                {user?.nome || 'Usuário'}
              </Text>
              <Text size="xs" c="dimmed">{user?.role?.toUpperCase() || ''}</Text>
            </Box>
          )}
        </Group>
        <UnstyledButton
          onClick={logout}
          w="100%"
          mt={collapsed ? 12 : 6}
          px={collapsed ? 0 : 10}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            color: '#cc0000',
            background: 'none',
            border: 'none',
            borderRadius: 8,
            fontWeight: 600,
            fontSize: rem(15),
            padding: collapsed ? '10px 0' : '10px 8px',
            transition: 'background 0.2s',
            cursor: 'pointer',
            marginTop: 12,
          }}
        >
          <IconLogout size={21} />
          {!collapsed && <span>Sair</span>}
        </UnstyledButton>
        {!collapsed && (
          <Text c="dimmed" size="xs" ta="center" mt={10}>
            Universidade Federal de Mato Grosso
          </Text>
        )}
      </Box>
    </Box>
  );
}