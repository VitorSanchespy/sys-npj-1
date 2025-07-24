import React from "react";
import DashboardSummary from "@/components/dashboard/DashboardSummary";
import { useDashboardData } from "@/hooks/useApi.jsx";
import { useAuthContext } from "@/contexts/AuthContext";

export default function DashboardPage() {
  const { user } = useAuthContext();
  const { data: dashboardData, isLoading, error } = useDashboardData();

  if (isLoading) {
    return (
      <div style={{ 
        /* minHeight/background removidos */
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
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
        <div style={{
          backgroundColor: 'white',
          borderRadius: '20px',
          padding: '40px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
          textAlign: 'center',
          maxWidth: '400px',
          width: '100%',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ 
            fontSize: '4rem', 
            marginBottom: '20px',
            animation: 'spin 2s linear infinite'
          }}>
            ⏳
          </div>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold',
            color: '#001F3F',
            marginBottom: '10px',
            margin: '0 0 10px 0'
          }}>
            Carregando Dashboard
          </h2>
          <p style={{ 
            fontSize: '1rem', 
            color: '#666',
            margin: 0
          }}>
            Buscando dados do sistema...
          </p>
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

  if (error) {
    return (
      <div style={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #001F3F 0%, #003366 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
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
        <div style={{
          backgroundColor: 'white',
          borderRadius: '20px',
          padding: '40px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
          textAlign: 'center',
          maxWidth: '400px',
          width: '100%',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>⚠️</div>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold',
            color: '#dc3545',
            marginBottom: '10px',
            margin: '0 0 10px 0'
          }}>
            Erro ao Carregar Dashboard
          </h2>
          <p style={{ 
            fontSize: '1rem', 
            color: '#666',
            marginBottom: '20px',
            margin: '0 0 20px 0'
          }}>
            {error?.message || "Não foi possível carregar os dados do dashboard"}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#c82333'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#dc3545'}
          >
            🔄 Tentar Novamente
          </button>
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

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #001F3F 0%, #003366 100%)'
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

      <div style={{ paddingTop: '80px' }}>
        <DashboardSummary dashboardData={dashboardData} user={user} />
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