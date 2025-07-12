import { Box, Menu, Avatar, Group } from '@mantine/core'; // Importação única
import { IconLogout, IconUser, IconSettings } from '@tabler/icons-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import SafeText from '@/components/ui/SafeText';

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box
      px="md"
      style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e9ecef',
        height: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
    >
      <Group>
        <SafeText fw={700} size="lg" style={{ color: '#003366' }}>
          Sistema NPJ - UFMT
        </SafeText>
      </Group>

      <Group>
        <Menu position="bottom-end" withArrow>
          <Menu.Target>
            <Group style={{ cursor: 'pointer' }}>
              <Avatar 
                color="#003366" 
                radius="xl"
                src={user?.avatar}
              >
                {user?.nome?.charAt(0) || 'U'}
              </Avatar>
              <SafeText fw={500} style={{ color: '#003366' }}>
                {user?.nome || 'Usuário'}
              </SafeText>
            </Group>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Label>Conta</Menu.Label>
            <Menu.Item 
              leftSection={<IconUser size={16} />}
              onClick={() => navigate('/perfil')}
            >
              Meu Perfil
            </Menu.Item>
            <Menu.Item 
              leftSection={<IconSettings size={16} />}
              onClick={() => navigate('/configuracoes')}
            >
              Configurações
            </Menu.Item>
            
            <Menu.Divider />
            
            <Menu.Item 
              leftSection={<IconLogout size={16} />}
              onClick={handleLogout}
              style={{ color: '#cc0000' }}
            >
              Sair do Sistema
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </Box>
  );
}
export default Header;
