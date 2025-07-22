import React, { useEffect, useState, useCallback } from "react";
import { apiRequest } from "@/api/apiRequest";
import { useAuthContext } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import FullProcessCreateForm from "@/components/FullProcessCreateForm";

function ProcessosTable({ processos }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {processos.map((processo) => (
        <div key={processo.id} style={{
          border: '1px solid #e0e0e0',
          borderRadius: 8,
          padding: 16,
          background: '#fafbfc',
          boxShadow: '0 2px 8px #f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>
              <Link to={`/processos/${processo.id}`} style={{ color: '#1976d2', textDecoration: 'none' }}>
                {processo.numero_processo || processo.numero || "-"}
              </Link>
            </div>
            <div style={{ color: '#444', marginTop: 4 }}>{processo.descricao || "-"}</div>
            {processo.status && (
              <span style={{
                display: 'inline-block',
                marginTop: 6,
                fontSize: 13,
                color: processo.status === 'Concluído' ? '#388e3c' : '#1976d2',
                background: processo.status === 'Concluído' ? '#e8f5e9' : '#e3f2fd',
                borderRadius: 4,
                padding: '2px 8px',
                fontWeight: 500
              }}>{processo.status}</span>
            )}
          </div>
          <div>
            <Link to={`/processos/${processo.id}`} style={{
              background: '#1976d2',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              padding: '6px 16px',
              textDecoration: 'none',
              fontWeight: 500,
              fontSize: 15
            }}>Detalhes</Link>
          </div>
        </div>
      ))}
    </div>
  );
}


export default function ProcessListPage() {
  const navigate = useNavigate();
  const { token, user } = useAuthContext();
  const [processos, setProcessos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProcessos = useCallback(async () => {
    setLoading(true);
    setError("");
    console.log("[ProcessListPage] Token atual:", token);
    console.log("[ProcessListPage] User atual:", user);
    
    if (!token) {
      console.warn("[ProcessListPage] Token não disponível!");
      setError("Token de autenticação não disponível.");
      setLoading(false);
      return;
    }
    
    try {
      let data = [];
      // role_id: 2 = Aluno, role_id: 3 = Professor, role_id: 1 = Admin
      if (user?.role_id === 2) {
        console.log("[ProcessListPage] Fazendo requisição para /meus-processos com token:", token);
        data = await apiRequest("/api/processos/meus-processos", { token });
        console.log("[ProcessListPage] (Aluno) Dados recebidos de /meus-processos:", data);
      } else if (user?.role_id === 3 || user?.role_id === 1) {
        console.log("[ProcessListPage] Fazendo requisição para /api/processos com token:", token);
        data = await apiRequest("/api/processos", { token });
        console.log("[ProcessListPage] (Professor/Admin) Dados recebidos de /api/processos:", data);
      }
      setProcessos(data);
      console.log("[ProcessListPage] Estado processos após setProcessos:", data);
    } catch (err) {
      setProcessos([]);
      setError("Erro ao carregar processos.");
      console.error("[ProcessListPage] Erro ao buscar processos:", err);
    }
    setLoading(false);
  }, [token, user]);

  useEffect(() => {
    console.log("[ProcessListPage] useEffect disparado - user:", user, "token:", token);
    if (user?.role_id && token) {
      console.log("[ProcessListPage] Condições atendidas, chamando fetchProcessos");
      fetchProcessos();
    } else {
      console.log("[ProcessListPage] Condições NÃO atendidas - user.role_id:", user?.role_id, "token:", !!token);
    }
  }, [fetchProcessos, user, token]);

  if (loading) return <div style={{ padding: 24 }}>Carregando processos...</div>;
  if (error) return <div style={{ color: "red", padding: 24 }}>{error}</div>;

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        Processos
        {user?.role_id === 3 && (
          <button onClick={() => navigate('/processos/novo')} style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 16px', fontWeight: 500, fontSize: 15 }}>Novo Processo</button>
        )}
      </h2>
      {processos.length === 0 ? (
        <p>Nenhum processo encontrado.</p>
      ) : (
        <ProcessosTable processos={processos} />
      )}
    </div>
  );
}