// src/routes/AppRouter.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

// Layouts
import MainLayout from '@/layouts/MainLayout';
import AuthLayout from '@/layouts/AuthLayout';

// Pages
import LoginPage from '@/pages/auth/LoginPage';
import DashboardPage from '@/pages/dashboard/DashboardPage';
import ProcessesPage from '@/pages/dashboard/processes/ProcessesPage';

const PrivateRoute = ({ element }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) return <div>Carregando...</div>;
  return isAuthenticated ? element : <Navigate to="/login" />;
};

const AppRouter = () => {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>
      
      <Route element={<MainLayout />}>
        <Route path="/" element={<PrivateRoute element={<DashboardPage />} />} />
        <Route path="/processos" element={<PrivateRoute element={<ProcessesPage />} />} />
        {/* Outras rotas protegidas */}
      </Route>
      
      <Route path="*" element={<div>Página não encontrada</div>} />
    </Routes>
  );
};

export default AppRouter;