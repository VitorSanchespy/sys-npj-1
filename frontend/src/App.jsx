import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './hooks/useQueryClient';
import { ToastProvider } from './contexts/ToastContext';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import AppRouter from './routes/AppRouter';
import NotificationToast from './components/notifications/NotificationToast';
import AutoRefreshIndicator from './components/common/AutoRefreshIndicator';
import { useAutoRefresh } from './hooks/useAutoRefresh';
import LoginDebugComponent from './components/debug/LoginDebugComponent';

// Componente interno para usar hooks
function AppContent() {
  const { manualRefresh, isActive } = useAutoRefresh(30000);
  
  return (
    <>
      <AppRouter />
      <NotificationToast />
      {/* Indicador de auto-refresh global */}
      <AutoRefreshIndicator 
        isActive={isActive}
        interval={30000}
        onForceRefresh={manualRefresh}
      />
      {/* DevTools apenas em desenvolvimento */}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      {/* Monitor de Performance */}
      {/* <PerformanceMonitor /> */}
    </>
  );
}

function App() {
  // Renderizar apenas o debug se estiver em modo de desenvolvimento
  if (import.meta.env.DEV && window.location.search.includes('debug=login')) {
    return <LoginDebugComponent />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <NotificationProvider>
            <AppContent />
          </NotificationProvider>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;