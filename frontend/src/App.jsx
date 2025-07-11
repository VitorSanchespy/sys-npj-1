import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import AppRouter from '@/routes/AppRouter';
import theme from './theme';

function App() {
  return (
    <MantineProvider theme={theme}>
      <Notifications position="top-right" />
      <AppRouter />
    </MantineProvider>
  );
}

export default App;