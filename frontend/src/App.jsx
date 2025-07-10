import { useEffect } from 'react';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { setupNotifications } from '@/services/notificationService';
import theme from './theme';
import AppRouter from '@/routes/AppRouter';

function App() {
  useEffect(() => {
    const disconnect = setupNotifications();
    return () => disconnect();
  }, []);

  return (
    <MantineProvider theme={theme}>
      <Notifications position="top-right" />
      <AppRouter />
    </MantineProvider>
  );
}

export default App;