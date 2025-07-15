import React, { useState } from "react";
import { apiRequest } from "../../api/apiRequest";
import { useAuthContext } from "../../contexts/AuthContext";

export default function UpdateForm({ processoId, onSuccess }) {
  const { token, user } = useAuthContext();
  const [descricao, setDescricao] = useState("");
  const [tipo, setTipo] = useState("");
  const [anexo, setAnexo] = useState(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    try {
      let anexoPath = null;
      if (anexo) {
        // Simulação de upload, ajuste conforme seu backend de upload
        const formData = new FormData();
        formData.append("file", anexo);
        const uploadResp = await fetch("/api/arquivos/upload", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        });
        const uploadData = await uploadResp.json();
        anexoPath = uploadData.caminho || null;
      }
      await apiRequest(`/api/processos/${processoId}/atualizacoes`, {
        method: "POST",
        token,
        body: { descricao, tipo, anexo: anexoPath }
      });
      setMsg("Atualização cadastrada!");
      setDescricao("");
      setTipo("");
      setAnexo(null);
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
        <label>Tipo:</label>
        <select value={tipo} onChange={e => setTipo(e.target.value)}>
          <option value="">Selecione</option>
          <option value="Despacho">Despacho</option>
          <option value="Petição">Petição</option>
          <option value="Audiência">Audiência</option>
          <option value="Observação">Observação</option>
        </select>
      </div>
      <div>
        <label>Descrição:</label>
        <textarea
          value={descricao}
          onChange={e => setDescricao(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Anexo:</label>
        <input type="file" onChange={e => setAnexo(e.target.files[0])} />
      </div>
      <button type="submit" disabled={loading}>
        {loading ? "Salvando..." : "Salvar"}
      </button>
    </form>
  );
}