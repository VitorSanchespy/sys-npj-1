import React, { useEffect, useState } from "react";
import { apiRequest } from "../../api/apiRequest";
import { useAuthContext } from "../../contexts/AuthContext";
import { useParams, useNavigate } from "react-router-dom";

export default function ProcessAssignStudentModal() {
  const { token } = useAuthContext();
  const { id } = useParams();
  const [alunos, setAlunos] = useState([]);
  const [selected, setSelected] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    apiRequest("/api/usuarios?role=aluno", { token })
      .then(data => setAlunos(data))
      .catch(() => setAlunos([]));
  }, [token]);

  const handleSubmit = async e => {
    e.preventDefault();
    setMsg("");
    try {
      await apiRequest(`/api/processos/${id}/atribuir-aluno`, {
        method: "POST",
        token,
        body: { aluno_id: selected }
      });
      setMsg("Aluno atribuído!");
      setTimeout(() => navigate(`/processos/${id}`), 1000);
    } catch (err) {
      setMsg(err.message || "Erro ao atribuir aluno.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Atribuir Aluno ao Processo</h3>
      {msg && <div>{msg}</div>}
      <select value={selected} onChange={e => setSelected(e.target.value)} required>
        <option value="">Selecione um aluno</option>
        {alunos.map(a => (
          <option key={a.id} value={a.id}>{a.nome}</option>
        ))}
      </select>
      <button type="submit" disabled={!selected}>Atribuir</button>
    </form>
  );
}