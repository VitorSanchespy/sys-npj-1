
// Formulário de cadastro completo - sempre cria usuários com role "Aluno"
import React, { useState } from "react";
import { useAuthContext } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useGlobalToast } from "../../contexts/ToastContext";

export default function FullRegisterForm() {
  const { register } = useAuthContext();
  const navigate = useNavigate();
  const { showSuccess, showError, showWarning } = useGlobalToast();
  
  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
    telefone: "",
  });
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  // Validação de campos
  const validateForm = () => {
    if (!form.nome.trim()) {
      showWarning("Nome é obrigatório", "validation");
      return false;
    }
    if (!form.email.trim()) {
      showWarning("E-mail é obrigatório", "validation");
      return false;
    }
    if (!form.senha || form.senha.length < 6) {
      showWarning("Senha deve ter pelo menos 6 caracteres", "validation");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      showWarning("E-mail deve ter um formato válido", "validation");
      return false;
    }
    return true;
  };

  async function handleSubmit(e) {
    e.preventDefault();
    
    // Validar formulário antes de enviar
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      // SEMPRE criar usuário com role_id = 3 (Aluno)
      const res = await register(form.nome, form.email, form.senha, form.telefone, 3);
      
      if (res.success) {
        showSuccess(`🎉 Cadastro realizado com sucesso! Bem-vindo(a), ${form.nome}! Redirecionando para o login...`);
        
        // Limpar formulário
        setForm({
          nome: "",
          email: "",
          senha: "",
          telefone: "",
        });
        
        // Redirecionar após 2 segundos
        setTimeout(() => navigate("/login"), 2000);
      } else {
        // Mostrar erro específico baseado na resposta
        if (res.message?.includes('email')) {
          showError("❌ Este e-mail já está cadastrado. Tente fazer login ou use outro e-mail.");
        } else if (res.message?.includes('senha')) {
          showError("❌ Senha muito fraca. Use pelo menos 6 caracteres com letras e números.");
        } else if (res.message?.includes('nome')) {
          showError("❌ Nome inválido. Use apenas letras e espaços.");
        } else {
          showError(`❌ Falha no cadastro: ${res.message || "Erro inesperado. Tente novamente."}`);
        }
      }
    } catch (error) {
      showError("❌ Erro de conexão. Verifique sua internet e tente novamente.");
    }
    
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} style={{
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: '18px'
    }}>
      {/* Campos do formulário */}
      <div style={{ marginBottom: '10px' }}>
        <label style={{
          display: 'block',
          fontSize: '0.95rem',
          fontWeight: 'bold',
          color: '#333',
          marginBottom: '8px'
        }}>👤 Nome Completo:</label>
        <input
          name="nome"
          value={form.nome}
          onChange={handleChange}
          required
          style={{
            width: '100%',
            padding: '12px 16px',
            border: '2px solid #e9ecef',
            borderRadius: '8px',
            fontSize: '1rem',
            transition: 'border-color 0.3s ease',
            outline: 'none',
            boxSizing: 'border-box'
          }}
          onFocus={e => e.target.style.borderColor = '#28a745'}
          onBlur={e => e.target.style.borderColor = '#e9ecef'}
          placeholder="Seu nome completo"
        />
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label style={{
          display: 'block',
          fontSize: '0.95rem',
          fontWeight: 'bold',
          color: '#333',
          marginBottom: '8px'
        }}>📧 E-mail:</label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
          style={{
            width: '100%',
            padding: '12px 16px',
            border: '2px solid #e9ecef',
            borderRadius: '8px',
            fontSize: '1rem',
            transition: 'border-color 0.3s ease',
            outline: 'none',
            boxSizing: 'border-box'
          }}
          onFocus={e => e.target.style.borderColor = '#28a745'}
          onBlur={e => e.target.style.borderColor = '#e9ecef'}
          placeholder="seu.email@exemplo.com"
        />
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label style={{
          display: 'block',
          fontSize: '0.95rem',
          fontWeight: 'bold',
          color: '#333',
          marginBottom: '8px'
        }}>🔒 Senha:</label>
        <input
          name="senha"
          type="password"
          value={form.senha}
          onChange={handleChange}
          required
          style={{
            width: '100%',
            padding: '12px 16px',
            border: '2px solid #e9ecef',
            borderRadius: '8px',
            fontSize: '1rem',
            transition: 'border-color 0.3s ease',
            outline: 'none',
            boxSizing: 'border-box'
          }}
          onFocus={e => e.target.style.borderColor = '#28a745'}
          onBlur={e => e.target.style.borderColor = '#e9ecef'}
          placeholder="Mínimo 6 caracteres"
        />
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label style={{
          display: 'block',
          fontSize: '0.95rem',
          fontWeight: 'bold',
          color: '#333',
          marginBottom: '8px'
        }}>📞 Telefone:</label>
        <input
          name="telefone"
          value={form.telefone}
          onChange={handleChange}
          style={{
            width: '100%',
            padding: '12px 16px',
            border: '2px solid #e9ecef',
            borderRadius: '8px',
            fontSize: '1rem',
            transition: 'border-color 0.3s ease',
            outline: 'none',
            boxSizing: 'border-box'
          }}
          onFocus={e => e.target.style.borderColor = '#28a745'}
          onBlur={e => e.target.style.borderColor = '#e9ecef'}
          placeholder="(xx) xxxxx-xxxx"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{
          width: '100%',
          padding: '15px',
          backgroundColor: loading ? '#ccc' : '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '1.1rem',
          fontWeight: 'bold',
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease',
          marginBottom: '10px'
        }}
        onMouseEnter={e => {
          if (!loading) {
            e.target.style.backgroundColor = '#218838';
            e.target.style.transform = 'translateY(-2px)';
          }
        }}
        onMouseLeave={e => {
          if (!loading) {
            e.target.style.backgroundColor = '#28a745';
            e.target.style.transform = 'translateY(0)';
          }
        }}
      >
        {loading ? "🔄 Cadastrando como Aluno..." : "🎓 Criar Conta de Aluno"}
      </button>
      
      <div style={{
        textAlign: 'center',
        padding: '8px',
        backgroundColor: '#e3f2fd',
        borderRadius: '6px',
        fontSize: '0.85rem',
        color: '#1976d2',
        marginBottom: '10px'
      }}>
        ℹ️ Sua conta será criada com perfil de <strong>Aluno</strong>
      </div>
      
      <button
        type="button"
        onClick={() => navigate('/login')}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '1rem',
          fontWeight: 'bold',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          marginBottom: '5px'
        }}
        onMouseEnter={e => e.target.style.backgroundColor = '#0056b3'}
        onMouseLeave={e => e.target.style.backgroundColor = '#007bff'}
      >
        ← Voltar para Login
      </button>
    </form>
  );
}
