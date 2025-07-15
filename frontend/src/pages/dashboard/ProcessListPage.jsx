
import React, { useEffect, useState, useCallback } from "react";
function NovoProcessoModal({ open, onClose, onCreated, token }) {
  const [numero_processo, setNumero] = useState("");
  const [descricao, setDescricao] = useState("");
  const [status, setStatus] = useState("");
  const [tipo_processo, setTipo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const statusOptions = [
    { value: "Em andamento", label: "Em andamento" },
    { value: "Concluído", label: "Concluído" },
    { value: "Suspenso", label: "Suspenso" }
  ];
  const tipoOptions = [
    { value: "Cível", label: "Cível" },
    { value: "Penal", label: "Penal" },
    { value: "Trabalhista", label: "Trabalhista" },
    { value: "Administrativo", label: "Administrativo" }
  ];

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await apiRequest("/api/processos", {
        method: "POST",
        token,
        body: { numero_processo, descricao, status, tipo_processo }
      });
      onCreated();
      onClose();
    } catch (err) {
      setError("Erro ao criar processo.");
    }
    setLoading(false);
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <form onSubmit={handleSubmit} style={{ background: '#fff', padding: 32, borderRadius: 8, minWidth: 320, boxShadow: '0 2px 16px #0002' }}>
        <h3>Novo Processo</h3>
        <div style={{ marginBottom: 12 }}>
          <label>Número do Processo<br />
            <input value={numero_processo} onChange={e => setNumero(e.target.value)} required style={{ width: '100%' }} />
          </label>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Descrição<br />
            <textarea value={descricao} onChange={e => setDescricao(e.target.value)} required style={{ width: '100%' }} />
          </label>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Status<br />
            <select value={status} onChange={e => setStatus(e.target.value)} required style={{ width: '100%' }}>
              <option value="">Selecione o status</option>
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </label>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Tipo de Processo<br />
            <select value={tipo_processo} onChange={e => setTipo(e.target.value)} required style={{ width: '100%' }}>
              <option value="">Selecione o tipo</option>
              {tipoOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </label>
        </div>
        {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
        <button type="submit" disabled={loading} style={{ marginRight: 8 }}>Criar</button>
        <button type="button" onClick={onClose} disabled={loading}>Cancelar</button>
      </form>
    </div>
  );
}
import { apiRequest } from "@/api/apiRequest";
import { useAuthContext } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

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
  const [showNovo, setShowNovo] = useState(false);
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
      } else if (user?.role === "Professor") {
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
          <button onClick={() => setShowNovo(true)} style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 16px', fontWeight: 500, fontSize: 15 }}>Novo Processo</button>
        )}
      </h2>
      {processos.length === 0 ? (
        <p>Nenhum processo encontrado.</p>
      ) : (
        <ProcessosTable processos={processos} />
      )}
      <NovoProcessoModal open={showNovo} onClose={() => setShowNovo(false)} onCreated={fetchProcessos} token={token} />
    </div>
  );
}