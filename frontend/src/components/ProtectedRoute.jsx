import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, roles, redirectTo = '/login', fallbackRedirect = '/dashboard' }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user')) || {};

  // Redirecionamentos condicionais
  if (!token) {
    return <Navigate to={redirectTo} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to={fallbackRedirect} replace />;
  }

  return children;
};

export default ProtectedRoute;