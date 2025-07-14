import React, { useEffect, useState } from "react";
import { apiRequest } from "../../api/apiRequest";
import { useAuthContext } from "../../contexts/AuthContext";
import UpdateForm from "./UpdateForm";

export default function UpdateList({ processoId }) {
  const { token, user } = useAuthContext();
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    async function fetchUpdates() {
      try {
        const data = await apiRequest(`/api/processos/${processoId}/atualizacoes`, { token });
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
      {["admin", "professor"].includes(user.role) && (
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
            <b>{upd.titulo}</b> — {upd.descricao}
            <br />
            <small>Por: {upd.autor_nome} em {new Date(upd.criado_em).toLocaleString()}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}