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
      <p><b>Descrição:</b> {processo.descricao}</p>
      <p><b>Status:</b> {processo.status}</p>
      <p><b>Responsável:</b> {processo.idusuario_responsavel}</p>
      <p><b>Data de Encerramento:</b> {processo.data_encerramento || "Em aberto"}</p>
      <hr />
      <h3>Alunos Vinculados</h3>
      <ul>
        {alunos.map((aluno, idx) => (
          <li key={aluno.id || idx}>
            {aluno.nome} ({aluno.email})
            {/* Botão de remover aluno só para professor */}
            {user?.role === "Professor" && (
              <button
                onClick={async () => {
                  await apiRequest(`/api/processos/remover-aluno`, {
                    method: "DELETE",
                    token,
                    body: { processo_id: processo.id, aluno_id: aluno.id }
                  });
                  window.location.reload();
                }}
                style={{ color: "red", marginLeft: 8 }}
              >
                Remover
              </button>
            )}
          </li>
        ))}
      </ul>
      {/* Professor pode atribuir aluno */}
      {user?.role === "Professor" && (
        <Link to={`/processos/${processo.id}/atribuir`}>
          <button>Atribuir Aluno</button>
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