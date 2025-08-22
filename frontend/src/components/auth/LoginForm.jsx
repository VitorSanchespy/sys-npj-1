// Formulário de login com feedback visual melhorado
import React, { useState } from "react";
import { useAuthContext } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toastService } from "../../services/toastService";

export default function LoginForm({ onSuccess }) {
  const { login, loading } = useAuthContext();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const navigate = useNavigate();

  // Validação de campos
  const validateForm = () => {
    if (!email.trim()) {
      toastService.warning("E-mail é obrigatório");
      return false;
    }
    if (!senha.trim()) {
      toastService.warning("Senha é obrigatória");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toastService.warning("E-mail deve ter um formato válido");
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
        toastService.success("Login realizado com sucesso! Bem-vindo(a) de volta.");
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
        
        // Tratamento específico baseado na mensagem do backend
        if (res.message === 'Email não encontrado no sistema' || 
            res.message?.includes('Email não encontrado') ||
            res.message?.includes('não encontrado')) {
          toastService.error("❌ E-mail não encontrado. Verifique se está digitado corretamente ou faça seu cadastro.");
        } else if (res.message === 'Senha incorreta' || 
                   res.message?.includes('Senha incorreta') ||
                   res.message?.includes('senha') ||
                   res.message?.includes('incorret')) {
          toastService.error("❌ Senha incorreta. Verifique sua senha e tente novamente.");
        } else if (res.message === 'Credenciais inválidas' || 
                   res.message?.includes('Credenciais inválidas')) {
          toastService.error("❌ E-mail ou senha incorretos. Verifique seus dados e tente novamente.");
        } else if (res.message?.includes('inativ') || 
                   res.message?.includes('bloqueado')) {
          toastService.error("❌ Sua conta está inativa. Entre em contato com o administrador.");
        } else {
          toastService.error(`❌ Falha no login: ${res.message || "Erro inesperado. Tente novamente."}`);
        }
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
      
      // Tratamento baseado no status HTTP e mensagem específica
      if (err.status === 404) {
        // Email não encontrado
        toastService.error("❌ E-mail não encontrado. Verifique se está digitado corretamente ou faça seu cadastro.");
      } else if (err.status === 401) {
        // Senha incorreta ou credenciais inválidas
        if (err.message === 'Senha incorreta' || err.message?.includes('Senha incorreta')) {
          toastService.error("❌ Senha incorreta. Verifique sua senha e tente novamente.");
        } else {
          toastService.error("❌ E-mail ou senha incorretos. Verifique seus dados e tente novamente.");
        }
      } else if (err.status >= 500) {
        toastService.error("❌ Erro no servidor. Tente novamente em alguns instantes.");
      } else {
        // Fallback para outros erros
        if (err.message?.includes('Email não encontrado') || err.message?.includes('não encontrado')) {
          toastService.error("❌ E-mail não encontrado. Verifique se está digitado corretamente ou faça seu cadastro.");
        } else if (err.message?.includes('Senha incorreta') || err.message?.includes('senha')) {
          toastService.error("❌ Senha incorreta. Verifique sua senha e tente novamente.");
        } else {
          toastService.error(`❌ Falha no login: ${err.message || "Erro inesperado. Tente novamente."}`);
        }
      }
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