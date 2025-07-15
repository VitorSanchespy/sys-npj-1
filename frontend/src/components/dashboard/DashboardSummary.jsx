import React, { useEffect, useState } from "react";
import { apiRequest } from "@/api/apiRequest";
import { useAuthContext } from "@/contexts/AuthContext";

export default function DashboardSummary() {
  const { token, user } = useAuthContext();
  const [data, setData] = useState({
    processos: 0,
    alunos: 0,
    professores: 0,
    admins: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        let processos = [];
        if (user?.role === "Aluno") {
          processos = await apiRequest("/api/processos/meus-processos", { token });
        } else if (user?.role === "Professor") {
          processos = await apiRequest("/api/processos", { token });
        } else if (user?.role === "Admin") {
          processos = await apiRequest("/api/processos", { token });
        }
        let usuarios = [];
        if (user?.role === "Admin" || user?.role === "Professor") {
          usuarios = await apiRequest("/api/usuarios", { token });
        }
        setData({
          processos: processos.length,
          alunos: usuarios.filter ? usuarios.filter(u => u.role === "Aluno").length : 0,
          professores: usuarios.filter ? usuarios.filter(u => u.role === "Professor").length : 0,
          admins: usuarios.filter ? usuarios.filter(u => u.role === "Admin").length : 0,
        });
      } catch {
        setData({ processos: 0, alunos: 0, professores: 0, admins: 0 });
      }
      setLoading(false);
    }
    if (user?.role) fetchDashboard();
  }, [token, user]);

  if (loading) return <div>Carregando painel...</div>;

  return (
    <div>
      <h2>Painel</h2>
      <div style={{ display: "flex", gap: 16, marginBottom: 32 }}>
        <Card title="Processos" value={data.processos} />
        {(user?.role === "Admin" || user?.role === "Professor") && <Card title="Alunos" value={data.alunos} />}
        {(user?.role === "Admin" || user?.role === "Professor") && <Card title="Professores" value={data.professores} />}
        {user?.role === "Admin" && <Card title="Admins" value={data.admins} />}
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