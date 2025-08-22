import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AgendamentoCreatePage from "@/pages/agendamentos/AgendamentoCreatePage";
import AgendamentoEditPage from "@/pages/agendamentos/AgendamentoEditPage";
import AgendamentoDetailPage from "@/pages/agendamentos/AgendamentoDetailPage";
import { useAuthContext } from "@/contexts/AuthContext";
import MainLayout from "@/components/layout/MainLayout";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import FullRegisterPage from "@/pages/auth/FullRegisterPage";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import HomePage from "@/pages/HomePage";
import ProfilePage from "@/pages/dashboard/ProfilePage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";
import ProcessListPage from "@/pages/dashboard/ProcessListPage";
import ProcessDetailPage from "../pages/dashboard/ProcessDetailPage";
import ProcessFormPage from "@/pages/dashboard/ProcessFormPage";
import ProcessEditPage from "../pages/dashboard/ProcessEditPage";
import ProcessAssignStudentPage from "@/pages/dashboard/ProcessAssignStudentPage";
import ProcessUpdatesPage from "@/pages/dashboard/ProcessUpdatePage";
import UserListPage from "@/pages/dashboard/UserListPage";
import UserDetailPage from "@/pages/dashboard/UserDetailPage";
import UserEditPage from "@/pages/dashboard/UserEditPage";
import ArquivosPage from "@/pages/dashboard/ArquivosPage";
import AgendamentosPage from "@/pages/agendamentos/AgendamentosPage";
import ConviteAgendamento from "@/components/agendamentos/ConviteAgendamento";
import AceitarConvitePage from "@/pages/convite/AceitarConvitePage";
import RecusarConvitePage from "@/pages/convite/RecusarConvitePage";
import ConviteVisualizacao from "@/pages/convite/ConviteVisualizacao";
import NotFoundPage from "@/pages/NotFoundPage";
// import GoogleCallbackPage from "../pages/GoogleCallbackPage";
// import TesteAPI from "@/components/TesteAPI";
import { hasRole } from "@/utils/permissions";

// Componente de rota privada - controla acesso baseado em autenticação e papéis
function PrivateRoute({ children, roles }) {
  const { isAuthenticated, user, loading } = useAuthContext();
  
  // Exibe loading enquanto verifica autenticação
  if (loading) return <div>Carregando...</div>;
  
  // Redireciona para home se não autenticado
  if (!isAuthenticated) {
    if (process.env.NODE_ENV === 'development') {
      console.log('Usuário não autenticado, redirecionando para home');
    }
    return <Navigate to="/" replace />;
  }
  
  // Verifica permissões baseadas em papéis se especificado
  if (roles) {
    const hasPermission = hasRole(user, roles);
    
    // Log de desenvolvimento para debug de permissões
    if (process.env.NODE_ENV === 'development') {
      console.log('Verificando permissões:', {
        user: user,
        requiredRoles: roles,
        hasPermission: hasPermission,
        userRole: user?.role,
        userRoleId: user?.role_id
      });
    }
    
    // Redireciona para dashboard se sem permissão
    if (!hasPermission) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Usuário sem permissão, redirecionando para home');
      }
      return <Navigate to="/dashboard" replace />;
    }
  }
  
  return <MainLayout>{children}</MainLayout>;
}

// Utilitário para compatibilidade de URL entre frontend e backend
function frontendToBackendUrl(url) {
  return url.replace('localhost:5173', process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL.replace(/https?:\/\//, '') : 'localhost:3001');
}

// Componente principal do roteador - define todas as rotas da aplicação
export default function AppRouter() {
  return (
    <Router 
      future={{ 
        v7_startTransition: true,
        v7_relativeSplatPath: true 
      }}
    >
      <Routes>
          <Route path="/" element={<HomePage />} />
          {/* Público */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/registrar" element={<RegisterPage />} />
          <Route path="/registrar-completo" element={<FullRegisterPage />} />
          <Route path="/esqueci-senha" element={<ForgotPasswordPage />} />
          <Route path="/resetar-senha" element={<ResetPasswordPage />} />
          
          {/* Convite de agendamento - público */}
          <Route path="/convite/:token" element={<ConviteAgendamento />} />
          
          {/* Resposta a convites - rotas públicas */}
          <Route path="/convite/:id/aceitar" element={<AceitarConvitePage />} />
          <Route path="/convite/:id/recusar" element={<RecusarConvitePage />} />
          <Route path="/convite/:id" element={<ConviteVisualizacao />} />
          
          
          {/* Protegido: Todos autenticados */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/perfil"
            element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            }
          />
          <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} /> 
          <Route path="/arquivos" element={<PrivateRoute><ArquivosPage /></PrivateRoute>} /> 
            <Route path="/agendamentos" element={<PrivateRoute><AgendamentosPage /></PrivateRoute>} />
            <Route path="/agendamentos/novo" element={<PrivateRoute><AgendamentoCreatePage /></PrivateRoute>} />
            <Route path="/agendamentos/:id" element={<PrivateRoute><AgendamentoDetailPage /></PrivateRoute>} />
            <Route path="/agendamentos/:id/editar" element={<PrivateRoute><AgendamentoEditPage /></PrivateRoute>} />
          
          {/* Sistema de notificações removido - substituído por Toast */}
          
          {/* Protegido: Admin */}
          {/* Usuários (admin/professor) */}
          <Route path="/usuarios" element={<PrivateRoute roles={["Professor", "Admin"]}><UserListPage /></PrivateRoute>} />
          <Route path="/usuarios/:id" element={<PrivateRoute roles={["Professor", "Admin"]}><UserDetailPage /></PrivateRoute>} />
          <Route path="/usuarios/:id/editar" element={<PrivateRoute roles={["Professor", "Admin"]}><UserEditPage /></PrivateRoute>} /> 
         

          {/* Processos */}
          <Route path="/processos" element={<PrivateRoute><ProcessListPage /></PrivateRoute>} />
          <Route path="/processos/:id" element={<PrivateRoute><ProcessDetailPage /></PrivateRoute>} />
          <Route path="/processos/:id/atualizacoes" element={<PrivateRoute><ProcessUpdatesPage /></PrivateRoute>} />
          <Route path="/processos/:id/editar" element={<PrivateRoute><ProcessEditPage /></PrivateRoute>} />
          {/* Rotas restritas para Professor/Admin */}
          <Route path="/processos/novo" element={<PrivateRoute roles={["Professor", "Admin"]}><ProcessFormPage /></PrivateRoute>} />
          <Route path="/processos/:id/atribuir" element={<PrivateRoute roles={["Professor", "Admin"]}><ProcessAssignStudentPage /></PrivateRoute>} />
          {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}