import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { apiRequest } from "@/api/apiRequest";
import { useAuthContext } from "@/contexts/AuthContext";
import UpdateList from "@/components/atualizacoes/UpdateList";
// Formulário de edição baseado em FullProcessCreateForm
import { auxTablesService, processService } from "../../api/services";
import FileAttachToProcess from "../../components/arquivos/FileAttachToProcess";
import FileList from "../../components/arquivos/FileList";

import ProcessAssignUserModal from "../../components/processos/ProcessAssignUserModal";
import ProcessUnassignUserModal from "../../components/processos/ProcessUnassignUserModal";




export default function ProcessDetailPage() {
  const { token, user } = useAuthContext();
  const { id } = useParams();
  const [processo, setProcesso] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alunos, setAlunos] = useState([]);
  const navigate = useNavigate();
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showUnassignModal, setShowUnassignModal] = useState(false);

  // Função de busca extraída para ser reutilizada
  const fetchAll = async () => {
    setLoading(true);
    try {
      // Busca todos os detalhes do processo
      const proc = await apiRequest(`/api/processos/${id}/detalhes`, { token });
      setProcesso(proc);
      // Extrai alunos vinculados do relacionamento usuariosProcesso
      const alunosVinculados = (proc.usuariosProcesso || []).map(v => v.usuario).filter(Boolean);
      setAlunos(alunosVinculados);
    } catch (err) {
      setProcesso(null);
      setAlunos([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, [id, token]);

  if (loading) return <div>Carregando...</div>;
  if (!processo) return <div>Processo não encontrado.</div>;

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <button
          style={{ background: '#2563eb', color: 'white', padding: '8px 16px', borderRadius: 6, border: 0, cursor: 'pointer' }}
          onClick={() => navigate(`/processos/${id}/editar`)}
        >
          Atualizar Processo
        </button>
        <button
          style={{ background: '#059669', color: 'white', padding: '8px 16px', borderRadius: 6, border: 0, cursor: 'pointer' }}
          onClick={() => setShowAssignModal(true)}
        >
          Vincular Usuário
        </button>
        <button
          style={{ background: '#d32f2f', color: 'white', padding: '8px 16px', borderRadius: 6, border: 0, cursor: 'pointer' }}
          onClick={() => setShowUnassignModal(true)}
        >
          Desvincular Usuário
        </button>
      </div>
      {showUnassignModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0008', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <ProcessUnassignUserModal
            processoId={processo.id}
            alunos={alunos}
            onClose={() => setShowUnassignModal(false)}
            onUnassigned={() => {
              setShowUnassignModal(false);
              fetchAll(); // Atualiza a lista após remoção
            }}
          />
        </div>
      )}
      {showAssignModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0008', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <ProcessAssignUserModal
            processoId={processo.id}
            onClose={() => setShowAssignModal(false)}
            onAssigned={() => {
              setShowAssignModal(false);
              fetchAll(); // Atualiza a lista de usuários vinculados
            }}
          />
        </div>
      )}
      <h2>Detalhes do Processo #{processo.numero_processo}</h2>
      {processo.num_processo_sei && (
        <p><b>Nº Processo/SEI:</b> {processo.num_processo_sei}</p>
      )}
      {processo.assistido && (
        <p><b>Assistido(a):</b> {processo.assistido}</p>
      )}
      <p><b>Descrição:</b> {processo.descricao}</p>
      <p><b>Status:</b> {processo.status}</p>
      <p><b>Responsável:</b> {processo.usuarioCriador?.nome || 'Não informado'}</p>
      <p><b>Data de Encerramento:</b> {processo.data_encerramento || "Em aberto"}</p>
      <p><b>Matéria/Assunto:</b> {processo.materiaAssunto?.nome || '-'}</p>
      <p><b>Fase:</b> {processo.fase?.nome || '-'}</p>
      <p><b>Diligência:</b> {processo.diligencia?.nome || '-'}</p>
      <p><b>Local de Tramitação:</b> {processo.localTramitacao?.nome || '-'}</p>
      <hr />
      <h3>Usuários Vinculados</h3>
      {alunos.length === 0 ? (
        <div style={{ color: '#888', marginBottom: 8 }}>
          Nenhum usuário vinculado a este processo.<br />
        </div>
      ) : (
        <ul>
          {alunos.map((aluno, idx) => (
            <li key={aluno.id || idx}>
              <span style={{ fontWeight: 'bold' }}>
                {aluno.role_id === 3 ? 'Professor(a)' : 'Aluno(a)'} 
              </span>{' '}
              {aluno.nome} 
              {aluno.telefone && (
                <span> ({aluno.telefone})</span>
              )}
              <span> ({aluno.email})</span>
            </li>
          ))}
        </ul>
      )}
      <hr />
      <h3>Arquivos</h3>
      <FileAttachToProcess processoId={processo.id} onAttach={() => window.location.reload()} />
      <FileList processoId={processo.id} />
      <hr />
      <h3>Histórico de Atualizações</h3>
      {processo.atualizacoes && processo.atualizacoes.length > 0 ? (
        <ul>
          {processo.atualizacoes.map((at, idx) => (
            <li key={at.id || idx}>
              <b>{at.tipo_atualizacao}</b> - {at.descricao}<br />
              <span style={{ color: '#555', fontSize: 13 }}>
                {at.usuario?.nome ? `Por: ${at.usuario.nome}` : ''} em {new Date(at.data_atualizacao).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <div style={{ color: '#888' }}>Nenhuma atualização registrada.</div>
      )}
      <br />
      <Link to="/processos">Voltar</Link>
    </div>
  );
}

