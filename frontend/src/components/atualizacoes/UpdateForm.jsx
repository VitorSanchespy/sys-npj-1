import React, { useState } from "react";
import { apiRequest } from "../../api/apiRequest";
import { useAuthContext } from "../../contexts/AuthContext";

export default function UpdateForm({ processoId, onSuccess }) {
  const { token, user } = useAuthContext();
  const [descricao, setDescricao] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    try {
      await apiRequest(`/api/processos/${processoId}/atualizacoes`, {
        method: "POST",
        token,
        body: { usuario_id: user.id, descricao }
      });
      setMsg("Atualização cadastrada!");
      setDescricao("");
      if (onSuccess) onSuccess();
    } catch (err) {
      setMsg(err.message || "Erro ao cadastrar atualização.");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h4>Nova Atualização</h4>
      {msg && <div>{msg}</div>}
      <div>
        <label>Descrição:</label>
        <textarea
          value={descricao}
          onChange={e => setDescricao(e.target.value)}
          required
        />
      </div>
      <button type="submit" disabled={loading}>
        {loading ? "Salvando..." : "Salvar"}
      </button>
    </form>
  );
}