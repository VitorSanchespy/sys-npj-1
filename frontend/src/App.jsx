import { Routes, Route } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { NotificationProvider } from './contexts/NotificationContext';
import theme from '../theme';
import {
  LoginPage,
  RegisterPage,
  DashboardPage,
  ProcessList,
  ProcessDetail,
  FileUpload,
  UserList,
  ProfilePage
} from './pages';

const AppRoutes = () => (
  <Routes>
    {/* Rotas públicas */}
    <Route path="/login" element={<LoginPage />} />
    <Route path="/registrar" element={<RegisterPage />} />
    
    {/* Rotas protegidas */}
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
);

function App() {
  return (
    <NotificationProvider>
      <MantineProvider theme={theme}>
        <AppRoutes />
      </MantineProvider>
    </NotificationProvider>
  );
}

export default App;