import React from "react";
import UserList from "../../components/usuarios/UserList";

export default function UserListPage() {
  return (
    <div style={{ 
      /* minHeight/background removidos */
      padding: '20px'
    }}>
      {/* Header fixo */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#001F3F',
        padding: '15px 0',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        zIndex: 100
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '15px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            backgroundColor: 'white',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            color: '#001F3F'
          }}>
            NPJ
          </div>
          <h1 style={{
            color: 'white',
            margin: 0,
            fontSize: '1.3rem',
            fontWeight: 'bold'
          }}>
            Sistema NPJ - UFMT
          </h1>
        </div>
      </div>

      <div style={{ paddingTop: '100px' }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          backgroundColor: 'white',
          borderRadius: '20px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)'
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #001F3F 0%, #004080 100%)',
            color: 'white',
            padding: '30px',
            textAlign: 'center'
          }}>
            <h1 style={{ 
              margin: 0, 
              fontSize: '2rem', 
              fontWeight: 'bold',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)'
            }}>
              👥 Gerenciamento de Usuários
            </h1>
            <p style={{ 
              margin: '8px 0 0 0', 
              opacity: 0.9,
              fontSize: '1rem'
            }}>
              Gerencie usuários do sistema
            </p>
          </div>

          <UserList />
        </div>
      </div>

      {/* Footer */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        textAlign: 'center',
        padding: '20px',
        color: 'rgba(255,255,255,0.7)',
        fontSize: '0.9rem'
      }}>
        © 2025 Universidade Federal de Mato Grosso - NPJ
      </div>
    </div>
  );
}