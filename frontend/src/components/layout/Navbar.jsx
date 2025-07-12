import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Box, 
  Stack, 
  NavLink as MantineNavLink, 
  Tooltip,
  Transition,
  ActionIcon,
  Text
} from '@mantine/core';
import SafeText from '@/components/ui/SafeText';
import { 
  IconHome, 
  IconFileText, 
  IconUsers,
  IconSettings,
  IconFolder,
  IconScale,
  IconMenu2,
  IconX
} from '@tabler/icons-react';

export function Navbar() {
  const [expanded, setExpanded] = useState(true);
  const [activeHover, setActiveHover] = useState(null);

  const navItems = [
    { label: 'Dashboard', icon: <IconHome size={20} />, path: '/' },
    { label: 'Processos', icon: <IconFileText size={20} />, path: '/processos' },
    { label: 'Clientes', icon: <IconUsers size={20} />, path: '/clientes' },
    { label: 'Arquivos', icon: <IconFolder size={20} />, path: '/arquivos' },
    { label: 'Jurisprudência', icon: <IconScale size={20} />, path: '/jurisprudencia' },
    { label: 'Configurações', icon: <IconSettings size={20} />, path: '/configuracoes' },
  ];

  const toggleNavbar = () => setExpanded(!expanded);

  return (
    <Box
      style={{
        width: expanded ? 250 : 70,
        backgroundColor: 'white',
        borderRight: '1px solid #e9ecef',
        height: '100vh',
        position: 'sticky',
        top: 0,
        transition: 'all 0.3s ease',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
        zIndex: 100
      }}
    >
      <Box 
        p="md" 
        style={{ 
          borderBottom: '1px solid #e9ecef',
          backgroundColor: '#f8f9fa',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Transition 
          mounted={expanded} 
          transition="slide-right" 
          duration={300}
        >
          {(styles) => (
            <SafeText fw={700} style={{ ...styles, color: '#003366' }}>
              Menu de Navegação
            </SafeText>
          )}
        </Transition>
        
        <ActionIcon 
          onClick={toggleNavbar}
          variant="light"
          color="#003366"
          size="md"
        >
          {expanded ? <IconX size={18} /> : <IconMenu2 size={18} />}
        </ActionIcon>
      </Box>
      
      <Stack p="md" gap={5}>
        {navItems.map((item) => (
          <Tooltip
            key={item.path}
            label={item.label}
            position="right"
            disabled={expanded}
            transitionProps={{ transition: 'slide-right', duration: 300 }}
            withArrow
            arrowSize={6}
            color="#003366"
          >
            <MantineNavLink
              component={NavLink}
              to={item.path}
              icon={item.icon}
              onMouseEnter={() => setActiveHover(item.path)}
              onMouseLeave={() => setActiveHover(null)}
              style={({ isActive }) => ({ 
                borderRadius: 8,
                color: isActive ? '#0066CC' : '#333',
                backgroundColor: isActive ? '#e6f0ff' : 
                             activeHover === item.path ? '#f1f5ff' : 'transparent',
                fontWeight: isActive ? 600 : 500,
                borderLeft: isActive ? '3px solid #0066CC' : 'none',
                height: 45,
                transition: 'all 0.2s ease',
                overflow: 'hidden',
                '&:hover': {
                  transform: 'translateX(2px)'
                }
              })}
            >
              <Transition 
                mounted={expanded} 
                transition="fade" 
                duration={200}
              >
                {(styles) => (
                  <span style={styles}>{item.label}</span>
                )}
              </Transition>
            </MantineNavLink>
          </Tooltip>
        ))}
      </Stack>
      
      <Box 
        p="md" 
        mt="auto"
        style={{ 
          borderTop: '1px solid #e9ecef',
          backgroundColor: '#f8f9fa',
          overflow: 'hidden'
        }}
      >
        <Transition 
          mounted={expanded} 
          transition="fade" 
          duration={300}
        >
          {(styles) => (
            <>
              <SafeText size="sm" style={{ ...styles, color: '#666' }}>
                Universidade Federal de Mato Grosso
              </SafeText>
              <SafeText size="xs" style={{ ...styles, color: '#666' }}>
                Núcleo de Práticas Jurídicas
              </SafeText>
            </>
          )}
        </Transition>
      </Box>
    </Box>
  );
}
export default Navbar;
