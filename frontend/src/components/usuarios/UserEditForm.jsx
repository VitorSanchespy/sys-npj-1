import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiRequest } from "../../api/apiRequest";
import { useAuthContext } from "../../contexts/AuthContext";

export default function UserEditForm() {
  const { id } = useParams();
  const { token } = useAuthContext();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nome: "", email: "", role_id: 2, ativo: true });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsuario() {
      try {
        const data = await apiRequest(`/api/usuarios/${id}`, { token });
        setForm({
          nome: data.nome,
          email: data.email,
          role_id: data.role_id,
          ativo: data.ativo,
        });
      } catch {}
      setLoading(false);
    }
    fetchUsuario();
  }, [id, token]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMsg("");
    try {
      await apiRequest(`/api/usuarios/${id}`, {
        method: "PUT",
        token,
        body: form,
      });
      setMsg("Usuário atualizado!");
      setTimeout(() => navigate(`/usuarios/${id}`), 1000);
    } catch (err) {
      setMsg(err.message || "Erro ao atualizar usuário.");
    }
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <form onSubmit={handleSubmit}>
      <h2>Editar Usuário</h2>
      {msg && <div>{msg}</div>}
      <div>
        <label>Nome:</label>
        <input name="nome" value={form.nome} onChange={handleChange} required />
      </div>
      <div>
        <label>Email:</label>
        <input name="email" value={form.email} onChange={handleChange} required />
      </div>
      <div>
        <label>Papel:</label>
        <select name="role_id" value={form.role_id} onChange={handleChange}>
          <option value={2}>Aluno</option>
          <option value={3}>Professor</option>
          <option value={1}>Administrador</option>
        </select>
      </div>
      <div>
        <label>
          <input
            type="checkbox"
            name="ativo"
            checked={form.ativo}
            onChange={handleChange}
          />
          Ativo
        </label>
      </div>
      <button type="submit">Salvar</button>
    </form>
  );
}