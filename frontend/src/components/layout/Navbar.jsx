import { Box, Stack, Tooltip, UnstyledButton } from '@mantine/core';
import { IconHome, IconFolder, IconUsers, IconSettings, IconFileText, IconScale, IconGavel } from '@tabler/icons-react';
import { useLocation, NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { label: 'Início', icon: IconHome, path: '/' },
  { label: 'Processos', icon: IconScale, path: '/processos' },
  { label: 'Documentos', icon: IconFileText, path: '/documentos' },
  { label: 'Pessoas', icon: IconUsers, path: '/pessoas' },
  { label: 'Julgamentos', icon: IconGavel, path: '/julgamentos' },
  { label: 'Configurações', icon: IconSettings, path: '/configuracoes' },
];

export default function Navbar() {
  const location = useLocation();

  return (
    <Box
      style={{
        width: 86,
        background: '#fff',
        borderRight: '2.5px solid #00336633',
        minHeight: '100vh',
        boxShadow: '2px 0 15px 0 #00336609',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 30,
        gap: 24,
      }}
    >
      <Stack gap={10}>
        {NAV_ITEMS.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Tooltip label={item.label} position="right" withArrow key={item.path}>
              <NavLink to={item.path} style={{ textDecoration: 'none' }}>
                <UnstyledButton
                  style={{
                    background: active ? '#003366' : 'transparent',
                    borderRadius: 12,
                    padding: 12,
                    marginBottom: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: active ? '0 2px 10px #00336622' : 'none',
                    border: active ? '2px solid #ffd700' : '2px solid transparent',
                    transition: 'all .15s',
                  }}
                >
                  <item.icon size={32} color={active ? "#ffd700" : "#003366"} stroke={1.8} />
                </UnstyledButton>
              </NavLink>
            </Tooltip>
          );
        })}
      </Stack>
    </Box>
  );
}