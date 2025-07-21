import React, { useEffect, useState } from "react";
import { processUpdatesService } from "../../api/services";
import { useAuthContext } from "../../contexts/AuthContext";
import UpdateForm from "./UpdateForm";
import { getFileUrl } from '../../utils/fileUrl';

export default function UpdateList({ processoId }) {
  const { token, user } = useAuthContext();
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    async function fetchUpdates() {
      try {
        const data = await processUpdatesService.getProcessUpdates(processoId, token);
        setUpdates(data);
      } catch {
        setUpdates([]);
      }
      setLoading(false);
    }
    fetchUpdates();
  }, [processoId, token, showForm]);

  if (loading) return <div>Carregando atualizações...</div>;
  return (
    <div>
      {["admin", "professor", "aluno"].includes((user.role || "").toLowerCase()) && (
        <button onClick={() => setShowForm(v => !v)}>
          {showForm ? "Fechar" : "Nova Atualização"}
        </button>
      )}
      {showForm && (
        <UpdateForm
          processoId={processoId}
          onSuccess={() => setShowForm(false)}
        />
      )}
      <ul>
        {updates.length === 0 && <li>Nenhuma atualização encontrada.</li>}
        {updates.map(upd => (
          <li key={upd.id}>
            {upd.tipo && <b>[{upd.tipo}] </b>}
            {upd.descricao}
            {upd.anexo && (
              <>
                <br />
                <a href={getFileUrl(upd.anexo)} target="_blank" rel="noopener noreferrer">Ver anexo</a>
              </>
            )}
            <br />
            <small>Por: {upd.usuario_nome} em {new Date(upd.data_atualizacao).toLocaleString()}</small>
            {user.role && ['professor', 'admin'].includes(user.role.toLowerCase()) && (
              <button
                style={{ marginLeft: 12, color: '#fff', background: '#d32f2f', border: 'none', borderRadius: 4, padding: '2px 10px', fontWeight: 500, cursor: 'pointer' }}
                onClick={async () => {
                  if(window.confirm('Tem certeza que deseja excluir esta atualização?')) {
                    await processUpdatesService.deleteProcessUpdate(upd.processo_id, upd.id, token);
                    setUpdates(updates.filter(u => u.id !== upd.id));
                  }
                }}
              >Excluir</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}