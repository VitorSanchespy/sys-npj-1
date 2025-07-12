import { Outlet } from 'react-router-dom';
import { Box } from '@mantine/core';

export function AuthLayout() {
  return (
    <Box style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f8f9fa, #e6f0ff)',
      padding: '1rem'
    }}>
      <Outlet />
    </Box>
  );
}

export default AuthLayout