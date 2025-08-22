import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../contexts/AuthContext";
import { toastService } from "../../services/toastService";

export default function PublicRegisterForm() {
  const { register } = useAuthContext();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [telefone, setTelefone] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Validação de campos
  const validateForm = () => {
    if (!nome.trim()) {
      toastService.warning("Nome completo é obrigatório");
      return false;
    }
    if (nome.trim().length < 2) {
      toastService.warning("Nome deve ter pelo menos 2 caracteres");
      return false;
    }
    if (!email.trim()) {
      toastService.warning("E-mail é obrigatório");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toastService.warning("E-mail deve ter um formato válido");
      return false;
    }
    if (!senha.trim()) {
      toastService.warning("Senha é obrigatória");
      return false;
    }
    if (senha.length < 6) {
      toastService.warning("Senha deve ter pelo menos 6 caracteres");
      return false;
    }
    if (!telefone.trim()) {
      toastService.warning("Telefone é obrigatório");
      return false;
    }
    if (!/^[\(\)\s\-\+\d]{10,}$/.test(telefone.replace(/\s/g, ''))) {
      toastService.warning("Telefone deve ter um formato válido");
      return false;
    }
    return true;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // Sempre registrar como Aluno (role_id = 3)
      const res = await register(nome, email, senha, telefone, 3);
      if (res.success) {
        toastService.success("🎉 Conta criada com sucesso! Redirecionando para login...");
        // Limpar campos
        setNome("");
        setEmail("");
        setSenha("");
        setTelefone("");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        // Limpar campos em caso de erro
        setNome("");
        setEmail("");
        setSenha("");
        setTelefone("");
        
        if (res.message?.includes('email') && res.message?.includes('existe')) {
          toastService.error("❌ Este e-mail já está cadastrado. Tente fazer login ou use outro e-mail.");
        } else if (res.message?.includes('senha')) {
          toastService.error("❌ Senha não atende aos critérios de segurança. Use pelo menos 6 caracteres.");
        } else if (res.message?.includes('telefone')) {
          toastService.error("❌ Telefone inválido. Use um formato válido com DDD.");
        } else {
          toastService.error(`❌ Falha ao criar conta: ${res.message || "Erro inesperado"}`);
        }
      }
    } catch (err) {
      // Limpar campos em caso de erro
      setNome("");
      setEmail("");
      setSenha("");
      setTelefone("");
      
      if (err.message?.includes('email') && err.message?.includes('existe')) {
        toastService.error("❌ Este e-mail já está cadastrado. Tente fazer login ou use outro e-mail.");
      } else if (err.message?.includes('validation') || err.message?.includes('inválido')) {
        toastService.error("❌ Dados inválidos. Verifique os campos e tente novamente.");
      } else {
        toastService.error(`❌ Erro no cadastro: ${err.message || "Erro inesperado. Tente novamente."}`);
      }
    }
    
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          fontSize: '0.9rem',
          fontWeight: 'bold',
          color: '#333',
          marginBottom: '8px'
        }}>
          👤 Nome Completo:
        </label>
        <input
          type="text"
          value={nome}
          onChange={e => setNome(e.target.value)}
          required
          autoFocus
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
          onFocus={(e) => e.target.style.borderColor = '#28a745'}
          onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
          placeholder="Seu nome completo"
        />
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          fontSize: '0.9rem',
          fontWeight: 'bold',
          color: '#333',
          marginBottom: '8px'
        }}>
          📧 E-mail:
        </label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
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
          onFocus={(e) => e.target.style.borderColor = '#28a745'}
          onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
          placeholder="seu.email@exemplo.com"
        />
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          fontSize: '0.9rem',
          fontWeight: 'bold',
          color: '#333',
          marginBottom: '8px'
        }}>
          🔒 Senha:
        </label>
        <input
          type="password"
          value={senha}
          onChange={e => setSenha(e.target.value)}
          required
          minLength={6}
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
          onFocus={(e) => e.target.style.borderColor = '#28a745'}
          onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
          placeholder="Mínimo 6 caracteres"
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          fontSize: '0.9rem',
          fontWeight: 'bold',
          color: '#333',
          marginBottom: '8px'
        }}>
          📱 Telefone:
        </label>
        <input
          type="tel"
          value={telefone}
          onChange={e => setTelefone(e.target.value)}
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
          onFocus={(e) => e.target.style.borderColor = '#28a745'}
          onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
          placeholder="(11) 99999-9999"
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
          marginBottom: '15px'
        }}
        onMouseEnter={(e) => {
          if (!loading) {
            e.target.style.backgroundColor = '#218838';
            e.target.style.transform = 'translateY(-2px)';
          }
        }}
        onMouseLeave={(e) => {
          if (!loading) {
            e.target.style.backgroundColor = '#28a745';
            e.target.style.transform = 'translateY(0)';
          }
        }}
      >
        {loading ? "🔄 Criando Conta..." : "🚀 Criar Conta de Aluno"}
      </button>

      <div style={{ textAlign: 'center' }}>
        <p style={{ 
          color: '#666', 
          fontSize: '0.9rem',
          margin: '0 0 10px 0'
        }}>
          Já possui uma conta?
        </p>
        <button
          type="button"
          onClick={() => navigate('/login')}
          style={{
            backgroundColor: 'transparent',
            color: '#007bff',
            border: '2px solid #007bff',
            padding: '10px 20px',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#007bff';
            e.target.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.color = '#007bff';
          }}
        >
          🔐 Fazer Login
        </button>
      </div>
    </form>
  );
}
