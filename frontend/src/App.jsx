import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import Layout from '@/components/layout/layout';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import { setupNotifications } from '@/services/notificationService';
import theme from './theme';
import {
  LoginPage,
  RegisterPage,
  DashboardPage,
  ProcessList,
  ProcessDetail,
  FileUpload,
  UserList,
  ProfilePage
} from '@/pages';

function App() {
  useEffect(() => {
    const disconnect = setupNotifications();
    return () => disconnect();
  }, []);

  return (
    <MantineProvider theme={theme}>
      <Notifications position="top-right" />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registrar" element={<RegisterPage />} />
        
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route index element={<DashboardPage />} />
            <Route path="/processos">
              <Route index element={<ProcessList />} />
              <Route path=":id" element={<ProcessDetail />} />
            </Route>
            <Route path="/arquivos" element={<FileUpload />} />
            <Route path="/usuarios" element={<UserList />} />
            <Route path="/perfil" element={<ProfilePage />} />
          </Route>
        </Route>
      </Routes>
    </MantineProvider>
  );
}

export default App;