
import React, { useState } from "react";
import { useAuthContext } from "../../contexts/AuthContext";

export default function FullRegisterForm() {
  const { register } = useAuthContext();
  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
    telefone: "",
  });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    const res = await register(form.nome, form.email, form.senha, 2); // Default to student role
    if (res.success) {
      setMsg("Usuário cadastrado com sucesso!");
      setForm({ nome: "", email: "", senha: "", telefone: "" });
    } else {
      setMsg(res.message || "Erro ao cadastrar usuário.");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: "auto" }}>
      <h2>Criar Conta Completa</h2>
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

      <button type="submit" disabled={loading} style={{ marginTop: 16 }}>
        {loading ? "Cadastrando..." : "Cadastrar"}
      </button>
    </form>
  );
}
