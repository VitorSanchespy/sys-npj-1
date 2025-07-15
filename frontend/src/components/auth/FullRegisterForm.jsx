
import React, { useState } from "react";
import { apiRequest } from "../../api/apiRequest";

export default function FullRegisterForm() {
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
    try {
      await apiRequest("/auth/registrar", {
        method: "POST",
        body: { ...form },
      });
      setMsg("Usuário cadastrado com sucesso!");
      setForm({ nome: "", email: "", senha: "", telefone: "" });
    } catch (err) {
      setMsg(err.message || "Erro ao cadastrar usuário.");
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
