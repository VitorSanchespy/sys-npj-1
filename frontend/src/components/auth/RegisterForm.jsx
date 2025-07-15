import React, { useState } from "react";
import { apiRequest } from "../../api/apiRequest";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../contexts/AuthContext";

export default function RegisterForm() {
  const { user } = useAuthContext();
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
      let finalRoleId = 2; // Aluno
      if (user && user.role === "Admin") finalRoleId = roleId;
      else if (user && user.role === "Professor" && (roleId === 2 || roleId === 3)) finalRoleId = roleId;
      // Professor não pode criar Admin
      else if (user && user.role === "Professor" && roleId === 1) {
        setError("Professores não podem criar Admins.");
        return;
      }
      // Aluno ou não logado só pode criar Aluno
      await apiRequest("/auth/registrar", {
        method: "POST",
        body: { nome, email, senha, role_id: finalRoleId }
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
      {(user && (user.role === "Admin" || user.role === "Professor")) && (
        <div>
          <label>Tipo de usuário:</label>
          <select value={roleId} onChange={e => setRoleId(Number(e.target.value))}>
            <option value={2}>Aluno</option>
            <option value={3}>Professor</option>
            {user.role === "Admin" && <option value={1}>Admin</option>}
          </select>
        </div>
      )}
      <button type="submit">Cadastrar</button>
    </form>
  );
}