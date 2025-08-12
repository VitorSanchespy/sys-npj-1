import React, { useEffect } from "react";
import DashboardSummaryImproved from "@/components/dashboard/DashboardSummaryImproved";
import { useDashboardData } from "@/hooks/useApi.jsx";
import { useAuthContext } from "@/contexts/AuthContext";
import { useDashboardAutoRefresh } from "@/hooks/useAutoRefresh";
import Loader from "@/components/layout/Loader";

export default function DashboardPage() {
  const { user } = useAuthContext();
  const { data: dashboardData, isLoading, error, refetch } = useDashboardData();
  const { afterUpdateDashboard } = useDashboardAutoRefresh();

  // Auto-refresh a cada 2 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
      console.log('📊 Dashboard atualizado automaticamente');
    }, 120000);
    return () => clearInterval(interval);
  }, [refetch]);

  // Trigger para outros componentes atualizarem o dashboard
  useEffect(() => {
    const handleDashboardUpdate = () => {
      afterUpdateDashboard();
      console.log('📊 Dashboard dados atualizados automaticamente');
    };
    
    window.addEventListener('dashboardUpdate', handleDashboardUpdate);
    return () => window.removeEventListener('dashboardUpdate', handleDashboardUpdate);
  }, [afterUpdateDashboard]);

  if (isLoading) {
    return <Loader message="Carregando Dashboard" />;
  }

  if (error) {
    return <Loader error={error} />;
  }

  return (
    <>
      <div className="dashboard-title" style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e9ecef',
        marginBottom: '24px'
      }}>
        <h1 style={{ 
          margin: 0, 
          fontSize: '24px', 
          fontWeight: '600',
          color: '#212529'
        }}>
          Dashboard NPJ
        </h1>
        <p style={{ 
          margin: '8px 0 0 0', 
          fontSize: '14px', 
          color: '#6c757d' 
        }}>
          Painel de controle personalizado - Perfil: {user?.role?.nome || user?.Role?.nome || 'Usuário'}
        </p>
        
        {/* Botão de exportação de relatório */}
        <button 
          className="export-btn mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => {
            console.log('📄 Exportando relatório PDF');
            alert('Funcionalidade de exportação será implementada em breve');
          }}
        >
          📄 Exportar Relatório PDF
        </button>
      </div>
      
      <DashboardSummaryImproved dashboardData={dashboardData} user={user} />
    </>
  );
}