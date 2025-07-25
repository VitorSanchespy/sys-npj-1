import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthContext } from "../../contexts/AuthContext";
import { hasRole } from "../../utils/permissions";

const Navigation = () => {
  const { user, logout } = useAuthContext();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '🏠', roles: ['admin', 'professor', 'aluno'] },
    { path: '/processos', label: 'Processos', icon: '📋', roles: ['admin', 'professor', 'aluno'] },
    { path: '/agendamentos', label: 'Agendamentos', icon: '📅', roles: ['admin', 'professor', 'aluno'] },
    { path: '/arquivos', label: 'Arquivos', icon: '📁', roles: ['admin', 'professor', 'aluno'] },
    { path: '/usuarios', label: 'Usuários', icon: '👥', roles: ['admin', 'professor'] },
    { path: '/profile', label: 'Perfil', icon: '👤', roles: ['admin', 'professor', 'aluno'] },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    hasRole(user, item.roles)
  );

  const isActive = (path) => location.pathname === path;

  // Garantir que role seja string
  let roleText = user?.role;
  if (typeof roleText === 'object' && roleText !== null) {
    roleText = roleText.nome || roleText.name || JSON.stringify(roleText);
  }

  return (
    <div style={{
      height: 'calc(100vh - 76px)',
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto'
    }}>
      {/* User info */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid #e9ecef',
        textAlign: 'center',
        backgroundColor: '#f8f9fa'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          backgroundColor: '#0066cc',
          color: 'white',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 8px',
          fontSize: '18px',
          fontWeight: 'bold'
        }}>
          {user?.nome?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <div style={{ fontSize: '14px', fontWeight: '600', color: '#212529', marginBottom: '4px' }}>
          {user?.nome || 'Usuário'}
        </div>
        <div style={{ fontSize: '12px', color: '#6c757d' }}>
          {roleText || 'Usuário'}
        </div>
      </div>

      {/* Menu Items */}
      <div style={{ flex: 1, padding: '16px 0' }}>
        {filteredMenuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 20px',
              textDecoration: 'none',
              color: isActive(item.path) ? '#0066cc' : '#495057',
              backgroundColor: isActive(item.path) ? '#e3f2fd' : 'transparent',
              borderRight: isActive(item.path) ? '3px solid #0066cc' : '3px solid transparent',
              fontSize: '14px',
              fontWeight: isActive(item.path) ? '600' : '400',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (!isActive(item.path)) {
                e.target.style.backgroundColor = '#f8f9fa';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive(item.path)) {
                e.target.style.backgroundColor = 'transparent';
              }
            }}
          >
            <span style={{ fontSize: '16px' }}>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </div>

      {/* Logout Button */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid #e9ecef'
      }}>
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'background-color 0.2s ease'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#c82333'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#dc3545'}
        >
          <span>🚪</span>
          Sair
        </button>
      </div>
    </div>
  );
};

export default Navigation;
