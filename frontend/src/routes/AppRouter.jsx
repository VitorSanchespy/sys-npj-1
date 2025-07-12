import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/layouts/MainLayout';
import AuthLayout from '@/layouts/AuthLayout';
import LoginPage from '@/pages/auth/LoginPage';
import LogoutPage from '@/pages/auth/LogoutPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';
import DashboardPage from '@/pages/dashboard/DashboardPage';
import ProcessList from '@/pages/dashboard/processes/ProcessList';
import FilesPage from '@/pages/dashboard/files/FilesPage';
import ProfilePage from '@/pages/dashboard/ProfilePage';
import UserList from '@/pages/dashboard/users/UserList';
import NotFoundPage from '@/pages/NotFoundPage';
import { Loader, Center } from '@mantine/core';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <Center h="100vh">
        <Loader size="xl" variant="dots" color="#0066CC" />
      </Center>
    );
  }
  
  return user ? children : <Navigate to="/login" replace />;
};

const AuthRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <Center h="100vh">
        <Loader size="xl" variant="dots" color="#0066CC" />
      </Center>
    );
  }
  
  return !user ? children : <Navigate to="/" replace />;
};

function AppRouter() {
  return (
    <Routes>
      {/* Rotas de autenticação (layout diferente) */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={
          <AuthRoute>
            <LoginPage />
          </AuthRoute>
        } />
        
        <Route path="/register" element={
          <AuthRoute>
            <RegisterPage />
          </AuthRoute>
        } />
        
        <Route path="/reset-password" element={
          <AuthRoute>
            <ResetPasswordPage />
          </AuthRoute>
        } />
        
        <Route path="/logout" element={<LogoutPage />} />
      </Route>

      {/* Rotas protegidas (layout principal) */}
      <Route element={<MainLayout />}>
        <Route index element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />
        
        <Route path="/processos" element={
          <ProtectedRoute>
            <ProcessList />
          </ProtectedRoute>
        } />
        
        <Route path="/arquivos" element={
          <ProtectedRoute>
            <FilesPage />
          </ProtectedRoute>
        } />
        
        <Route path="/usuarios" element={
          <ProtectedRoute>
            <UserList />
          </ProtectedRoute>
        } />
        
        <Route path="/perfil" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        
        {/* Rotas de detalhes devem vir depois */}
        <Route path="/processos/:id" element={
          <ProtectedRoute>
            {/* <ProcessDetail /> */}
          </ProtectedRoute>
        } />
      </Route>

      {/* Rota para página não encontrada */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
export default AppRouter;