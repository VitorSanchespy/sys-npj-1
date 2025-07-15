
import React, { useEffect, useState, useCallback } from "react";
function NovoProcessoModal({ open, onClose, onCreated, token }) {
  const [num_processo_sei, setNumSei] = useState("");
  const [assistido, setAssistido] = useState("");
  const { user } = useAuthContext();
  const [numero_processo, setNumero] = useState("");
  const [descricao, setDescricao] = useState("");
  const [status, setStatus] = useState("");
  const [materia_assunto_id, setMateriaAssunto] = useState("");
  const [local_tramitacao, setLocal] = useState("");
  const [sistema, setSistema] = useState("");
  const [fase_id, setFase] = useState("");
  const [diligencia_id, setDiligencia] = useState("");
  const [materias, setMaterias] = useState([]);
  const [fases, setFases] = useState([]);
  const [diligencias, setDiligencias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAddMateria, setShowAddMateria] = useState(false);
  const [showAddFase, setShowAddFase] = useState(false);
  const [showAddDiligencia, setShowAddDiligencia] = useState(false);
  const [newMateria, setNewMateria] = useState("");
  const [newFase, setNewFase] = useState("");
  const [newDiligencia, setNewDiligencia] = useState("");

  const statusOptions = [
    { value: "Em andamento", label: "Em andamento" },
    { value: "Concluído", label: "Concluído" },
    { value: "Suspenso", label: "Suspenso" }
  ];
  const sistemaOptions = [
    { value: "Físico", label: "Físico" },
    { value: "PEA", label: "PEA" },
    { value: "PJE", label: "PJE" }
  ];

  useEffect(() => {
    if (open) {
      apiRequest("/api/aux/materia-assunto", { token }).then(setMaterias);
      apiRequest("/api/aux/fase", { token }).then(setFases);
      apiRequest("/api/aux/diligencia", { token }).then(setDiligencias);
    }
  }, [open, token]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await apiRequest("/api/processos", {
        method: "POST",
        token,
        body: {
          numero_processo,
          descricao,
          status,
          materia_assunto_id,
          local_tramitacao,
          sistema,
          fase_id,
          diligencia_id,
          idusuario_responsavel: user?.id,
          num_processo_sei,
          assistido
        }
      });
      onCreated();
      onClose();
    } catch (err) {
      setError("Erro ao criar processo.");
    }
    setLoading(false);
  };

  const handleAddMateria = async () => {
    if (!newMateria) return;
    const res = await apiRequest("/api/aux/materia-assunto", { method: "POST", token, body: { nome: newMateria } });
    setMaterias([...materias, res]);
    setMateriaAssunto(res.id);
    setShowAddMateria(false);
    setNewMateria("");
  };
  const handleAddFase = async () => {
    if (!newFase) return;
    const res = await apiRequest("/api/aux/fase", { method: "POST", token, body: { nome: newFase } });
    setFases([...fases, res]);
    setFase(res.id);
    setShowAddFase(false);
    setNewFase("");
  };
  const handleAddDiligencia = async () => {
    if (!newDiligencia) return;
    const res = await apiRequest("/api/aux/diligencia", { method: "POST", token, body: { nome: newDiligencia } });
    setDiligencias([...diligencias, res]);
    setDiligencia(res.id);
    setShowAddDiligencia(false);
    setNewDiligencia("");
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
          <label>Num/Processo/Sei<br />
            <input value={num_processo_sei} onChange={e => setNumSei(e.target.value)} style={{ width: '100%' }} placeholder="Número do processo SEI" />
          </label>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Assistido/a<br />
            <input value={assistido} onChange={e => setAssistido(e.target.value)} style={{ width: '100%' }} placeholder="Nome da pessoa assistida" />
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
          <label>Matéria/Assunto<br />
            <select value={materia_assunto_id} onChange={e => setMateriaAssunto(e.target.value)} required style={{ width: '100%' }}>
              <option value="">Selecione a matéria/assunto</option>
              {materias.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.nome}</option>
              ))}
            </select>
            <button type="button" onClick={() => setShowAddMateria(true)} style={{ marginLeft: 8 }}>Adicionar novo</button>
          </label>
          {showAddMateria && (
            <div style={{ marginTop: 8 }}>
              <input value={newMateria} onChange={e => setNewMateria(e.target.value)} placeholder="Nova matéria/assunto" />
              <button type="button" onClick={handleAddMateria}>Salvar</button>
              <button type="button" onClick={() => setShowAddMateria(false)}>Cancelar</button>
            </div>
          )}
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Local de Tramitação<br />
            <input value={local_tramitacao} onChange={e => setLocal(e.target.value)} required style={{ width: '100%' }} />
          </label>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Sistema<br />
            <select value={sistema} onChange={e => setSistema(e.target.value)} required style={{ width: '100%' }}>
              <option value="">Selecione o sistema</option>
              {sistemaOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </label>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Fase<br />
            <select value={fase_id} onChange={e => setFase(e.target.value)} required style={{ width: '100%' }}>
              <option value="">Selecione a fase</option>
              {fases.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.nome}</option>
              ))}
            </select>
            <button type="button" onClick={() => setShowAddFase(true)} style={{ marginLeft: 8 }}>Adicionar novo</button>
          </label>
          {showAddFase && (
            <div style={{ marginTop: 8 }}>
              <input value={newFase} onChange={e => setNewFase(e.target.value)} placeholder="Nova fase" />
              <button type="button" onClick={handleAddFase}>Salvar</button>
              <button type="button" onClick={() => setShowAddFase(false)}>Cancelar</button>
            </div>
          )}
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Diligência<br />
            <select value={diligencia_id} onChange={e => setDiligencia(e.target.value)} required style={{ width: '100%' }}>
              <option value="">Selecione a diligência</option>
              {diligencias.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.nome}</option>
              ))}
            </select>
            <button type="button" onClick={() => setShowAddDiligencia(true)} style={{ marginLeft: 8 }}>Adicionar novo</button>
          </label>
          {showAddDiligencia && (
            <div style={{ marginTop: 8 }}>
              <input value={newDiligencia} onChange={e => setNewDiligencia(e.target.value)} placeholder="Nova diligência" />
              <button type="button" onClick={handleAddDiligencia}>Salvar</button>
              <button type="button" onClick={() => setShowAddDiligencia(false)}>Cancelar</button>
            </div>
          )}
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