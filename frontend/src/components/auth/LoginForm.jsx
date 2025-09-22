// Formulário de login com feedback visual melhorado
import React, { useState } from "react";
import { useAuthContext } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toastAudit } from "../../services/toastSystemAudit";

export default function LoginForm({ onSuccess }) {
  const { login, loading } = useAuthContext();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [fieldErrors, setFieldErrors] = useState({ email: false, senha: false });
  const navigate = useNavigate();

  // Validação de campos
  const validateForm = () => {
    const errors = { email: false, senha: false };
    
    if (!email.trim()) {
      toastAudit.validation.requiredField("E-mail");
      errors.email = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toastAudit.validation.invalidEmail();
      errors.email = true;
    }
    
    if (!senha.trim()) {
      toastAudit.validation.requiredField("Senha");
      errors.senha = true;
    }
    
    setFieldErrors(errors);
    return !errors.email && !errors.senha;
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
        // Limpar erros visuais quando login for bem-sucedido
        setFieldErrors({ email: false, senha: false });
        // Não limpar campos quando login for bem-sucedido
        if (onSuccess) onSuccess();
      } else {
        console.log('❌ Login falhou - dados do erro:', {
          message: res.message,
          status: res.status,
          fullResponse: res
        });
        
        // Definir qual campo tem erro baseado na resposta
        const errors = { email: false, senha: false };
        if (res.status === 404 || (res.message && res.message.includes('Email não encontrado'))) {
          errors.email = true;
        } else if (res.status === 401 || (res.message && res.message.includes('Senha incorreta'))) {
          errors.senha = true;
          setSenha(""); // Limpar apenas a senha se estiver incorreta
        }
        setFieldErrors(errors);
        
        // Usar sistema auditado para tratamento de erro específico
        toastAudit.auth.loginError(res.message || res.erro || "Erro ao fazer login");
        
        // Focar no campo apropriado baseado no tipo de erro
        if (errors.email) {
          setTimeout(() => {
            const emailField = document.querySelector('input[type="email"]');
            if (emailField) emailField.focus();
          }, 100);
        } else if (errors.senha) {
          setTimeout(() => {
            const senhaField = document.querySelector('input[type="password"]');
            if (senhaField) senhaField.focus();
          }, 100);
        }
      }
    } catch (err) {
      console.log('❌ Erro capturado no catch:', {
        message: err.message,
        status: err.status,
        fullError: err
      });
      
      // Marcar ambos os campos como erro em caso de erro de rede/servidor
      setFieldErrors({ email: true, senha: true });
      setSenha(""); // Limpar apenas a senha em caso de erro
      
      // Tratar diferentes tipos de erro
      let errorMessage = err.message || err.erro || "Erro ao fazer login";
      
      // Se for erro de rede, mostrar mensagem específica
      if (err.code === 'NETWORK_ERROR' || err.message?.includes('fetch')) {
        errorMessage = 'Erro de conexão com o servidor. Verifique sua internet.';
      }
      
      // Usar sistema auditado para tratamento de erro
      toastAudit.auth.loginError(errorMessage);
      
      // Focar no campo email para tentar novamente
      setTimeout(() => {
        const emailField = document.querySelector('input[type="email"]');
        if (emailField) emailField.focus();
      }, 100);
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
          onChange={(e) => {
            setEmail(e.target.value);
            // Limpar erro visual quando usuário começar a digitar
            if (fieldErrors.email) {
              setFieldErrors(prev => ({...prev, email: false}));
            }
          }}
          required
          autoFocus
          style={{
            width: '100%',
            padding: '12px 16px',
            border: `2px solid ${fieldErrors.email ? '#dc3545' : '#e9ecef'}`,
            borderRadius: '8px',
            fontSize: '1rem',
            transition: 'border-color 0.3s ease',
            outline: 'none',
            boxSizing: 'border-box',
            backgroundColor: fieldErrors.email ? '#ffeaea' : 'white'
          }}
          onFocus={(e) => e.target.style.borderColor = fieldErrors.email ? '#dc3545' : '#007bff'}
          onBlur={(e) => e.target.style.borderColor = fieldErrors.email ? '#dc3545' : '#e9ecef'}
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
          onChange={(e) => {
            setSenha(e.target.value);
            // Limpar erro visual quando usuário começar a digitar
            if (fieldErrors.senha) {
              setFieldErrors(prev => ({...prev, senha: false}));
            }
          }}
          required
          style={{
            width: '100%',
            padding: '12px 16px',
            border: `2px solid ${fieldErrors.senha ? '#dc3545' : '#e9ecef'}`,
            borderRadius: '8px',
            fontSize: '1rem',
            transition: 'border-color 0.3s ease',
            outline: 'none',
            boxSizing: 'border-box',
            backgroundColor: fieldErrors.senha ? '#ffeaea' : 'white'
          }}
          onFocus={(e) => e.target.style.borderColor = fieldErrors.senha ? '#dc3545' : '#007bff'}
          onBlur={(e) => e.target.style.borderColor = fieldErrors.senha ? '#dc3545' : '#e9ecef'}
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