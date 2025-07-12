import { Outlet } from 'react-router-dom'; // Importação única
import Header from '@/components/layout/Header';
import Navbar from '@/components/layout/Navbar';
import { Box } from '@mantine/core';
import SafeText from '@/components/ui/SafeText';

export function MainLayout() {
  return (
    <Box style={{ 
      display: 'flex', 
      minHeight: '100vh',
      backgroundColor: '#f8f9fa'
    }}>
      <Navbar />
      <Box style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header />
        <Box p="xl" style={{ flex: 1 }}>
          <Outlet /> {/* Componente para renderizar rotas aninhadas */}
        </Box>
        
        <Box 
          p="md" 
          style={{ 
            backgroundColor: '#003366', 
            color: 'white',
            textAlign: 'center'
          }}
        >
          <SafeText size="sm">Sistema NPJ • Universidade Federal de Mato Grosso</SafeText>
          <SafeText size="xs">© {new Date().getFullYear()} - Todos os direitos reservados</SafeText>
        </Box>
      </Box>
    </Box>
  );
}
export default MainLayout;
