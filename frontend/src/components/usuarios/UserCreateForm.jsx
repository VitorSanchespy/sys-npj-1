import React, { useState } from "react";
import { userService } from "../../api/services";
import { useAuthContext } from "../../contexts/AuthContext";
import { getUserRole } from "../../hooks/useApi";
import { toastService } from "../../services/toastService";

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
  const [loading, setLoading] = useState(false);

  // Validação de campos
  const validateForm = () => {
    if (!form.nome.trim()) {
      toastService.warning("Nome é obrigatório");
      return false;
    }
    if (form.nome.trim().length < 2) {
      toastService.warning("Nome deve ter pelo menos 2 caracteres");
      return false;
    }
    if (!form.email.trim()) {
      toastService.warning("E-mail é obrigatório");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toastService.warning("E-mail deve ter um formato válido");
      return false;
    }
    if (!form.senha.trim()) {
      toastService.warning("Senha é obrigatória");
      return false;
    }
    if (form.senha.length < 6) {
      toastService.warning("Senha deve ter pelo menos 6 caracteres");
      return false;
    }
    return true;
  };

  // Professores só podem criar Aluno
  const userRole = getUserRole(user);
  const isProfessor = userRole === "Professor";
  const isAdmin = userRole === "Admin";
  
  // Define opções de papel baseado no usuário logado
  let roleOptions = [];
  if (isAdmin) {
    roleOptions = ROLES; // Admin pode criar qualquer papel
  } else if (isProfessor) {
    roleOptions = ROLES.filter(r => r.id !== 1); // Professor pode criar Aluno e Professor, mas não Admin
  } else {
    roleOptions = ROLES.filter(r => r.id === 2); // Outros só podem criar Aluno
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await userService.createUser(token, form);
      toastService.success(`Usuário ${form.nome} cadastrado com sucesso!`);
      setForm({ nome: "", email: "", senha: "", telefone: "", role_id: 2 });
      if (onCreated) onCreated();
    } catch (err) {
      if (err.message?.includes('email') && err.message?.includes('existe')) {
        toastService.error("Este e-mail já está cadastrado no sistema");
      } else if (err.message?.includes('validation') || err.message?.includes('inválido')) {
        toastService.error("Dados inválidos. Verifique os campos obrigatórios");
      } else {
        toastService.error(`Erro ao cadastrar usuário: ${err.message || 'Erro inesperado'}`);
      }
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: "auto" }}>
      <h2>Criar Usuário</h2>
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
      {roleOptions.length > 1 ? (
        <div>
          <label>Papel:</label>
          <select name="role_id" value={form.role_id} onChange={handleChange} required>
            {roleOptions.map((r) => (
              <option key={r.id} value={r.id}>{r.label}</option>
            ))}
          </select>
        </div>
      ) : (
        <div>
          <label>Papel:</label>
          <input type="text" value={roleOptions[0]?.label || "Aluno"} disabled />
          <input type="hidden" name="role_id" value={roleOptions[0]?.id || 2} />
        </div>
      )}
      <button type="submit" disabled={loading} style={{ marginTop: 16 }}>
        {loading ? "Cadastrando..." : "Cadastrar"}
      </button>
    </form>
  );
}
