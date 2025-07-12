import { Box } from '@mantine/core';
import Header from '@/components/layout/Header';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Outlet } from 'react-router-dom';

export default function MainLayout() {
  return (
    <Box style={{ display: 'flex', minHeight: '100vh', background: '#e7f1f8' }}>
      <Navbar />
      <Box style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header />
        <Box p="xl" style={{ flex: 1, minHeight: 0 }}>
          <Outlet />
        </Box>
        <Footer />
      </Box>
    </Box>
  );
}