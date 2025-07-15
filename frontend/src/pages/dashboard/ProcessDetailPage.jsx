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
        const proc = await apiRequest(`/api/processos/${id}`, { token });
        setProcesso(proc);
        const alunosResp = await apiRequest(`/api/processos/${id}/alunos/`, { token });
        setAlunos(alunosResp);
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
      <p><b>Responsável:</b> {processo.responsavel_nome || 'Não informado'}</p>
      <p><b>Data de Encerramento:</b> {processo.data_encerramento || "Em aberto"}</p>
      <hr />
      <h3>Alunos Vinculados</h3>
      {alunos.length === 0 ? (
        <div style={{ color: '#888', marginBottom: 8 }}>
          Nenhum aluno vinculado a este processo.<br />
          {user?.role === "Professor" && (
            <span>Utilize a busca para vincular um aluno.</span>
          )}
        </div>
      ) : (
        <ul>
          {alunos.map((aluno, idx) => (
            <li key={aluno.aluno_id || aluno.id || idx}>
              {aluno.aluno_nome || aluno.nome} ({aluno.aluno_email || aluno.email})<br />
              <span style={{ color: '#555', fontSize: 13 }}>
                {aluno.aluno_telefone || '(00)00000-0000'}
              </span>
              {/* Botão de remover aluno só para professor */}
              {user?.role === "Professor" && (
                <button
                  onClick={async () => {
                    await apiRequest(`/api/processos/remover-aluno`, {
                      method: "DELETE",
                      token,
                      body: { processo_id: processo.id, aluno_id: aluno.aluno_id || aluno.id }
                    });
                    window.location.reload();
                  }}
                  style={{
                    color: '#fff',
                    background: '#d32f2f',
                    border: 'none',
                    borderRadius: 4,
                    padding: '4px 14px',
                    marginLeft: 12,
                    marginTop: 6,
                    fontWeight: 500,
                    fontSize: 14,
                    cursor: 'pointer',
                    boxShadow: '0 1px 4px #0001',
                    transition: 'background 0.2s',
                  }}
                  onMouseOver={e => e.currentTarget.style.background = '#b71c1c'}
                  onMouseOut={e => e.currentTarget.style.background = '#d32f2f'}
                >
                  Remover
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      {/* Professor pode atribuir aluno */}
      {user?.role === "Professor" && (
        <Link to={`/processos/${processo.id}/atribuir`} style={{ textDecoration: 'none' }}>
          <button
            style={{
              background: '#1976d2',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              padding: '6px 18px',
              fontWeight: 500,
              fontSize: 15,
              marginTop: 12,
              marginBottom: 8,
              cursor: 'pointer',
              boxShadow: '0 1px 4px #0001',
              transition: 'background 0.2s',
            }}
            onMouseOver={e => e.currentTarget.style.background = '#115293'}
            onMouseOut={e => e.currentTarget.style.background = '#1976d2'}
          >
            Atribuir Aluno
          </button>
        </Link>
      )}

      <hr />

      <h3>Arquivos</h3>
      <FileAttachToProcess processoId={processo.id} onAttach={() => window.location.reload()} />
      <FileList processoId={processo.id} />

      <hr />
      <h3>Atualizações</h3>
      <UpdateList processoId={processo.id} />
      <br />
      <Link to="/processos">Voltar</Link>
    </div>
  );
}