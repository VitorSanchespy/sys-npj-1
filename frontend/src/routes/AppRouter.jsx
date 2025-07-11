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

const AuthRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <Loader size="xl" variant="dots" />;
  return user ? <Navigate to="/" replace /> : children;
};

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <Loader size="xl" variant="dots" />;
  return user ? children : <Navigate to="/login" replace />;
};

const AppRouter = () => {
  return (
    <Routes>
      {/* Rotas públicas */}
      <Route element={<AuthLayout />}>
        <Route 
          path="/login" 
          element={
            <AuthRoute>
              <LoginPage />
            </AuthRoute>
          } 
        />
        <Route 
          path="/registrar" 
          element={
            <AuthRoute>
              <RegisterPage />
            </AuthRoute>
          } 
        />
      </Route>

      {/* Rotas protegidas */}
      <Route element={<MainLayout />}>
        <Route 
          index 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/processos" 
          element={
            <ProtectedRoute>
              <ProcessList />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/processos/:id" 
          element={
            <ProtectedRoute>
              <ProcessDetail />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/arquivos" 
          element={
            <ProtectedRoute>
              <FilesPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/usuarios" 
          element={
            <ProtectedRoute>
              <UserList />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/perfil" 
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } 
        />
      </Route>

      {/* Rota 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRouter;