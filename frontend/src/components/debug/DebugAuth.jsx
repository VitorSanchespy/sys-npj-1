// Debug component para verificar estado da autenticação
import React from 'react';
import { useAuthContext } from '../../contexts/AuthContext';

const DebugAuth = () => {
  const { user, isAuthenticated, loading } = useAuthContext();
  
  // Log no console para debug
  console.log('🔍 DEBUG AUTH:', {
    isAuthenticated,
    loading,
    user,
    userRole: user?.role,
    userRoleId: user?.role_id,
    userNome: user?.nome
  });

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '4px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <div><strong>Auth Debug:</strong></div>
      <div>Authenticated: {isAuthenticated ? '✅' : '❌'}</div>
      <div>Loading: {loading ? '⏳' : '✅'}</div>
      <div>User: {user?.nome || 'None'}</div>
      <div>Role: {user?.role || 'None'}</div>
      <div>Role ID: {user?.role_id || 'None'}</div>
    </div>
  );
};

export default DebugAuth;
