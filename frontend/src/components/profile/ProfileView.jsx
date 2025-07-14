import React, { useState } from "react";
import { useAuthContext } from "../../contexts/AuthContext";
import { apiRequest } from "../../api/apiRequest";

export default function ProfileView() {
  const { user, token, setUser } = useAuthContext();
  const [form, setForm] = useState({ nome: user?.nome, email: user?.email });
  const [edit, setEdit] = useState(false);
  const [msg, setMsg] = useState("");

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMsg("");
    try {
      await apiRequest(`/api/usuarios/${user.id}`, {
        method: "PUT",
        body: { ...form, role_id: user.role_id },
        token
      });
      setUser({ ...user, ...form });
      setEdit(false);
      setMsg("Perfil atualizado!");
    } catch (err) {
      setMsg(err.message || "Erro ao atualizar perfil");
    }
  };

  if (!user) return <div>Carregando...</div>;

  return (
    <div>
      <h2>Meu Perfil</h2>
      {msg && <div>{msg}</div>}
      {!edit ? (
        <div>
          <div><b>Nome:</b> {user.nome}</div>
          <div><b>Email:</b> {user.email}</div>
          <div><b>Tipo:</b> {user.role}</div>
          <button onClick={() => setEdit(true)}>Editar</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div>
            <label>Nome:</label>
            <input name="nome" value={form.nome} onChange={handleChange} required />
          </div>
          <div>
            <label>Email:</label>
            <input name="email" value={form.email} onChange={handleChange} required />
          </div>
          <button type="submit">Salvar</button>
          <button type="button" onClick={() => setEdit(false)}>Cancelar</button>
        </form>
      )}
    </div>
  );
}