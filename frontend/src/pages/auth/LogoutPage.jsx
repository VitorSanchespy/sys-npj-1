import { useEffect } from 'react';
import { Center, Loader } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/api/apiService';

export function LogoutPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();

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
    <Center h="100vh" style={{ background: 'linear-gradient(135deg, #f8f9fa, #e6f0ff)' }}>
      <Loader size="xl" variant="dots" color="#003366" />
      <Text ml="md" style={{ color: '#003366' }}>Saindo do sistema...</Text>
    </Center>
  );
}

export default LogoutPage;
