import React, { useState } from "react";
import { apiRequest } from "../../api/apiRequest";
import { useAuthContext } from "../../contexts/AuthContext";

const ROLES = [
  { id: 2, label: "Aluno" },
  { id: 3, label: "Professor" },
  { id: 1, label: "Administrador" },
];

export default function UserCreateForm({ onCreated }) {
  const { token, user } = useAuthContext();
  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
    telefone: "",
    role_id: 2,
  });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Professores não podem criar Admin
  const roleOptions = user?.role === "admin" ? ROLES : ROLES.filter(r => r.id !== 1);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    try {
      await apiRequest("/api/usuarios", {
        method: "POST",
        token,
        body: form,
      });
      setMsg("Usuário cadastrado com sucesso!");
      setForm({ nome: "", email: "", senha: "", telefone: "", role_id: 2 });
      if (onCreated) onCreated();
    } catch (err) {
      setMsg(err.message || "Erro ao cadastrar usuário.");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: "auto" }}>
      <h2>Criar Usuário</h2>
      {msg && <div>{msg}</div>}
      <div>
        <label>Nome:</label>
        <input name="nome" value={form.nome} onChange={handleChange} required />
      </div>
      <div>
        <label>Email:</label>
        <input name="email" type="email" value={form.email} onChange={handleChange} required />
      </div>
      <div>
        <label>Senha:</label>
        <input name="senha" type="password" value={form.senha} onChange={handleChange} required />
      </div>
      <div>
        <label>Telefone:</label>
        <input name="telefone" value={form.telefone} onChange={handleChange} />
      </div>
      <div>
        <label>Papel:</label>
        <select name="role_id" value={form.role_id} onChange={handleChange} required>
          {roleOptions.map((r) => (
            <option key={r.id} value={r.id}>{r.label}</option>
          ))}
        </select>
      </div>
      <button type="submit" disabled={loading} style={{ marginTop: 16 }}>
        {loading ? "Cadastrando..." : "Cadastrar"}
      </button>
    </form>
  );
}
