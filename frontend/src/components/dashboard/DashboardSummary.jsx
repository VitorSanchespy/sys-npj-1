import React, { useEffect, useState } from "react";
import { apiRequest } from "../../api/apiRequest";
import { useAuthContext } from "../../contexts/AuthContext";

export default function DashboardSummary() {
  const { token, user } = useAuthContext();
  const [data, setData] = useState({
    processos: [],
    usuarios: [],
    atualizacoes: [],
    alertas: 0,
    estatisticas: {
      totalProcessos: 0,
      processosAbertos: 0,
      processosAndamento: 0,
      processosFinalizados: 0,
      totalUsuarios: 0,
      totalAlunos: 0,
      totalProfessores: 0,
      totalAdmins: 0,
      sistemaFisico: 0,
      sistemaPEA: 0,
      sistemaPJE: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPeriod, setFilterPeriod] = useState("30");
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    async function fetchDashboard() {
      try {
        let processos = [];
        let usuarios = [];
        let atualizacoes = [];

        // Buscar processos baseado no role
        if (user?.role === "Aluno") {
          processos = await apiRequest("/api/processos/meus-processos", { token });
        } else if (user?.role === "Professor") {
          processos = await apiRequest("/api/processos", { token });
        } else if (user?.role === "Admin") {
          processos = await apiRequest("/api/processos", { token });
        }

        // Buscar usuários para Professor/Admin
        if (user?.role === "Admin") {
          try {
            const usersResponse = await apiRequest("/api/usuarios/pagina", { token });
            usuarios = usersResponse?.usuarios || usersResponse?.data || [];
          } catch (err) {
            console.log("Erro ao buscar usuários (admin):", err);
            // Fallback: tentar endpoint simples
            try {
              usuarios = await apiRequest("/api/usuarios", { token });
            } catch (err2) {
              console.log("Erro no fallback de usuários:", err2);
              usuarios = [];
            }
          }
        } else if (user?.role === "Professor") {
          try {
            // Professores só veem alunos
            usuarios = await apiRequest("/api/usuarios/alunos", { token });
          } catch (err) {
            console.log("Erro ao buscar alunos:", err);
            usuarios = [];
          }
        }

        // Buscar atualizações recentes
        try {
          atualizacoes = await apiRequest("/api/atualizacoes?limite=5", { token });
        } catch (err) {
          console.log("Erro ao buscar atualizações:", err);
          atualizacoes = [];
        }

        // Calcular estatísticas
        const stats = calculateStatistics(processos, usuarios);

        setData({
          processos: processos || [],
          usuarios: usuarios || [],
          atualizacoes: atualizacoes || [],
          alertas: calculateAlerts(processos || []),
          estatisticas: stats
        });
      } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
        setData({ 
          processos: [], 
          usuarios: [], 
          atualizacoes: [], 
          alertas: 0,
          estatisticas: {
            totalProcessos: 0, processosAbertos: 0, processosAndamento: 0, processosFinalizados: 0,
            totalUsuarios: 0, totalAlunos: 0, totalProfessores: 0, totalAdmins: 0,
            sistemaFisico: 0, sistemaPEA: 0, sistemaPJE: 0
          }
        });
      }
      setLoading(false);
    }
    if (user?.role && token) fetchDashboard();
  }, [token, user]);

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

  const handleGlobalSearch = (e) => {
    setSearchTerm(e.target.value);
    // Apenas visual - não navega
  };

  if (loading) return <div style={{ padding: 20 }}>Carregando painel...</div>;

  return (
    <div style={{ padding: 20, maxWidth: 1200, margin: "0 auto" }}>
      {/* Header com busca global e filtros */}
      <div style={{ marginBottom: 30 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h1 style={{ margin: 0, color: "#333" }}>Dashboard - Sistema NPJ</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
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
            placeholder="Busca visual: digite para filtrar dados..."
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
      {user?.role === "Aluno" && <AlunosDashboard data={data} searchTerm={searchTerm} />}
      {user?.role === "Professor" && <ProfessoresDashboard data={data} searchTerm={searchTerm} />}
      {user?.role === "Admin" && <AdminsDashboard data={data} searchTerm={searchTerm} />}
    </div>
  );
}

// Dashboard para Alunos
function AlunosDashboard({ data, searchTerm }) {
  const processos = data.processos || [];
  const stats = data.estatisticas;
  
  // Filtrar processos baseado na busca
  const filteredProcessos = searchTerm ? 
    processos.filter(p => 
      p.numero_processo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.assistido?.toLowerCase().includes(searchTerm.toLowerCase())
    ) : processos;

  const progresso = stats.totalProcessos > 0 ? (stats.processosFinalizados / stats.totalProcessos) * 100 : 0;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
      {/* Card Meus Processos */}
      <Card title="Meus Processos" color="#007bff">
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 15 }}>
          <StatItem label="Total" value={stats.totalProcessos} />
          <StatItem label="Abertos" value={stats.processosAbertos} color="#28a745" />
          <StatItem label="Em Andamento" value={stats.processosAndamento} color="#ffc107" />
          <StatItem label="Finalizados" value={stats.processosFinalizados} color="#6c757d" />
        </div>
        <div>
          <div style={{ fontSize: 12, color: "#666", marginBottom: 5 }}>
            Progresso: {progresso.toFixed(1)}%
          </div>
          <div style={{ 
            backgroundColor: "#e9ecef", 
            borderRadius: 10, 
            height: 8, 
            overflow: "hidden" 
          }}>
            <div style={{
              backgroundColor: "#28a745",
              height: "100%",
              width: `${progresso}%`,
              transition: "width 0.3s ease"
            }}></div>
          </div>
        </div>
      </Card>

      {/* Card Próximas Diligências */}
      <Card title="Processos Recentes" color="#28a745">
        <div style={{ fontSize: 14, color: "#666" }}>
          {filteredProcessos.length > 0 ? (
            filteredProcessos.slice(0, 3).map(proc => (
              <div key={proc.id} style={{ 
                padding: "8px 0", 
                borderBottom: "1px solid #eee",
                display: "flex",
                justifyContent: "space-between"
              }}>
                <span style={{ fontSize: 12, fontWeight: "bold" }}>
                  {proc.numero_processo || `Proc. ${proc.id}`}
                </span>
                <StatusBadge status={proc.status} />
              </div>
            ))
          ) : (
            <div style={{ textAlign: "center", color: "#999" }}>
              {searchTerm ? "Nenhum processo encontrado na busca" : "Nenhum processo encontrado"}
            </div>
          )}
        </div>
      </Card>

      {/* Card Últimas Atualizações */}
      <Card title="Últimas Atualizações" color="#ffc107">
        <div style={{ fontSize: 14 }}>
          {data.atualizacoes && data.atualizacoes.length > 0 ? (
            data.atualizacoes.slice(0, 3).map((att, index) => (
              <div key={index} style={{ 
                padding: "8px 0", 
                borderBottom: "1px solid #eee" 
              }}>
                <div style={{ fontWeight: "bold" }}>
                  {att.tipo_atualizacao || "Atualização"}
                </div>
                <div style={{ fontSize: 12, color: "#666" }}>
                  {att.processo?.numero_processo || "Processo"} - {att.descricao || "Nova atualização"}
                </div>
                <div style={{ fontSize: 11, color: "#999" }}>
                  {att.data_atualizacao 
                    ? new Date(att.data_atualizacao).toLocaleDateString('pt-BR')
                    : "Data não disponível"
                  }
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: "center", color: "#999" }}>
              Nenhuma atualização recente
            </div>
          )}
        </div>
      </Card>

      {/* Card Status dos Processos */}
      <Card title="Visão Geral dos Status" color="#6f42c1">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <StatRow label="Abertos" value={stats.processosAbertos} color="#28a745" />
          <StatRow label="Em Andamento" value={stats.processosAndamento} color="#ffc107" />
          <StatRow label="Finalizados" value={stats.processosFinalizados} color="#6c757d" />
        </div>
      </Card>
    </div>
  );
}

// Dashboard para Professores
function ProfessoresDashboard({ data, searchTerm }) {
  const processos = data.processos || [];
  const usuarios = data.usuarios || [];
  const stats = data.estatisticas;
  
  // Filtrar dados baseado na busca
  const filteredProcessos = searchTerm ? 
    processos.filter(p => 
      p.numero_processo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.assistido?.toLowerCase().includes(searchTerm.toLowerCase())
    ) : processos;

  const filteredAlunos = searchTerm ? 
    usuarios.filter(u => 
      u.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    ) : usuarios;
  
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
      {/* Card Processos sob Supervisão */}
      <Card title="Processos sob Supervisão" color="#007bff">
        <PieChart data={[
          { label: "Abertos", value: stats.processosAbertos, color: "#28a745" },
          { label: "Em Andamento", value: stats.processosAndamento, color: "#ffc107" },
          { label: "Finalizados", value: stats.processosFinalizados, color: "#6c757d" }
        ]} />
        <div style={{ marginTop: 15, textAlign: "center" }}>
          <div style={{ fontSize: 12, color: "#666" }}>
            Total: {stats.totalProcessos} processos
          </div>
        </div>
      </Card>

      {/* Card Alunos Orientados */}
      <Card title="Alunos Orientados" color="#28a745">
        <div style={{ marginBottom: 15 }}>
          <StatItem label="Total de Alunos" value={stats.totalAlunos} />
        </div>
        <div style={{ fontSize: 14, maxHeight: 150, overflowY: "auto" }}>
          {filteredAlunos.slice(0, 5).map(aluno => (
            <div key={aluno.id} style={{ 
              padding: "5px 0", 
              display: "flex", 
              justifyContent: "space-between",
              borderBottom: "1px solid #eee"
            }}>
              <span style={{ fontSize: 12 }}>{aluno.nome}</span>
              <span style={{ color: "#007bff", fontSize: 11 }}>
                {processos.filter(p => p.idusuario_responsavel === aluno.id).length} proc.
              </span>
            </div>
          ))}
          {filteredAlunos.length === 0 && (
            <div style={{ textAlign: "center", color: "#999", fontSize: 12 }}>
              {searchTerm ? "Nenhum aluno encontrado na busca" : "Nenhum aluno encontrado"}
            </div>
          )}
        </div>
      </Card>

      {/* Card Tramitação por Local */}
      <Card title="Tramitação por Sistema" color="#ffc107">
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <StatRow 
            label="Físico" 
            value={stats.sistemaFisico}
            total={stats.totalProcessos}
            color="#007bff"
          />
          <StatRow 
            label="PEA" 
            value={stats.sistemaPEA}
            total={stats.totalProcessos}
            color="#28a745"
          />
          <StatRow 
            label="PJE" 
            value={stats.sistemaPJE}
            total={stats.totalProcessos}
            color="#ffc107"
          />
        </div>
      </Card>

      {/* Card Alertas de Supervisão */}
      <Card title="Alertas de Supervisão" color="#dc3545">
        <div style={{ fontSize: 14 }}>
          <div style={{ padding: "10px 0", borderBottom: "1px solid #eee" }}>
            <div style={{ fontWeight: "bold" }}>Processos sem atualização:</div>
            <div style={{ color: "#dc3545", fontWeight: "bold", fontSize: 18 }}>
              {data.alertas} processos
            </div>
            <div style={{ fontSize: 11, color: "#666" }}>
              Há mais de 30 dias
            </div>
          </div>
          <div style={{ padding: "10px 0" }}>
            <div style={{ fontWeight: "bold" }}>Processos Abertos:</div>
            <div style={{ color: "#ffc107", fontWeight: "bold", fontSize: 18 }}>
              {stats.processosAbertos}
            </div>
            <div style={{ fontSize: 11, color: "#666" }}>
              Precisam de atenção
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Dashboard para Admins
function AdminsDashboard({ data, searchTerm }) {
  const processos = data.processos || [];
  const usuarios = data.usuarios || [];
  const stats = data.estatisticas;
  
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
      {/* Card Visão Geral do Sistema */}
      <Card title="Visão Geral do Sistema" color="#007bff">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15 }}>
          <StatItem label="Processos" value={stats.totalProcessos} />
          <StatItem label="Usuários" value={stats.totalUsuarios} />
          <StatItem label="Professores" value={stats.totalProfessores} />
          <StatItem label="Alunos" value={stats.totalAlunos} />
        </div>
        <div style={{ marginTop: 15, padding: "10px", backgroundColor: "#f8f9fa", borderRadius: 5 }}>
          <div style={{ fontSize: 12, color: "#666", textAlign: "center" }}>
            Sistema operando com {stats.totalUsuarios} usuários ativos
          </div>
        </div>
      </Card>

      {/* Card Estatísticas de Processos */}
      <Card title="Estatísticas de Processos" color="#28a745">
        <div style={{ marginBottom: 15 }}>
          <PieChart data={[
            { label: "Abertos", value: stats.processosAbertos, color: "#28a745" },
            { label: "Andamento", value: stats.processosAndamento, color: "#ffc107" },
            { label: "Finalizados", value: stats.processosFinalizados, color: "#6c757d" }
          ]} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 12 }}>
          <StatRow label="Físico" value={stats.sistemaFisico} total={stats.totalProcessos} color="#007bff" />
          <StatRow label="PEA" value={stats.sistemaPEA} total={stats.totalProcessos} color="#28a745" />
          <StatRow label="PJE" value={stats.sistemaPJE} total={stats.totalProcessos} color="#ffc107" />
        </div>
      </Card>

      {/* Card Atividade do Sistema */}
      <Card title="Atividade Recente" color="#ffc107">
        <div style={{ fontSize: 14, maxHeight: 200, overflowY: "auto" }}>
          {data.atualizacoes && data.atualizacoes.length > 0 ? (
            data.atualizacoes.slice(0, 4).map((att, index) => (
              <div key={index} style={{ 
                padding: "8px 0", 
                borderBottom: "1px solid #eee" 
              }}>
                <div style={{ fontWeight: "bold", fontSize: 12 }}>
                  {att.tipo_atualizacao || "Atividade do Sistema"}
                </div>
                <div style={{ fontSize: 11, color: "#666" }}>
                  {att.processo?.numero_processo || "Sistema"} - {att.usuario?.nome || "Usuário"}
                </div>
                <div style={{ fontSize: 10, color: "#999" }}>
                  {att.data_atualizacao 
                    ? new Date(att.data_atualizacao).toLocaleDateString('pt-BR')
                    : "Hoje"
                  }
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: "center", color: "#999" }}>
              Nenhuma atividade recente
            </div>
          )}
        </div>
      </Card>

      {/* Card Indicadores do Sistema */}
      <Card title="Indicadores do Sistema" color="#6f42c1">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ padding: "8px", backgroundColor: "#f8f9fa", borderRadius: 5 }}>
            <div style={{ fontWeight: "bold", fontSize: 12 }}>Alertas Ativos</div>
            <div style={{ color: "#dc3545", fontWeight: "bold", fontSize: 16 }}>
              {data.alertas}
            </div>
            <div style={{ fontSize: 10, color: "#666" }}>
              Processos sem atualização há mais de 30 dias
            </div>
          </div>
          
          <div style={{ padding: "8px", backgroundColor: "#f8f9fa", borderRadius: 5 }}>
            <div style={{ fontWeight: "bold", fontSize: 12 }}>Taxa de Conclusão</div>
            <div style={{ color: "#28a745", fontWeight: "bold", fontSize: 16 }}>
              {stats.totalProcessos > 0 ? ((stats.processosFinalizados / stats.totalProcessos) * 100).toFixed(1) : 0}%
            </div>
            <div style={{ fontSize: 10, color: "#666" }}>
              Processos finalizados vs total
            </div>
          </div>

          <div style={{ padding: "8px", backgroundColor: "#f8f9fa", borderRadius: 5 }}>
            <div style={{ fontWeight: "bold", fontSize: 12 }}>Processos Ativos</div>
            <div style={{ color: "#ffc107", fontWeight: "bold", fontSize: 16 }}>
              {stats.processosAbertos + stats.processosAndamento}
            </div>
            <div style={{ fontSize: 10, color: "#666" }}>
              Abertos + Em andamento
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

function StatItem({ label, value, color = "#333" }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 20, fontWeight: "bold", color }}>{value}</div>
      <div style={{ fontSize: 12, color: "#666" }}>{label}</div>
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

function StatusBadge({ status }) {
  const getStatusColor = (status) => {
    switch(status) {
      case "Aberto": return { bg: "#d4edda", color: "#155724" };
      case "Em andamento": return { bg: "#fff3cd", color: "#856404" };
      case "Finalizado": return { bg: "#f8d7da", color: "#721c24" };
      default: return { bg: "#e9ecef", color: "#6c757d" };
    }
  };

  const { bg, color } = getStatusColor(status);

  return (
    <span style={{
      padding: '2px 6px',
      borderRadius: 4,
      fontSize: 10,
      backgroundColor: bg,
      color: color
    }}>
      {status || "N/A"}
    </span>
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