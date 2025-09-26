import React, { useState } from "react";
import { useAuthContext } from "../../contexts/AuthContext";
import { apiRequest } from "../../api/apiRequest";
import { toastAudit } from "../../services/toastSystemAudit";
import { useApisFeedback } from "../../hooks/useApisFeedback";

export default function ChangePasswordForm() {
  const { user, token, logout, tryRefreshToken } = useAuthContext();
  const { withFeedback } = useApisFeedback();
  const [current, setCurrent] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    current: false,
    newPass: false,
    confirm: false
  });

  // Validação de campos - MELHORADA
  const validateForm = () => {
    const errors = { current: false, newPass: false, confirm: false };
    let isValid = true;
    
    if (!current.trim()) {
      toastAudit.validation.requiredField("Senha atual");
      errors.current = true;
      isValid = false;
    }
    
    if (!newPass.trim()) {
      toastAudit.validation.requiredField("Nova senha");
      errors.newPass = true;
      isValid = false;
    } else if (newPass.length < 6) {
      toastAudit.warning("Nova senha deve ter pelo menos 6 caracteres");
      errors.newPass = true;
      isValid = false;
    }
    
    if (!confirm.trim()) {
      toastAudit.validation.requiredField("Confirmação de senha");
      errors.confirm = true;
      isValid = false;
    } else if (newPass !== confirm) {
      toastAudit.warning("Nova senha e confirmação não coincidem");
      errors.confirm = true;
      isValid = false;
    }
    
    setFieldErrors(errors);
    return isValid;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    // Usar wrapper com feedback automático e tratamento de auth
    const result = await withFeedback(
      async () => {
        return await apiRequest(`/api/usuarios/${user.id}/senha`, {
          method: "PUT",
          token,
          body: { senha_atual: current, nova_senha: newPass }
        });
      },
      {
        successMessage: 'Senha alterada com sucesso! Redirecionando para login...',
        successAction: 'password_change',
        errorContext: 'change_password',
        showLoading: false,
        retryOnAuthError: true
      }
    );
    
    if (result.success) {
      // Limpar campos e aguardar antes do logout
      setCurrent("");
      setNewPass("");
      setConfirm("");
      setFieldErrors({ current: false, newPass: false, confirm: false });
      
      setTimeout(() => {
        logout();
      }, 2000);
    } else {
      // Destacar campo com erro baseado na resposta
      if (result.error?.includes('atual') || result.error?.includes('incorreta')) {
        setFieldErrors(prev => ({ ...prev, current: true }));
        setCurrent(""); // Limpar senha incorreta
      }
    }
    
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '400px' }}>
      <h3 style={{ marginBottom: '20px', color: '#333' }}>🔐 Alterar senha</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          fontSize: '0.9rem',
          fontWeight: 'bold',
          color: '#333',
          marginBottom: '8px'
        }}>
          🔒 Senha atual:
        </label>
        <input
          type="password"
          value={current}
          onChange={(e) => {
            setCurrent(e.target.value);
            if (fieldErrors.current) {
              setFieldErrors(prev => ({...prev, current: false}));
            }
          }}
          required
          style={{
            width: '100%',
            padding: '12px 16px',
            border: fieldErrors.current ? '2px solid #dc3545' : '2px solid #e9ecef',
            borderRadius: '8px',
            fontSize: '1rem',
            backgroundColor: fieldErrors.current ? '#fff5f5' : '#fff',
            transition: 'all 0.3s ease'
          }}
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
          🔑 Nova senha:
        </label>
        <input
          type="password"
          value={newPass}
          onChange={(e) => {
            setNewPass(e.target.value);
            if (fieldErrors.newPass) {
              setFieldErrors(prev => ({...prev, newPass: false}));
            }
          }}
          minLength={6}
          required
          style={{
            width: '100%',
            padding: '12px 16px',
            border: fieldErrors.newPass ? '2px solid #dc3545' : '2px solid #e9ecef',
            borderRadius: '8px',
            fontSize: '1rem',
            backgroundColor: fieldErrors.newPass ? '#fff5f5' : '#fff',
            transition: 'all 0.3s ease'
          }}
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
          ✅ Confirmar nova senha:
        </label>
        <input
          type="password"
          value={confirm}
          onChange={(e) => {
            setConfirm(e.target.value);
            if (fieldErrors.confirm) {
              setFieldErrors(prev => ({...prev, confirm: false}));
            }
          }}
          minLength={6}
          required
          style={{
            width: '100%',
            padding: '12px 16px',
            border: fieldErrors.confirm ? '2px solid #dc3545' : '2px solid #e9ecef',
            borderRadius: '8px',
            fontSize: '1rem',
            backgroundColor: fieldErrors.confirm ? '#fff5f5' : '#fff',
            transition: 'all 0.3s ease'
          }}
        />
      </div>
      
      <button 
        type="submit" 
        disabled={loading}
        style={{
          width: '100%',
          padding: '12px 24px',
          backgroundColor: loading ? '#6c757d' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '1rem',
          fontWeight: 'bold',
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease',
          opacity: loading ? 0.7 : 1
        }}
      >
        {loading ? "⏳ Alterando..." : "🔐 Alterar senha"}
      </button>
    </form>
  );
}