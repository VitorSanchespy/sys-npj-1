import React, { useState } from "react";
import { apiRequest } from "../../api/apiRequest";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    try {
      await apiRequest("/auth/esqueci-senha", {
        method: "POST",
        body: { email }
      });
      setMsg("Se o e-mail estiver cadastrado, você receberá instruções para redefinir a senha.");
    } catch (err) {
      setMsg("Erro ao solicitar redefinição de senha.");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Esqueci minha senha</h2>
      {msg && <div>{msg}</div>}
      <div>
        <label>E-mail cadastrado:</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
      </div>
      <button type="submit" disabled={loading}>
        {loading ? "Enviando..." : "Enviar"}
      </button>
    </form>
  );
}