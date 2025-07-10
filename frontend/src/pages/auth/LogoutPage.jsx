import { useEffect } from 'react';
import { Center, Loader } from '@mantine/core';
import { logout } from '@/utils/auth';
import { useNavigate } from 'react-router-dom';
import api from '@/api/apiService';

export function LogoutPage() {
  const navigate = useNavigate();
  
  useEffect(() => {
    const performLogout = async () => {
      try {
        await api.post('/auth/logout');
      } catch (error) {
        console.error('Erro no logout:', error);
      } finally {
        logout();
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

export default LogoutPage;