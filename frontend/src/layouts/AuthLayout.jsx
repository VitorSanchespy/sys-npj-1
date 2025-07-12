import { Outlet } from 'react-router-dom';
import { Box } from '@mantine/core';

export function AuthLayout() {
  return (
    <Box style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #e6f0ff, #f8f9fa)',
      padding: '1rem'
    }}>
      <Outlet />
    </Box>
  );
}

export default AuthLayout;