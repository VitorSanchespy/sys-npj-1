// Context de Autenticação - Gerencia estado de login e usuário logado
import React, { createContext, useState, useEffect, useContext } from "react";
import { authService } from "../api/services";
import { toastAudit } from "../services/toastSystemAudit";
import Loader from "../components/common/Loader"; 

const AuthContext = createContext();


export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const local = localStorage.getItem("user");
    const userData = local ? JSON.parse(local) : null;
    
    // Marcar que o usuário foi carregado para evitar logs desnecessários
    if (userData && !window.userLoggedOnce) {
      window.userLoggedOnce = true;
    }
    
    return userData;
  });
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem("refreshToken") || "");
  const [loading, setLoading] = useState(false);

  // Persistência simples
  useEffect(() => {
    if (user && token) {
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
    }
  }, [user, token, refreshToken]);

  // Verificar token válido na inicialização - MELHORADO
  useEffect(() => {
    const verifyToken = async () => {
      // Se tem token mas não tem usuário OU se tem ambos mas precisa validar
      if (token) {
        try {
          setLoading(true);
          console.log('🔍 Verificando validade do token armazenado...');
          
          // Sempre validar o token no servidor, mesmo se já temos dados do usuário
          const profileData = await authService.getProfile(token);
          
          // Verificar se os dados mudaram
          if (user && user.id !== profileData.id) {
            console.log('⚠️ Dados do usuário desatualizados, forçando login');
            forceReauth('Dados do usuário foram alterados. Faça login novamente.');
            return;
          }
          
          // Atualizar dados do usuário com informações frescas do servidor
          setUser(profileData);
          console.log('✅ Token válido, usuário autenticado:', profileData.nome);
          
        } catch (error) {
          console.log('❌ Token inválido ou expirado:', error.message);
          
          // Verificar tipo de erro específico
          if (error.status === 401) {
            console.log('🔄 Tentando renovar token...');
            // Tentar renovar o token primeiro
            const refreshed = await tryRefreshToken();
            if (!refreshed) {
              forceReauth('Sua sessão expirou. Faça login novamente.');
            }
          } else {
            // Para outros erros, limpar sessão
            forceReauth('Erro na validação da sessão. Faça login novamente.');
          }
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    
    verifyToken();
  }, []); // Executar apenas uma vez na inicialização

  const login = async (email, senha) => {
    setLoading(true);
    try {
      const data = await authService.login(email, senha);
      if (data.success) {
        setUser(data.usuario);
        setToken(data.token);
        setRefreshToken(data.refreshToken);
        setLoading(false);
        return { success: true };
      } else {
        setLoading(false);
        // Retornar a mensagem específica do backend
        return { 
          success: false, 
          message: data.erro || data.message || "Erro ao fazer login" 
        };
      }
    } catch (err) {
      setLoading(false);
      // Retornar informações detalhadas do erro
      return { 
        success: false, 
        message: err.message || err.erro || "Erro ao fazer login",
        status: err.status || null
      };
    }
  };

  // Função para tentar renovar o token automaticamente - MELHORADA
  const tryRefreshToken = async () => {
    if (!refreshToken) {
      console.log('❌ Não há refresh token disponível');
      return false;
    }
    
    try {
      console.log('🔄 Tentando renovar token...');
      const data = await authService.refreshToken(refreshToken);
      
      if (data.success && data.token) {
        console.log('✅ Token renovado com sucesso');
        setToken(data.token);
        localStorage.setItem("token", data.token);
        
        // Se recebeu dados do usuário, atualizar também
        if (data.usuario) {
          setUser(data.usuario);
        }
        
        return true;
      } else {
        console.log('❌ Falha na renovação do token:', data.message);
        return false;
      }
    } catch (err) {
      console.log('❌ Erro na renovação do token:', err.message);
      
      // Se o refresh token também é inválido, limpar tudo
      if (err.status === 401) {
        console.log('🧹 Refresh token inválido, limpando sessão...');
        forceReauth('Sua sessão expirou completamente. Faça login novamente.');
      }
      
      return false;
    }
  };

  const register = async (nome, email, senha, telefone, role_id = 3) => {
    setLoading(true);
    try {
      await authService.register(nome, email, senha, telefone, role_id);
      setLoading(false);
      return { success: true };
    } catch (err) {
      setLoading(false);
      return { success: false, message: err.message || "Erro ao registrar" };
    }
  };

  const forgotPassword = async (email) => {
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setLoading(false);
      return { success: true };
    } catch (err) {
      setLoading(false);
      return { success: false, message: err.message || "Erro ao solicitar recuperação" };
    }
  };

  const logout = () => {
    const userName = user?.nome || user?.name || 'Usuário';
    setUser(null);
    setToken("");
    setRefreshToken("");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    toastAudit.auth.logoutSuccess();
  };

  // Função para forçar nova autenticação com mensagem específica
  const forceReauth = (message) => {
    console.log('🚨 Forçando nova autenticação:', message);
    
    // Limpar todos os dados de autenticação
    setUser(null);
    setToken("");
    setRefreshToken("");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    
    // Mostrar notificação específica
    toastAudit.auth.sessionExpired();
    
    // Se não estiver na página de login, redirecionar
    if (!window.location.pathname.includes('/login') && 
        !window.location.pathname.includes('/') &&
        !window.location.pathname.includes('/auth')) {
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500); // Dar tempo para o usuário ver a notificação
    }
  };

  // Listener para eventos de token inválido do interceptador
  useEffect(() => {
    const handleUnauthorized = (event) => {
      console.log('📡 Evento de token inválido recebido:', event.detail);
      if (user) { // Só processar se há usuário logado
        forceReauth('Sua sessão foi invalidada. Faça login novamente.');
      }
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [user]);

  if (loading) return <Loader text="Verificando autenticação..." />;
  
  // Função utilitária para requisições autenticadas com auto-refresh MELHORADA
  const fetchWithAuth = async (fn, ...args) => {
    try {
      return await fn(token, ...args);
    } catch (err) {
      console.log('🔍 Erro na requisição autenticada:', err);
      
      // Detectar diferentes tipos de erro 401
      if (err.status === 401 || err.message?.toLowerCase().includes('401')) {
        console.log('🔄 Token inválido detectado, tentando refresh...');
        
        // Verificar mensagens específicas do backend
        if (err.message?.includes('Token expirado') || 
            err.message?.includes('Token inválido') ||
            err.message?.includes('Token de acesso requerido')) {
          
          const refreshed = await tryRefreshToken();
          if (refreshed) {
            console.log('✅ Token renovado, repetindo requisição...');
            return await fn(localStorage.getItem("token"), ...args);
          } else {
            console.log('❌ Falha ao renovar token, forçando nova autenticação');
            forceReauth('Sua sessão expirou. Faça login novamente.');
            throw new Error('Sessão expirada');
          }
        }
      }
      
      // Para outros tipos de erro, apenas repassar
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      setUser, 
      token, 
      refreshToken,
      login, 
      register, 
      forgotPassword, 
      logout, 
      forceReauth,
      loading, 
      isAuthenticated: !!user,
      fetchWithAuth,
      tryRefreshToken
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export function useAuthContext() {
  return useContext(AuthContext);
}