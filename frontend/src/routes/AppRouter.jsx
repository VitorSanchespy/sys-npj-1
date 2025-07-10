import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader } from '@mantine/core';

// Layouts
import MainLayout from '@/layouts/MainLayout';
import AuthLayout from '@/layouts/AuthLayout';

// Pages
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import DashboardPage from '@/pages/dashboard/DashboardPage';
import ProcessList from '@/pages/dashboard/processes/ProcessList';
import ProcessDetail from '@/pages/dashboard/processes/ProcessDetail';
import UserList from '@/pages/dashboard/users/UserList';
import FilesPage from '@/pages/dashboard/files/FilesPage';
import ProfilePage from '@/pages/dashboard/ProfilePage';
import NotFoundPage from '@/pages/NotFoundPage';

const AuthRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return <Loader size="xl" variant="dots" />;

  return user ? <Navigate to="/" replace /> : <Outlet />;
};

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return <Loader size="xl" variant="dots" />;

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

const AppRouter = () => {
  return (
    <Routes>
      {/* Rotas públicas */}
      <Route element={<AuthLayout />}>
        <Route element={<AuthRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registrar" element={<RegisterPage />} />
        </Route>
      </Route>

      {/* Rotas protegidas */}
      <Route element={<MainLayout />}>
        <Route element={<ProtectedRoute />}>
          <Route index element={<DashboardPage />} />
          <Route path="/processos">
            <Route index element={<ProcessList />} />
            <Route path=":id" element={<ProcessDetail />} />
          </Route>
          <Route path="/arquivos" element={<FilesPage />} />
          <Route path="/usuarios" element={<UserList />} />
          <Route path="/perfil" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* Rota 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRouter;