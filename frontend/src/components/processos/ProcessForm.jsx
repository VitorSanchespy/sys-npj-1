import React, { useState, useEffect } from "react";
import { apiRequest } from "../../api/apiRequest";
import { useAuthContext } from "../../contexts/AuthContext";
import { useNavigate, useParams } from "react-router-dom";

export default function ProcessForm() {
  const { token } = useAuthContext();
  const { id } = useParams();
  const isEdit = !!id;
  const [form, setForm] = useState({ numero: "", nome: "", descricao: "" });
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (isEdit) {
      apiRequest(`/api/processos/${id}`, { token })
        .then(data => setForm({ numero: data.numero, nome: data.nome, descricao: data.descricao }))
        .catch(() => {});
    }
  }, [id, isEdit, token]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setMsg("");
    try {
      const url = isEdit ? `/api/processos/${id}` : "/api/processos";
      const method = isEdit ? "PUT" : "POST";
      await apiRequest(url, { method, token, body: form });
      setMsg("Processo salvo com sucesso!");
      setTimeout(() => navigate("/processos"), 1000);
    } catch (err) {
      setMsg(err.message || "Erro ao salvar processo.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>{isEdit ? "Editar Processo" : "Novo Processo"}</h2>
      {msg && <div>{msg}</div>}
      <div>
        <label>Nº:</label>
        <input name="numero" value={form.numero} onChange={handleChange} required />
      </div>
      <div>
        <label>Nome:</label>
        <input name="nome" value={form.nome} onChange={handleChange} required />
      </div>
      <div>
        <label>Descrição:</label>
        <textarea name="descricao" value={form.descricao} onChange={handleChange} />
      </div>
      <button type="submit">{isEdit ? "Salvar" : "Criar"}</button>
    </form>
  );
}