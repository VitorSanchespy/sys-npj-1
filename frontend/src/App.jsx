import React from "react";
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { ToastProvider } from "./contexts/ToastContext";
import AppRouter from "@/routes/AppRouter";
import { queryClient } from "./hooks/useQueryClient";
import NotificationToast from "./components/notifications/NotificationToast";
import LoginDebugComponent from "./components/debug/LoginDebugComponent";

// Debug tools apenas em desenvolvimento
if (import.meta.env.DEV) {
  import('./utils/apiTester.js');
  import('./utils/frontendInitializer.js');
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
            <AppRouter />
            <NotificationToast />
            {/* DevTools apenas em desenvolvimento */}
            {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
            {/* Monitor de Performance */}
            {/* <PerformanceMonitor /> */}
          </NotificationProvider>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;