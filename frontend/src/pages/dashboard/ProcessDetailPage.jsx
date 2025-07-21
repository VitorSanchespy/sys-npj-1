import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { apiRequest } from "@/api/apiRequest";
import { useAuthContext } from "@/contexts/AuthContext";
import UpdateList from "@/components/atualizacoes/UpdateList";
import FileList from "@/components/arquivos/FileList";
import FileAttachToProcess from "@/components/arquivos/FileAttachToProcess";


export default function ProcessDetailPage() {
  const { token, user } = useAuthContext();
  const { id } = useParams();
  const [processo, setProcesso] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alunos, setAlunos] = useState([]);

  useEffect(() => {
    async function fetchAll() {
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
    }
    fetchAll();
  }, [id, token]);

  if (loading) return <div>Carregando...</div>;
  if (!processo) return <div>Processo não encontrado.</div>;

  return (
    <div>
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
              {aluno.nome} ({aluno.email})<br />
              <span style={{ color: '#555', fontSize: 13 }}>
                {aluno.role_id === 3 ? 'Professor(a)' : 'Aluno(a)'}
              </span>
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