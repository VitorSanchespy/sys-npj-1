import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import AppRouter from '@/routes/AppRouter';
import theme from './theme';
import { AuthProvider } from '@/contexts/AuthContext';
import { Suspense } from 'react';
import { Loader } from '@mantine/core';
import ErrorBoundary from '@/components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
    <MantineProvider theme={theme}>
      <AuthProvider>
        <Notifications position="top-right" />
        <Suspense fallback={<Loader size="xl" variant="dots" style={{ position: 'fixed', top: '50%', left: '50%' }} />}>
          <AppRouter />
        </Suspense>
      </AuthProvider>
    </MantineProvider>
    </ErrorBoundary>
  );
}
export default App;