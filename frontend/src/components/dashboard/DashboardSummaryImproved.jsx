import React, { useState, useEffect } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useAgendamentos } from "../../hooks/agendamentoHooks";
import { useDashboardData } from "@/hooks/useApi.jsx";
import Loader from "@/components/layout/Loader";

// Componente para estatísticas de agendamentos
function AgendamentoStats({ agendamentos }) {
  const agora = new Date();
  const seteDiasAFrente = new Date(agora.getTime() + (7 * 24 * 60 * 60 * 1000));
  
  const stats = {
    total: agendamentos.length,
    hoje: 0,
    proximos7Dias: 0,
    vencidos: 0,
    porTipo: {},
    porStatus: {}
  };

  agendamentos.forEach(agendamento => {
    const dataEvento = new Date(agendamento.data_inicio || agendamento.dataEvento || agendamento.data_evento);
    const status = agendamento.status || 'agendado';
    const tipo = agendamento.tipo_evento || 'outro';

    // Contadores por tipo e status
    stats.porTipo[tipo] = (stats.porTipo[tipo] || 0) + 1;
    stats.porStatus[status] = (stats.porStatus[status] || 0) + 1;

    // Hoje
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const amanha = new Date(hoje.getTime() + (24 * 60 * 60 * 1000));
    if (dataEvento >= hoje && dataEvento < amanha) {
      stats.hoje++;
    }

    // Próximos 7 dias
    if (dataEvento >= agora && dataEvento <= seteDiasAFrente) {
      stats.proximos7Dias++;
    }

    // Vencidos
    if (dataEvento < agora && status === 'agendado') {
      stats.vencidos++;
    }
  });

  return stats;
}

// Componente de estatística individual
function StatCard({ title, value, color, icon, subtitle }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className={`w-8 h-8 rounded-md flex items-center justify-center ${color}`}>
            <span className="text-lg">{icon}</span>
          </div>
        </div>
        <div className="ml-4 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">
              {title}
            </dt>
            <dd className={`text-lg font-semibold ${color.includes('red') ? 'text-red-600' : 
                            color.includes('yellow') ? 'text-yellow-600' :
                            color.includes('green') ? 'text-green-600' :
                            'text-blue-600'}`}>
              {value}
            </dd>
            {subtitle && (
              <dd className="text-xs text-gray-400 mt-1">
                {subtitle}
              </dd>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
}

// Dashboard para Alunos
function DashboardAluno({ user, dashboardData, agendamentosStats }) {
  return (
    <div className="space-y-6">
      {/* Cabeçalho personalizado para aluno */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold">
          Olá, {user.nome}! 👋
        </h1>
        <p className="text-blue-100 mt-2">
          Bem-vindo ao seu painel do NPJ. Aqui você pode acompanhar seus processos e agendamentos.
        </p>
      </div>

      {/* Estatísticas principais para aluno */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Meus Processos"
          value={dashboardData?.processosTotal || 0}
          color="bg-blue-100"
          icon="⚖️"
          subtitle="Processos atribuídos"
        />
        <StatCard
          title="Agendamentos Hoje"
          value={agendamentosStats.hoje}
          color="bg-green-100"
          icon="📅"
          subtitle="Eventos de hoje"
        />
        <StatCard
          title="Próximos 7 dias"
          value={agendamentosStats.proximos7Dias}
          color="bg-yellow-100"
          icon="⏰"
          subtitle="Eventos próximos"
        />
        <StatCard
          title="Pendentes"
          value={agendamentosStats.vencidos}
          color="bg-red-100"
          icon="⚠️"
          subtitle="Agendamentos vencidos"
        />
      </div>

      {/* Informações específicas do aluno */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Processos do aluno */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            📋 Meus Processos
          </h3>
          <div className="space-y-3">
            {dashboardData?.processosPorStatus ? (
              Object.entries(dashboardData.processosPorStatus).map(([status, count]) => (
                <div key={status} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 capitalize">{status.replace('_', ' ')}</span>
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">Nenhum processo atribuído ainda.</p>
            )}
          </div>
        </div>

        {/* Agendamentos por tipo */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            📊 Agendamentos por Tipo
          </h3>
          <div className="space-y-3">
            {Object.keys(agendamentosStats.porTipo).length > 0 ? (
              Object.entries(agendamentosStats.porTipo).map(([tipo, count]) => (
                <div key={tipo} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 capitalize">
                    {tipo === 'audiencia' ? 'Audiências' :
                     tipo === 'reuniao' ? 'Reuniões' :
                     tipo === 'prazo' ? 'Prazos' :
                     tipo === 'diligencia' ? 'Diligências' : 'Outros'}
                  </span>
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">Nenhum agendamento ainda.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Dashboard para Admin e Professor
function DashboardAdminProfessor({ user, dashboardData, agendamentosStats }) {
  return (
    <div className="space-y-6">
      {/* Cabeçalho personalizado para admin/professor */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold">
          Painel Administrativo 🎯
        </h1>
        <p className="text-green-100 mt-2">
          Olá, {user.nome}! Gerencie processos, usuários e acompanhe as estatísticas do NPJ.
        </p>
      </div>

      {/* Estatísticas completas para admin/professor */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Processos"
          value={dashboardData?.processosTotal || 0}
          color="bg-blue-100"
          icon="⚖️"
          subtitle="Em todo o sistema"
        />
        <StatCard
          title="Usuários Ativos"
          value={dashboardData?.usuariosAtivos || 0}
          color="bg-purple-100"
          icon="👥"
          subtitle="Cadastrados no sistema"
        />
        <StatCard
          title="Agendamentos Total"
          value={agendamentosStats.total}
          color="bg-green-100"
          icon="📅"
          subtitle="Todos os agendamentos"
        />
        <StatCard
          title="Pendências"
          value={agendamentosStats.vencidos}
          color="bg-red-100"
          icon="⚠️"
          subtitle="Agendamentos vencidos"
        />
      </div>

      {/* Seção de estatísticas detalhadas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Processos por status */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            📊 Processos por Status
          </h3>
          <div className="space-y-3">
            {dashboardData?.processosPorStatus ? (
              Object.entries(dashboardData.processosPorStatus).map(([status, count]) => (
                <div key={status} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 capitalize">{status.replace('_', ' ')}</span>
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">Carregando dados...</p>
            )}
          </div>
        </div>

        {/* Agendamentos por tipo */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            📋 Agendamentos por Tipo
          </h3>
          <div className="space-y-3">
            {Object.keys(agendamentosStats.porTipo).length > 0 ? (
              Object.entries(agendamentosStats.porTipo).map(([tipo, count]) => (
                <div key={tipo} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 capitalize">
                    {tipo === 'audiencia' ? 'Audiências' :
                     tipo === 'reuniao' ? 'Reuniões' :
                     tipo === 'prazo' ? 'Prazos' :
                     tipo === 'diligencia' ? 'Diligências' : 'Outros'}
                  </span>
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">Nenhum agendamento registrado.</p>
            )}
          </div>
        </div>

        {/* Agendamentos por status */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            🔄 Agendamentos por Status
          </h3>
          <div className="space-y-3">
            {Object.keys(agendamentosStats.porStatus).length > 0 ? (
              Object.entries(agendamentosStats.porStatus).map(([status, count]) => (
                <div key={status} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 capitalize">
                    {status === 'agendado' ? 'Agendados' :
                     status === 'realizado' ? 'Realizados' :
                     status === 'cancelado' ? 'Cancelados' :
                     status === 'adiado' ? 'Adiados' : status}
                  </span>
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">Nenhum agendamento registrado.</p>
            )}
          </div>
        </div>
      </div>

      {/* Seção de ações rápidas para admin/professor */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          ⚡ Ações Rápidas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="text-2xl mb-2">👥</div>
            <div className="font-medium text-gray-900">Gerenciar Usuários</div>
            <div className="text-sm text-gray-500">Cadastrar e editar usuários</div>
          </button>
          <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="text-2xl mb-2">⚖️</div>
            <div className="font-medium text-gray-900">Novo Processo</div>
            <div className="text-sm text-gray-500">Cadastrar novo processo</div>
          </button>
          <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="text-2xl mb-2">📅</div>
            <div className="font-medium text-gray-900">Agendamentos</div>
            <div className="text-sm text-gray-500">Gerenciar agenda</div>
          </button>
          <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="text-2xl mb-2">📊</div>
            <div className="font-medium text-gray-900">Relatórios</div>
            <div className="text-sm text-gray-500">Gerar relatórios</div>
          </button>
        </div>
      </div>
    </div>
  );
}

// Componente principal do Dashboard melhorado
function DashboardSummaryImproved({ dashboardData, user }) {
  const { data: agendamentosData } = useAgendamentos({ limit: 1000 });
  const agendamentos = (agendamentosData && agendamentosData.success && Array.isArray(agendamentosData.agendamentos)) 
    ? agendamentosData.agendamentos : [];
  
  const agendamentosStats = AgendamentoStats({ agendamentos });
  const userRole = user?.role?.nome || user?.Role?.nome || 'Aluno';

  if (!dashboardData) {
    return <Loader message="Carregando dados do dashboard..." />;
  }

  // Renderizar dashboard específico baseado no role
  if (userRole === 'Aluno') {
    return <DashboardAluno 
      user={user} 
      dashboardData={dashboardData} 
      agendamentosStats={agendamentosStats}
    />;
  } else {
    return <DashboardAdminProfessor 
      user={user} 
      dashboardData={dashboardData} 
      agendamentosStats={agendamentosStats}
    />;
  }
}

export default DashboardSummaryImproved;
