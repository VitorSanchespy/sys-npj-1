// src/pages/auth/LogoutPage.jsx
import { useEffect } from 'react';
import { Center, Loader } from '@mantine/core';
import { logout } from '@/utils/auth';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { IconLogout } from '@tabler/icons-react';

export default function LogoutPage() {
  const navigate = useNavigate();
  
  useEffect(() => {
    const performLogout = async () => {
      try {
        // Tentar fazer logout na API
        await api.post('/auth/logout');
      } catch (error) {
        console.error('Erro no logout:', error);
      } finally {
        // Sempre limpa a sessão local
        logout();
        
        notifications.show({
          title: 'Sessão encerrada',
          message: 'Você foi desconectado com sucesso',
          color: 'blue',
          icon: <IconLogout size={18} />,
        });
        
        navigate('/login');
      }
    };

    performLogout();
  }, []);
  
  return (
    <Center h="100vh">
      <Loader size="xl" variant="dots" />
    </Center>
  );
}