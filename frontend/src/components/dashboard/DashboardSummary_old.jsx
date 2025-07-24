import React, { useState } from "react";
import { useAuthContext } from "../../contexts/AuthContext";
import { useDashboardData } from "../../hooks/useApi.jsx";
import { QueryStatus } from "../debug/QueryStatus";
import { useCacheManager } from "../../hooks/useCacheManager";
import { testApiEndpoints } from "../../debug/apiTester";

// Helper para verificar role (importado da mesma lógica do useApi)
const getUserRole = (user) => {
  if (!user) return null;
  
  if (typeof user.role === 'string') {
    return user.role;
  }
  
  if (user.role && typeof user.role === 'object') {
    return user.role.nome || user.role.name || null;
  }
  
  if (user.role_id === 1) return 'Admin';
  if (user.role_id === 2) return 'Aluno';
  if (user.role_id === 3) return 'Professor';
  
  return null;
};

// Funções utilitárias devem vir ANTES do componente principal
const calculateStatistics = (processos, usuarios) => {
  const stats = {
    totalProcessos: processos.length,
    processosAbertos: processos.filter(p => p.status === "Aberto").length,
    processosAndamento: processos.filter(p => p.status === "Em andamento").length,
    processosFinalizados: processos.filter(p => p.status === "Finalizado").length,
    totalUsuarios: usuarios.length,
    totalAlunos: usuarios.filter(u => u.role === "Aluno" || u.role_id === 2).length,
    totalProfessores: usuarios.filter(u => u.role === "Professor" || u.role_id === 3).length,
    totalAdmins: usuarios.filter(u => u.role === "Admin" || u.role_id === 1).length,
    sistemaFisico: processos.filter(p => p.sistema === "Físico").length,
    sistemaPEA: processos.filter(p => p.sistema === "PEA").length,
    sistemaPJE: processos.filter(p => p.sistema === "PJE").length
  };
  return stats;
};

const calculateAlerts = (processos) => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  return processos.filter(proc => {
    const lastUpdate = new Date(proc.updatedAt || proc.criado_em);
    return lastUpdate < thirtyDaysAgo && proc.status !== "Finalizado";
  }).length;
};

export default function DashboardSummary() {
  const { user, token } = useAuthContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPeriod, setFilterPeriod] = useState("30");
  const [filterStatus, setFilterStatus] = useState("");
  
  // Cache manager para debug
  const { invalidateDashboard, refreshDashboard, clearCache, getCacheStatus } = useCacheManager();

  // Hook com cache inteligente - substitui todo o useEffect manual!
  const { 
    data: dashboardData, 
    isLoading, 
    error, 
    refetch,
    isFetching,
    isRefetching,
    dataUpdatedAt
  } = useDashboardData();

  // Debug info
  console.log('🎯 Dashboard Status:', {
    isLoading,
    isFetching,
    isRefetching,
    hasData: !!dashboardData,
    userRole: getUserRole(user),
    dataUpdatedAt: dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString() : 'Nunca',
    timestamp: new Date().toLocaleTimeString()
  });

  // Processar dados para dashboard se existirem
  const data = dashboardData ? {
    processos: dashboardData.processos || [],
    processosRecentes: dashboardData.processosRecentes || [],
    totalProcessos: dashboardData.totalProcessos || 0,
    statusCounts: dashboardData.statusCounts || {},
    totalUsuarios: dashboardData.totalUsuarios || 0
  } : {
    processos: [],
    processosRecentes: [],
    totalProcessos: 0,
    statusCounts: {},
    totalUsuarios: 0
  };

  // ...existing code...

  const handleGlobalSearch = (e) => {
    setSearchTerm(e.target.value);
    // Apenas visual - não navega
  };

  if (isLoading) return (
    <div style={{ padding: 20, textAlign: 'center' }}>
      <div style={{ fontSize: 16, marginBottom: 10 }}>⏳ Carregando painel...</div>
      <div style={{ fontSize: 12, color: '#666' }}>
        Primeira vez buscando dados do cache
      </div>
    </div>
  );
  
  if (error) return (
    <div style={{ color: "red", padding: 20 }}>
      ❌ Erro ao carregar dashboard: {error.message}
      <button onClick={refetch} style={{ marginLeft: 10, padding: '5px 10px' }}>
        🔄 Tentar novamente
      </button>
    </div>
  );

  return (
    <div style={{ padding: 20, maxWidth: 1200, margin: "0 auto" }}>
      {/* Status do TanStack Query */}
      {import.meta.env.DEV && <QueryStatus />}
      
      {/* Header com busca global e filtros */}
      <div style={{ marginBottom: 30 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h1 style={{ margin: 0, color: "#333" }}>Dashboard - Sistema NPJ</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
            <button
              onClick={() => {
                console.log('🔄 Usuário clicou em Refresh Cache');
                refetch();
              }}
              disabled={isFetching}
              style={{
                padding: '8px 16px',
                backgroundColor: isFetching ? '#6c757d' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                cursor: isFetching ? 'not-allowed' : 'pointer',
                fontSize: 13,
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
              title={isFetching ? "Atualizando dados..." : "Atualizar dados do cache"}
            >
              {isFetching ? (
                <>
                  ⏳ Atualizando...
                </>
              ) : (
                <>
                  🔄 Refresh Cache
                </>
              )}
            </button>
            
            {/* Botões de Debug - apenas em desenvolvimento */}
            {import.meta.env.DEV && (
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => {
                    console.log('🗑️ Invalidando cache do dashboard');
                    invalidateDashboard();
                  }}
                  style={{
                    padding: '6px 10px',
                    backgroundColor: '#ffc107',
                    color: 'black',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: 11
                  }}
                  title="Invalidar cache"
                >
                  🗑️ Invalidar
                </button>
                
                <button
                  onClick={() => {
                    console.log('🧹 Limpando todo o cache');
                    clearCache();
                  }}
                  style={{
                    padding: '6px 10px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: 11
                  }}
                  title="Limpar todo o cache"
                >
                  🧹 Limpar
                </button>
                
                <button
                  onClick={() => {
                    const status = getCacheStatus();
                    console.log('📊 Status do cache:', status);
                    alert(JSON.stringify(status, null, 2));
                  }}
                  style={{
                    padding: '6px 10px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: 11
                  }}
                  title="Mostrar status do cache"
                >
                  📊 Status
                </button>
                
                <button
                  onClick={async () => {
                    console.log('🧪 Testando todas as APIs...');
                    try {
                      const results = await testApiEndpoints(token);
                      console.log('🎯 Resultados dos testes:', results);
                    } catch (error) {
                      console.error('❌ Erro ao testar APIs:', error);
                    }
                  }}
                  style={{
                    padding: '6px 10px',
                    backgroundColor: '#6f42c1',
                    color: 'white',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: 11
                  }}
                  title="Testar todas as APIs"
                >
                  🧪 Test APIs
                </button>
              </div>
            )}
            
            {/* Indicador de última atualização */}
            <div style={{ 
              fontSize: 11, 
              color: '#666',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end'
            }}>
              <div>
                Última atualização: {dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString() : 'Nunca'}
              </div>
              {isFetching && (
                <div style={{ color: '#007bff', fontWeight: 'bold' }}>
                  🔄 Sincronizando dados...
                </div>
              )}
            </div>
            {data.alertas > 0 && (
              <div style={{
                backgroundColor: "#dc3545",
                color: "white",
                borderRadius: "50%",
                width: 25,
                height: 25,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: "bold"
              }}>
                {data.alertas}
              </div>
            )}
            <span style={{ color: "#666", fontSize: 14 }}>Bem-vindo, {user?.nome}</span>
          </div>
        </div>
        
        {/* Busca Global e Filtros - apenas visual */}
        <div style={{ display: "flex", gap: 15, alignItems: "center", flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="Busca visual: digite para filtrar dados em cache..."
            value={searchTerm}
            onChange={handleGlobalSearch}
            style={{
              flex: 1,
              minWidth: 300,
              padding: "10px 15px",
              border: "1px solid #ddd",
              borderRadius: 8,
              fontSize: 14
            }}
          />
          <select
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value)}
            style={{ padding: "10px", border: "1px solid #ddd", borderRadius: 8 }}
          >
            <option value="7">Últimos 7 dias</option>
            <option value="30">Últimos 30 dias</option>
            <option value="90">Últimos 90 dias</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ padding: "10px", border: "1px solid #ddd", borderRadius: 8 }}
          >
            <option value="">Todos os status</option>
            <option value="Aberto">Aberto</option>
            <option value="Em andamento">Em andamento</option>
            <option value="Finalizado">Finalizado</option>
          </select>
        </div>
      </div>

      {/* Dashboard baseado no role */}
      {getUserRole(user) === "Aluno" && <AlunosDashboard data={data} searchTerm={searchTerm} />}
      {getUserRole(user) === "Professor" && <ProfessoresDashboard data={data} searchTerm={searchTerm} />}
      {getUserRole(user) === "Admin" && <AdminsDashboard data={data} searchTerm={searchTerm} />}
      
      {/* Fallback se role não for reconhecido */}
      {!getUserRole(user) && (
        <div style={{ padding: 20, textAlign: 'center', color: '#999' }}>
          ⚠️ Role do usuário não identificado. 
          <br/>
          Debug: role={JSON.stringify(user?.role)}, role_id={user?.role_id}
          <br/>
          <button onClick={() => window.location.reload()} style={{ marginTop: 10, padding: '5px 10px' }}>
            Recarregar Página
          </button>
        </div>
      )}
    </div>
  );
}

// Dashboard para Alunos - Visual e simples
function AlunosDashboard({ data, searchTerm }) {
  const processos = data.processosRecentes || [];
  const statusCounts = data.statusCounts || {};
  
  // Filtrar processos baseado na busca
  const filteredProcessos = searchTerm ? 
    processos.filter(p => 
      p.numero_processo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.assistido?.toLowerCase().includes(searchTerm.toLowerCase())
    ) : processos;

  const totalProcessos = data.totalProcessos || 0;
  const processosAbertos = statusCounts['Aberto'] || 0;
  const processosAndamento = statusCounts['Em andamento'] || 0;
  const processosFinalizados = statusCounts['Finalizado'] || 0;
  
  const progresso = totalProcessos > 0 ? (processosFinalizados / totalProcessos) * 100 : 0;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
      {/* Resumo Visual dos Processos */}
      <Card title="📊 Resumo dos Meus Processos" color="#007bff">
        <div style={{ display: "flex", justifyContent: "space-around", marginBottom: 20 }}>
          <StatItem label="Total" value={totalProcessos} icon="📁" />
          <StatItem label="Abertos" value={processosAbertos} color="#28a745" icon="🟢" />
          <StatItem label="Em Andamento" value={processosAndamento} color="#ffc107" icon="🟡" />
          <StatItem label="Finalizados" value={processosFinalizados} color="#6c757d" icon="✅" />
        </div>
        
        <div style={{ backgroundColor: "#f8f9fa", padding: 15, borderRadius: 8 }}>
          <div style={{ fontSize: 14, fontWeight: "bold", marginBottom: 8 }}>
            📈 Progresso Geral: {progresso.toFixed(1)}%
          </div>
          <div style={{ 
            backgroundColor: "#e9ecef", 
            borderRadius: 12, 
            height: 12, 
            overflow: "hidden" 
          }}>
            <div style={{
              backgroundColor: progresso > 70 ? "#28a745" : progresso > 30 ? "#ffc107" : "#dc3545",
              height: "100%",
              width: `${progresso}%`,
              transition: "width 0.5s ease",
              borderRadius: 12
            }}></div>
          </div>
        </div>
      </Card>

      {/* Últimos Processos */}
      <Card title="🕒 Processos Recentes" color="#28a745">
        <div style={{ fontSize: 14 }}>
          {filteredProcessos.length > 0 ? (
            filteredProcessos.map(proc => (
              <div key={proc.id} style={{ 
                padding: "12px", 
                borderBottom: "1px solid #eee",
                backgroundColor: "#f8f9fa",
                borderRadius: 8,
                marginBottom: 8,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <div>
                  <span style={{ fontSize: 13, fontWeight: "bold", display: "block" }}>
                    📄 {proc.numero_processo || `Processo ${proc.id}`}
                  </span>
                  <span style={{ fontSize: 11, color: "#666" }}>
                    {proc.assistido || "Sem assistido"}
                  </span>
                </div>
                <StatusBadge status={proc.status} />
              </div>
            ))
          ) : (
            <div style={{ 
              textAlign: "center", 
              color: "#999", 
              padding: 30,
              backgroundColor: "#f8f9fa",
              borderRadius: 8
            }}>
              {searchTerm ? "🔍 Nenhum processo encontrado na busca" : "📭 Nenhum processo encontrado"}
            </div>
          )}
        </div>
      </Card>

      {/* Status Visual */}
      <Card title="📈 Status Visual" color="#6f42c1">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <StatusProgressBar 
            label="🟢 Processos Abertos" 
            value={processosAbertos} 
            total={totalProcessos}
            color="#28a745" 
          />
          <StatusProgressBar 
            label="🟡 Em Andamento" 
            value={processosAndamento} 
            total={totalProcessos}
            color="#ffc107" 
          />
          <StatusProgressBar 
            label="✅ Finalizados" 
            value={processosFinalizados} 
            total={totalProcessos}
            color="#6c757d" 
          />
        </div>
        
        {totalProcessos > 0 && (
          <div style={{ 
            marginTop: 15, 
            padding: 12, 
            backgroundColor: "#f8f9fa", 
            borderRadius: 8,
            textAlign: "center"
          }}>
            <div style={{ fontSize: 12, color: "#666" }}>
              {progresso >= 80 ? "🎉 Parabéns! Ótimo progresso!" : 
               progresso >= 50 ? "👍 Bom progresso, continue assim!" :
               "💪 Continue trabalhando nos seus processos!"}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

// Dashboard para Professores - Visual e organizado
function ProfessoresDashboard({ data, searchTerm }) {
  const processos = data.processos || [];
  const processosRecentes = data.processosRecentes || [];
  const statusCounts = data.statusCounts || {};
  
  // Filtrar dados baseado na busca
  const filteredProcessos = searchTerm ? 
    processosRecentes.filter(p => 
      p.numero_processo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.assistido?.toLowerCase().includes(searchTerm.toLowerCase())
    ) : processosRecentes;

  const totalProcessos = data.totalProcessos || 0;
  const processosAbertos = statusCounts['Aberto'] || 0;
  const processosAndamento = statusCounts['Em andamento'] || 0;
  const processosFinalizados = statusCounts['Finalizado'] || 0;
  
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
      {/* Visão Geral dos Processos */}
      <Card title="📊 Visão Geral dos Processos" color="#007bff">
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <PieChart data={[
            { label: "Abertos", value: processosAbertos, color: "#28a745" },
            { label: "Em Andamento", value: processosAndamento, color: "#ffc107" },
            { label: "Finalizados", value: processosFinalizados, color: "#6c757d" }
          ]} />
        </div>
        <div style={{ 
          backgroundColor: "#f8f9fa", 
          padding: 15, 
          borderRadius: 8,
          textAlign: "center"
        }}>
          <div style={{ fontSize: 16, fontWeight: "bold", color: "#007bff" }}>
            {totalProcessos}
          </div>
          <div style={{ fontSize: 12, color: "#666" }}>
            Total de Processos Supervisionados
          </div>
        </div>
      </Card>

      {/* Atividade Recente */}
      <Card title="🕒 Atividade Recente" color="#28a745">
        <div style={{ maxHeight: 200, overflowY: "auto" }}>
          {filteredProcessos.length > 0 ? (
            filteredProcessos.map(proc => (
              <div key={proc.id} style={{ 
                padding: "12px", 
                borderBottom: "1px solid #eee",
                backgroundColor: "#f8f9fa",
                borderRadius: 8,
                marginBottom: 8
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: "bold", fontSize: 13 }}>
                      📄 {proc.numero_processo || `Processo ${proc.id}`}
                    </div>
                    <div style={{ fontSize: 11, color: "#666" }}>
                      👤 {proc.assistido || "Sem assistido"} • 
                      🏛️ {proc.usuario_responsavel || "Responsável não definido"}
                    </div>
                  </div>
                  <StatusBadge status={proc.status} />
                </div>
              </div>
            ))
          ) : (
            <div style={{ 
              textAlign: "center", 
              color: "#999", 
              padding: 30,
              backgroundColor: "#f8f9fa",
              borderRadius: 8
            }}>
              {searchTerm ? "🔍 Nenhum processo encontrado" : "📭 Nenhuma atividade recente"}
            </div>
          )}
        </div>
      </Card>

      {/* Estatísticas de Supervisão */}
      <Card title="📈 Estatísticas de Supervisão" color="#ffc107">
        <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
          <StatusProgressBar 
            label="🟢 Processos Abertos" 
            value={processosAbertos} 
            total={totalProcessos}
            color="#28a745" 
          />
          <StatusProgressBar 
            label="🟡 Em Andamento" 
            value={processosAndamento} 
            total={totalProcessos}
            color="#ffc107" 
          />
          <StatusProgressBar 
            label="✅ Finalizados" 
            value={processosFinalizados} 
            total={totalProcessos}
            color="#6c757d" 
          />
        </div>
        
        <div style={{ 
          marginTop: 15, 
          padding: 12, 
          backgroundColor: "#fff3cd", 
          borderRadius: 8,
          border: "1px solid #ffeaa7"
        }}>
          <div style={{ fontSize: 12, fontWeight: "bold", color: "#856404" }}>
            📊 Taxa de Conclusão: {totalProcessos > 0 ? ((processosFinalizados / totalProcessos) * 100).toFixed(1) : 0}%
          </div>
        </div>
      </Card>

      {/* Alertas e Status */}
      <Card title="⚠️ Alertas e Atenção" color="#dc3545">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ 
            padding: "12px", 
            backgroundColor: processosAbertos > 5 ? "#f8d7da" : "#d4edda", 
            borderRadius: 8,
            border: `1px solid ${processosAbertos > 5 ? "#f1aeb5" : "#c3e6cb"}`
          }}>
            <div style={{ fontWeight: "bold", fontSize: 14 }}>
              {processosAbertos > 5 ? "🚨" : "✅"} Processos Abertos
            </div>
            <div style={{ 
              color: processosAbertos > 5 ? "#721c24" : "#155724", 
              fontWeight: "bold", 
              fontSize: 20 
            }}>
              {processosAbertos}
            </div>
            <div style={{ fontSize: 11, color: "#666" }}>
              {processosAbertos > 5 ? "Muitos processos precisam de atenção" : "Quantidade adequada"}
            </div>
          </div>
          
          <div style={{ 
            padding: "12px", 
            backgroundColor: processosAndamento > 0 ? "#fff3cd" : "#f8f9fa", 
            borderRadius: 8,
            border: "1px solid #ffeaa7"
          }}>
            <div style={{ fontWeight: "bold", fontSize: 14 }}>
              ⏳ Processos em Andamento
            </div>
            <div style={{ color: "#856404", fontWeight: "bold", fontSize: 20 }}>
              {processosAndamento}
            </div>
            <div style={{ fontSize: 11, color: "#666" }}>
              {processosAndamento > 0 ? "Processos sendo trabalhados" : "Nenhum processo em andamento"}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Dashboard para Admins - Visão executiva
function AdminsDashboard({ data, searchTerm }) {
  const processos = data.processos || [];
  const processosRecentes = data.processosRecentes || [];
  const statusCounts = data.statusCounts || {};
  
  const totalProcessos = data.totalProcessos || 0;
  const totalUsuarios = data.totalUsuarios || 0;
  const processosAbertos = statusCounts['Aberto'] || 0;
  const processosAndamento = statusCounts['Em andamento'] || 0;
  const processosFinalizados = statusCounts['Finalizado'] || 0;
  
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
      {/* Visão Executiva do Sistema */}
      <Card title="🏢 Visão Executiva do Sistema" color="#007bff">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
          <StatItem label="Total de Processos" value={totalProcessos} icon="📁" />
          <StatItem label="Usuários Ativos" value={totalUsuarios} icon="👥" />
        </div>
        
        <div style={{ 
          padding: 15, 
          backgroundColor: "#e7f3ff", 
          borderRadius: 8,
          border: "1px solid #b3d7ff"
        }}>
          <div style={{ fontSize: 14, fontWeight: "bold", color: "#0056b3", textAlign: "center" }}>
            🎯 Sistema operacional com {totalUsuarios} usuários gerenciando {totalProcessos} processos
          </div>
        </div>
      </Card>

      {/* Estatísticas Visuais dos Processos */}
      <Card title="📊 Estatísticas dos Processos" color="#28a745">
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <PieChart data={[
            { label: "Abertos", value: processosAbertos, color: "#28a745" },
            { label: "Em Andamento", value: processosAndamento, color: "#ffc107" },
            { label: "Finalizados", value: processosFinalizados, color: "#6c757d" }
          ]} />
        </div>
        
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <StatusProgressBar 
            label="🟢 Abertos" 
            value={processosAbertos} 
            total={totalProcessos}
            color="#28a745" 
          />
          <StatusProgressBar 
            label="🟡 Em Andamento" 
            value={processosAndamento} 
            total={totalProcessos}
            color="#ffc107" 
          />
          <StatusProgressBar 
            label="✅ Finalizados" 
            value={processosFinalizados} 
            total={totalProcessos}
            color="#6c757d" 
          />
        </div>
      </Card>

      {/* Atividade do Sistema */}
      <Card title="🕒 Atividade Recente do Sistema" color="#ffc107">
        <div style={{ maxHeight: 220, overflowY: "auto" }}>
          {processosRecentes.length > 0 ? (
            processosRecentes.map(proc => (
              <div key={proc.id} style={{ 
                padding: "12px", 
                borderBottom: "1px solid #eee",
                backgroundColor: "#fffbf0",
                borderRadius: 8,
                marginBottom: 8
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: "bold", fontSize: 13 }}>
                      📄 {proc.numero_processo || `Processo ${proc.id}`}
                    </div>
                    <div style={{ fontSize: 11, color: "#666" }}>
                      👤 {proc.assistido || "Sem assistido"} • 
                      🏛️ {proc.usuario_responsavel || "Sem responsável"}
                    </div>
                    <div style={{ fontSize: 10, color: "#999" }}>
                      📅 {proc.updatedAt 
                        ? new Date(proc.updatedAt).toLocaleDateString('pt-BR')
                        : new Date(proc.criado_em).toLocaleDateString('pt-BR')
                      }
                    </div>
                  </div>
                  <StatusBadge status={proc.status} />
                </div>
              </div>
            ))
          ) : (
            <div style={{ 
              textAlign: "center", 
              color: "#999", 
              padding: 30,
              backgroundColor: "#fffbf0",
              borderRadius: 8
            }}>
              📭 Nenhuma atividade recente registrada
            </div>
          )}
        </div>
      </Card>

      {/* Indicadores de Performance */}
      <Card title="📈 Indicadores de Performance" color="#6f42c1">
        <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
          <div style={{ 
            padding: "15px", 
            backgroundColor: "#f8f4ff", 
            borderRadius: 8,
            border: "1px solid #e1d4ff"
          }}>
            <div style={{ fontWeight: "bold", fontSize: 14, color: "#6f42c1" }}>
              🎯 Taxa de Conclusão Geral
            </div>
            <div style={{ color: "#28a745", fontWeight: "bold", fontSize: 24 }}>
              {totalProcessos > 0 ? ((processosFinalizados / totalProcessos) * 100).toFixed(1) : 0}%
            </div>
            <div style={{ fontSize: 11, color: "#666" }}>
              {processosFinalizados} de {totalProcessos} processos finalizados
            </div>
          </div>
          
          <div style={{ 
            padding: "15px", 
            backgroundColor: processosAbertos > 10 ? "#fff5f5" : "#f0fff4", 
            borderRadius: 8,
            border: `1px solid ${processosAbertos > 10 ? "#fed7d7" : "#c6f6d5"}`
          }}>
            <div style={{ fontWeight: "bold", fontSize: 14 }}>
              {processosAbertos > 10 ? "⚠️" : "✅"} Processos Ativos
            </div>
            <div style={{ 
              color: processosAbertos > 10 ? "#e53e3e" : "#38a169", 
              fontWeight: "bold", 
              fontSize: 24 
            }}>
              {processosAbertos + processosAndamento}
            </div>
            <div style={{ fontSize: 11, color: "#666" }}>
              {processosAbertos} abertos + {processosAndamento} em andamento
            </div>
          </div>

          <div style={{ 
            padding: "15px", 
            backgroundColor: "#f7fafc", 
            borderRadius: 8,
            border: "1px solid #e2e8f0"
          }}>
            <div style={{ fontWeight: "bold", fontSize: 14 }}>
              👥 Eficiência por Usuário
            </div>
            <div style={{ color: "#4a5568", fontWeight: "bold", fontSize: 24 }}>
              {totalUsuarios > 0 ? (totalProcessos / totalUsuarios).toFixed(1) : 0}
            </div>
            <div style={{ fontSize: 11, color: "#666" }}>
              Processos por usuário em média
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Componentes auxiliares
function Card({ title, children, color = "#007bff" }) {
  return (
    <div style={{
      border: "1px solid #ddd",
      borderRadius: 12,
      padding: 20,
      backgroundColor: "white",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      borderTop: `4px solid ${color}`
    }}>
      <h3 style={{ margin: "0 0 15px 0", color: color, fontSize: 16 }}>{title}</h3>
      {children}
    </div>
  );
}

function StatItem({ label, value, color = "#333", icon = "" }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 24, fontWeight: "bold", color }}>
        {icon && <span style={{ marginRight: 8 }}>{icon}</span>}
        {value}
      </div>
      <div style={{ fontSize: 13, color: "#666", marginTop: 4 }}>{label}</div>
    </div>
  );
}

function StatusBadge({ status }) {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "em_andamento": return "#ffc107";
      case "aguardando": return "#fd7e14";
      case "finalizado": return "#28a745";
      case "arquivado": return "#6c757d";
      default: return "#007bff";
    }
  };

  const getStatusLabel = (status) => {
    switch (status?.toLowerCase()) {
      case "em_andamento": return "Em Andamento";
      case "aguardando": return "Aguardando";
      case "finalizado": return "Finalizado";
      case "arquivado": return "Arquivado";
      default: return status || "Não Definido";
    }
  };

  return (
    <span style={{
      backgroundColor: getStatusColor(status),
      color: "white",
      padding: "4px 8px",
      borderRadius: 12,
      fontSize: 11,
      fontWeight: "bold",
      textTransform: "uppercase"
    }}>
      {getStatusLabel(status)}
    </span>
  );
}

function PieChart({ data, title }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: 20, color: "#666" }}>
        <p>Sem dados para exibir</p>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;

  const colors = ["#007bff", "#28a745", "#ffc107", "#dc3545", "#6c757d", "#17a2b8"];

  return (
    <div style={{ textAlign: "center" }}>
      {title && <h4 style={{ marginBottom: 16, color: "#333" }}>{title}</h4>}
      
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* Chart */}
        <div style={{ position: "relative" }}>
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="#e9ecef"
              strokeWidth="12"
            />
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100;
              const angle = (item.value / total) * 360;
              const largeArcFlag = angle > 180 ? 1 : 0;
              
              const startX = 60 + 54 * Math.cos((currentAngle - 90) * Math.PI / 180);
              const startY = 60 + 54 * Math.sin((currentAngle - 90) * Math.PI / 180);
              
              currentAngle += angle;
              
              const endX = 60 + 54 * Math.cos((currentAngle - 90) * Math.PI / 180);
              const endY = 60 + 54 * Math.sin((currentAngle - 90) * Math.PI / 180);
              
              if (item.value === 0) return null;
              
              return (
                <path
                  key={index}
                  d={`M 60 60 L ${startX} ${startY} A 54 54 0 ${largeArcFlag} 1 ${endX} ${endY} Z`}
                  fill={colors[index % colors.length]}
                  opacity="0.8"
                />
              );
            })}
          </svg>
        </div>

        {/* Legend */}
        <div style={{ flex: 1, marginLeft: 20 }}>
          {data.map((item, index) => (
            <div key={index} style={{ 
              display: "flex", 
              alignItems: "center", 
              marginBottom: 8,
              fontSize: 12
            }}>
              <div style={{
                width: 12,
                height: 12,
                backgroundColor: colors[index % colors.length],
                borderRadius: "50%",
                marginRight: 8,
                opacity: 0.8
              }}></div>
              <span style={{ flex: 1 }}>{item.label}</span>
              <span style={{ fontWeight: "bold", marginLeft: 8 }}>
                {item.value} ({total > 0 ? ((item.value / total) * 100).toFixed(1) : 0}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatRow({ label, value, total, color = "#007bff" }) {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
          <span>{label}</span>
          <span style={{ fontWeight: "bold" }}>{value}</span>
        </div>
        {total && (
          <div style={{ 
            backgroundColor: "#e9ecef", 
            borderRadius: 10, 
            height: 4, 
            overflow: "hidden",
            marginTop: 2
          }}>
            <div style={{
              backgroundColor: color,
              height: "100%",
              width: `${percentage}%`,
              transition: "width 0.3s ease"
            }}></div>
          </div>
        )}
      </div>
    </div>
  );
}

function PieChart({ data }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  if (total === 0) {
    return (
      <div style={{ textAlign: "center", color: "#999", padding: 20 }}>
        <div style={{ fontSize: 14 }}>Nenhum dado disponível</div>
      </div>
    );
  }
  
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
        <div style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: `conic-gradient(
            ${data[0]?.color || "#28a745"} 0deg ${(data[0]?.value || 0) / total * 360}deg,
            ${data[1]?.color || "#ffc107"} ${(data[0]?.value || 0) / total * 360}deg ${((data[0]?.value || 0) + (data[1]?.value || 0)) / total * 360}deg,
            ${data[2]?.color || "#6c757d"} ${((data[0]?.value || 0) + (data[1]?.value || 0)) / total * 360}deg 360deg
          )`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <div style={{
            width: 50,
            height: 50,
            borderRadius: "50%",
            backgroundColor: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: "bold"
          }}>
            {total}
          </div>
        </div>
      </div>
      {data.map((item, index) => (
        <div key={index} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
          <div style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            backgroundColor: item.color
          }}></div>
          <span>{item.label}: {item.value}</span>
        </div>
      ))}
    </div>
  );
}