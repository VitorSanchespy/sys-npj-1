import React, { useState } from "react";
import { apiRequest } from "../../api/apiRequest";
import { useNavigate } from "react-router-dom";

export default function RegisterForm() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [roleId, setRoleId] = useState(2); // 2 = Aluno, ajuste conforme backend
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    try {
      await apiRequest("/auth/registrar", {
        method: "POST",
        body: { nome, email, senha, role_id: roleId }
      });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.message || "Erro ao registrar");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Criar Conta</h2>
      {error && <div style={{ color: "red" }}>{error}</div>}
      {success && <div style={{ color: "green" }}>Cadastro realizado! Redirecionando...</div>}
      <div>
        <label>Nome:</label>
        <input value={nome} onChange={e => setNome(e.target.value)} required />
      </div>
      <div>
        <label>E-mail:</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
      </div>
      <div>
        <label>Senha:</label>
        <input type="password" value={senha} onChange={e => setSenha(e.target.value)} required />
      </div>
      <div>
        <label>Tipo de usuário:</label>
        <select value={roleId} onChange={e => setRoleId(Number(e.target.value))}>
          <option value={2}>Aluno</option>
          <option value={3}>Professor</option>
        </select>
      </div>
      <button type="submit">Cadastrar</button>
    </form>
  );
}