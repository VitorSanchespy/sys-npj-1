import React, { useEffect, useState } from "react";
import { processService, userService } from "../../api/services";
import { useAuthContext } from "../../contexts/AuthContext";

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
          processos = await processService.getMyProcesses(token);
        } else if (user?.role === "Professor") {
          processos = await processService.getAllProcesses(token);
        } else if (user?.role === "Admin") {
          processos = await processService.getAllProcesses(token);
        }
        let usuarios = [];
        if (user?.role === "Admin") {
          usuarios = await userService.getAllUsers(token);
        } else if (user?.role === "Professor") {
          usuarios = await userService.getStudents(token);
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
    <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 32 }}>
      <Card title="Processos" value={data.processos} />
      <Card title="Alunos" value={data.alunos} />
      <Card title="Professores" value={data.professores} />
      <Card title="Admins" value={data.admins} />
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