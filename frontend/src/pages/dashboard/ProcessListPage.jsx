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
    try {
      let data = [];
      if (user?.role === "Aluno") {
        data = await apiRequest("/api/processos/meus-processos", { token });
      } else if (user?.role === "Professor" || user?.role === "Admin") {
        data = await apiRequest("/api/processos", { token });
      }
      setProcessos(data);
    } catch (err) {
      setProcessos([]);
      setError("Erro ao carregar processos.");
    }
    setLoading(false);
  }, [token, user]);

  useEffect(() => {
    if (user?.role) fetchProcessos();
  }, [fetchProcessos, user]);

  if (loading) return <div style={{ padding: 24 }}>Carregando processos...</div>;
  if (error) return <div style={{ color: "red", padding: 24 }}>{error}</div>;

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        Processos
        {user?.role === "Professor" && (
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