// Formulário de login com feedback visual melhorado
import React, { useState } from "react";
import { useAuthContext } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toastAudit } from "../../services/toastSystemAudit";

export default function LoginForm({ onSuccess }) {
  const { login, loading } = useAuthContext();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const navigate = useNavigate();

  // Validação de campos
  const validateForm = () => {
    if (!email.trim()) {
      toastAudit.validation.requiredField("E-mail");
      return false;
    }
    if (!senha.trim()) {
      toastAudit.validation.requiredField("Senha");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toastAudit.validation.invalidEmail();
      return false;
    }
    return true;
  };

  const handleSubmit = async e => {
    e.preventDefault(); // CRÍTICO: Prevenir reload da página
    if (!validateForm()) return;
    
    console.log('🔐 Iniciando login com:', { email, senha: '***' });
    
    try {
      const res = await login(email, senha);
      console.log('🔄 Resposta do AuthContext:', res);
      
      if (res.success) {
        toastAudit.auth.loginSuccess(res.user?.nome || "Usuário");
        if (onSuccess) onSuccess();
      } else {
        console.log('❌ Login falhou - dados do erro:', {
          message: res.message,
          status: res.status,
          fullResponse: res
        });
        
        // Limpar campos em caso de erro
        setEmail("");
        setSenha("");
        
        // Usar sistema auditado para tratamento de erro
        toastAudit.auth.loginError(res.message);
      }
    } catch (err) {
      console.log('❌ Erro capturado no catch:', {
        message: err.message,
        status: err.status,
        fullError: err
      });
      
      // Limpar campos em caso de erro
      setEmail("");
      setSenha("");
      
      // Usar sistema auditado para tratamento de erro
      toastAudit.auth.loginError(err.message || err);
    }
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
          📧 E-mail:
        </label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
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
          onFocus={(e) => e.target.style.borderColor = '#007bff'}
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
          onFocus={(e) => e.target.style.borderColor = '#007bff'}
          onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
          placeholder="Digite sua senha"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        style={{
          width: '100%',
          padding: '15px',
          backgroundColor: loading ? '#ccc' : '#007bff',
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
            e.target.style.backgroundColor = '#0056b3';
            e.target.style.transform = 'translateY(-2px)';
          }
        }}
        onMouseLeave={(e) => {
          if (!loading) {
            e.target.style.backgroundColor = '#007bff';
            e.target.style.transform = 'translateY(0)';
          }
        }}
      >
        {loading ? "🔄 Entrando..." : "🚀 Entrar no Sistema"}
      </button>

      <div style={{ textAlign: 'center' }}>
        <p style={{ 
          color: '#666', 
          fontSize: '0.9rem',
          margin: '0 0 10px 0'
        }}>
          Não tem uma conta?
        </p>
        <button
          type="button"
          onClick={() => navigate('/registrar-completo')}
          style={{
            backgroundColor: 'transparent',
            color: '#28a745',
            border: '2px solid #28a745',
            padding: '10px 20px',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#28a745';
            e.target.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.color = '#28a745';
          }}
        >
          👤 Criar Nova Conta
        </button>
      </div>
    </form>
  );
}