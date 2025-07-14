import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthContext";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import ProfilePage from "../pages/dashboard/ProfilePage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";
import ProcessListPage from "../pages/dashboard/ProcessListPage";
import ProcessDetailPage from "../pages/dashboard/ProcessDetailPage";
import ProcessFormPage from "../pages/dashboard/ProcessFormPage";
import ProcessAssignStudentPage from "../pages/dashboard/ProcessAssignStudentPage";
import ProcessUpdatesPage from "../pages/dashboard/ProcessUpdatesPage";
import UserListPage from "../pages/dashboard/UserListPage";
import UserDetailPage from "../pages/dashboard/UserDetailPage";
import UserEditPage from "../pages/dashboard/UserEditPage";
import { hasRole } from "../utils/permissions";


function PrivateRoute({ children, roles }) {
  const { isAuthenticated, user, loading } = useAuthContext();
  if (loading) return <div>Carregando...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !hasRole(user, roles)) return <Navigate to="/" replace />;
  return children;
}

export default function AppRouter() {
  return (
    <Router>
      <Routes>
        {/* Público */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/esqueci-senha" element={<ForgotPasswordPage />} />
        <Route path="/resetar-senha" element={<ResetPasswordPage />} />
        
        {/* Protegido: Todos autenticados */}
        <Route
          path="/"
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
        {/* Usuários (admin/professor) */}
        <Route path="/usuarios" element={<PrivateRoute roles={["admin", "professor"]}><UserListPage /></PrivateRoute>} />
        <Route path="/usuarios/:id" element={<PrivateRoute roles={["admin", "professor"]}><UserDetailPage /></PrivateRoute>} />
        <Route path="/usuarios/:id/editar" element={<PrivateRoute roles={["admin", "professor"]}><UserEditPage /></PrivateRoute>} /> 
        <Route path="/processos" element={<PrivateRoute><ProcessListPage /></PrivateRoute>} />
        {/* Protegido: Professor/Admin */}
        <Route path="/processos/novo" element={<PrivateRoute roles={["Admin", "Professor"]}><ProcessFormPage /></PrivateRoute>} />
        <Route path="/processos/:id" element={<PrivateRoute><ProcessDetailPage /></PrivateRoute>} />
        <Route path="/processos/:id/editar" element={<PrivateRoute roles={["admin", "professor"]}><ProcessFormPage /></PrivateRoute>} />
        <Route path="/processos/:id/atribuir" element={<PrivateRoute roles={["admin", "professor"]}><ProcessAssignStudentPage /></PrivateRoute>} />
        <Route path="/processos/:id/atualizacoes" element={<PrivateRoute><ProcessUpdatesPage /></PrivateRoute>} />
      
        {/* 404 */}
        <Route path="*" element={<div>Página não encontrada</div>} />
      </Routes>
    </Router>
  );
}