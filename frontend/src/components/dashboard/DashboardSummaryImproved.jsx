import React from 'react';
import { useDashboardData } from '../../hooks/useApi';
import { useAuthContext } from '../../contexts/AuthContext';
import { getUserRole } from '../../hooks/useApi';
import { useDashboardAutoRefresh } from '../../hooks/useAutoRefresh';

const DashboardSummaryImproved = () => {
  const { data: dashboardData, isLoading, error, refetch } = useDashboardData();
  const { user, token } = useAuthContext();
  const userRole = getUserRole(user);
  
  // Implementar auto-refresh no dashboard
  const { refreshDashboard } = useDashboardAutoRefresh(30000); // 30 segundos

  // Função para baixar PDF do relatório do dashboard
  const handleDownloadPDF = async () => {
    try {
      console.log('📄 Gerando PDF do dashboard...');
      
  const response = await fetch('/api/dashboard/exportar', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      // Converter para blob
      const blob = await response.blob();
      
      // Criar URL temporária e fazer download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dashboard-${userRole}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('✅ PDF baixado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao baixar PDF:', error);
      alert('Erro ao gerar relatório PDF. Tente novamente.');
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-red-800 font-medium">Erro ao carregar dashboard</h3>
            <p className="text-red-600 text-sm mt-1">{error.message}</p>
          </div>
          <button
            onClick={() => refetch()}
            className="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-md text-sm"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header com botões */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Dashboard - {userRole}
            </h2>
            {dashboardData?.ultimaAtualizacao && (
              <p className="text-sm text-gray-500 mt-1">
                Última atualização: {new Date(dashboardData.ultimaAtualizacao).toLocaleString('pt-BR')}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => refetch()}
              className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-md text-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Atualizar
            </button>
            <button
              onClick={handleDownloadPDF}
              className="bg-green-50 hover:bg-green-100 text-green-700 px-4 py-2 rounded-md text-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Baixar PDF
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo do dashboard */}
      <div className="p-6">
        {/* Estatísticas principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Card Processos */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-blue-600">Total de Processos</p>
                <p className="text-2xl font-semibold text-blue-900">
                  {dashboardData?.processosTotal || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Card Processos Ativos */}
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-green-600">Processos Ativos</p>
                <p className="text-2xl font-semibold text-green-900">
                  {dashboardData?.processosAtivos || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Card Agendamentos */}
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-purple-600">Agendamentos</p>
                <p className="text-2xl font-semibold text-purple-900">
                  {dashboardData?.agendamentosTotal || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Card Usuários (apenas para Admin/Professor) */}
          {(userRole === 'Admin' || userRole === 'Professor') && (
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-orange-600">Usuários</p>
                  <p className="text-2xl font-semibold text-orange-900">
                    {dashboardData?.totalUsuarios || 0}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Gráficos e detalhamentos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Processos por Status */}
          {dashboardData?.processosPorStatus && Object.keys(dashboardData.processosPorStatus).length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Processos por Status</h3>
              <div className="space-y-3">
                {Object.entries(dashboardData.processosPorStatus).map(([status, count]) => (
                  <div key={status} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 capitalize">
                      {status.replace('_', ' ')}
                    </span>
                    <span className="text-sm font-medium text-gray-900">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Agendamentos por Status */}
          {dashboardData?.agendamentosPorStatus && Object.keys(dashboardData.agendamentosPorStatus).length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Agendamentos por Status</h3>
              <div className="space-y-3">
                {Object.entries(dashboardData.agendamentosPorStatus).map(([status, count]) => (
                  <div key={status} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 capitalize">
                      {status.replace('_', ' ')}
                    </span>
                    <span className="text-sm font-medium text-gray-900">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Informações específicas por papel */}
        {userRole === 'Aluno' && (
          <div className="mt-6 bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-blue-900 mb-2">Seus Dados</h3>
            <p className="text-blue-700">
              Visualizando apenas seus processos e agendamentos. Para criar novos agendamentos,
              acesse a página de Agendamentos.
            </p>
          </div>
        )}

        {/* Debug info (apenas em desenvolvimento) */}
        {process.env.NODE_ENV === 'development' && dashboardData?.erro && (
          <div className="mt-6 bg-red-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-red-900 mb-2">Debug Info</h3>
            <p className="text-red-700 text-sm">{dashboardData.erro}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardSummaryImproved;
