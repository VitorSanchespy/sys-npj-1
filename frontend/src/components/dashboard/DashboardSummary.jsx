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
    // Remover ultimosProcessos e ultimasAtualizacoes se não existirem endpoints
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const processos = await apiRequest("/api/processos", { token });
        const usuarios = await apiRequest("/api/usuarios", { token });
        setData({
          processos: processos.length,
          alunos: usuarios.filter(u => u.role === "Aluno").length,
          professores: usuarios.filter(u => u.role === "Professor").length,
          admins: usuarios.filter(u => u.role === "Admin").length,
        });
      } catch {}
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