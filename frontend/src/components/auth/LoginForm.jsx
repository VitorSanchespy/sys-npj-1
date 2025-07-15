import React, { useState } from "react";
import { useAuthContext } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function LoginForm({ onSuccess }) {
  const { login, loading } = useAuthContext();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    const res = await login(email, senha);
    if (res.success) {
      if (onSuccess) onSuccess();
    } else {
      setError(res.message || "E-mail ou senha inválidos");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Entrar</h2>
      {error && <div style={{ color: "red" }}>{error}</div>}
      <div>
        <label>E-mail:</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          autoFocus
        />
      </div>
      <div>
        <label>Senha:</label>
        <input
          type="password"
          value={senha}
          onChange={e => setSenha(e.target.value)}
          required
        />
      </div>
      <p>
        <a href="/esqueci-senha">Esqueci minha senha</a>
      </p>
      <button
        type="button"
        style={{ marginTop: 12, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 18px', fontWeight: 500, fontSize: 15, cursor: 'pointer' }}
        onClick={() => navigate('/registrar')}
      >
        Cadastrar
      </button>
      <button type="submit" disabled={loading}>
        {loading ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}