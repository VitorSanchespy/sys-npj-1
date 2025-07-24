import React from "react";
import ProfileView from "../../components/profile/ProfileView";

export default function ProfilePage() {
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
        {/* Header da página */}
        <div style={{
          maxWidth: '800px',
          margin: '0 auto 30px auto',
          textAlign: 'center',
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '20px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{
            fontSize: '3rem',
            marginBottom: '15px'
          }}>
            👤
          </div>
          <h1 style={{
            color: '#001F3F',
            margin: '0 0 10px 0',
            fontSize: '2.5rem',
            fontWeight: 'bold'
          }}>
            Meu Perfil
          </h1>
          <p style={{
            color: '#666',
            fontSize: '1.1rem',
            margin: 0
          }}>
            Gerencie suas informações pessoais e configurações de conta
          </p>
        </div>

        {/* Container do perfil */}
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <ProfileView />
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