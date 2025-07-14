import React, { useEffect, useState } from "react";
import { apiRequest } from "../../api/apiRequest";
import { useAuthContext } from "../../contexts/AuthContext";

export default function DashboardSummary() {
  const { token } = useAuthContext();
  const [data, setData] = useState({
    processos: 0,
    alunos: 0,
    professores: 0,
    admins: 0,
    atualizacoes: 0,
    ultimosProcessos: [],
    ultimasAtualizacoes: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const dashboard = await apiRequest("/api/dashboard", { token });
        setData(dashboard);
      } catch {
        // fallback caso a API não tenha endpoint /dashboard:
        try {
          const [procs, users, atualizacoes] = await Promise.all([
            apiRequest("/api/processos", { token }),
            apiRequest("/api/usuarios", { token }),
            apiRequest("/api/atualizacoes", { token }),
          ]);
          setData({
            processos: procs.length,
            alunos: users.filter(u => u.role === "aluno").length,
            professores: users.filter(u => u.role === "professor").length,
            admins: users.filter(u => u.role === "admin").length,
            atualizacoes: atualizacoes.length,
            ultimosProcessos: procs.slice(-5).reverse(),
            ultimasAtualizacoes: atualizacoes.slice(-5).reverse(),
          });
        } catch {}
      }
      setLoading(false);
    }
    fetchDashboard();
  }, [token]);

  if (loading) return <div>Carregando painel...</div>;

  return (
    <div>
      <h2>Painel</h2>
      <div style={{ display: "flex", gap: 16, marginBottom: 32 }}>
        <Card title="Processos" value={data.processos} />
        <Card title="Alunos" value={data.alunos} />
        <Card title="Professores" value={data.professores} />
        <Card title="Admins" value={data.admins} />
        <Card title="Atualizações" value={data.atualizacoes} />
      </div>
      <div style={{ display: "flex", gap: 32 }}>
        <div style={{ flex: 1 }}>
          <h3>Últimos Processos</h3>
          <ul>
            {data.ultimosProcessos.length === 0 && <li>Nenhum processo recente.</li>}
            {data.ultimosProcessos.map(proc => (
              <li key={proc.id}>
                {proc.numero} — {proc.nome} ({proc.status})
              </li>
            ))}
          </ul>
        </div>
        <div style={{ flex: 1 }}>
          <h3>Últimas Atualizações</h3>
          <ul>
            {data.ultimasAtualizacoes.length === 0 && <li>Nenhuma atualização recente.</li>}
            {data.ultimasAtualizacoes.map(upd => (
              <li key={upd.id}>
                <b>{upd.titulo}</b> em {new Date(upd.criado_em).toLocaleString()}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div style={{
      border: "1px solid #ddd",
      borderRadius: 8,
      padding: 16,
      width: 140,
      boxShadow: "2px 2px 8px #eee",
      background: "#fafafa"
    }}>
      <div style={{ fontSize: 22, fontWeight: 600 }}>{value}</div>
      <div style={{ color: "#555" }}>{title}</div>
    </div>
  );
}