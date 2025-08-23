/**
 * INTERCEPTADOR DE RESPOSTA PARA SISTEMA DE TOAST
 * 
 * Este módulo intercepta automaticamente respostas de API para exibir
 * notificações apropriadas sem precisar configurar em cada componente.
 */

import { toastAudit } from './toastSystemAudit';

/**
 * Configuração de mapeamento automático de endpoints para toasts
 */
const AUTO_TOAST_CONFIG = {
  // Autenticação
  'auth/login': {
    success: (data) => toastAudit.auth.loginSuccess(data.user?.nome || 'Usuário'),
    error: (error) => toastAudit.auth.loginError(error)
  },
  'auth/register': {
    success: (data) => toastAudit.auth.registerSuccess(data.user?.nome || 'Usuário'),
    error: (error) => toastAudit.auth.registerError(error)
  },
  'auth/logout': {
    success: () => toastAudit.auth.logoutSuccess()
  },
  
  // Processos
  'processos': {
    POST: {
      success: (data) => toastAudit.process.createSuccess(data.processo?.titulo || data.titulo || 'Processo'),
      error: (error) => toastAudit.process.createError(error)
    },
    PUT: {
      success: (data) => toastAudit.process.updateSuccess(data.processo?.titulo || data.titulo || 'Processo'),
      error: (error) => toastAudit.process.updateError(error)
    },
    DELETE: {
      success: () => toastAudit.process.deleteSuccess('Processo'),
      error: (error) => toastAudit.process.deleteError(error)
    }
  },
  
  // Agendamentos
  'agendamentos': {
    POST: {
      success: (data) => toastAudit.schedule.createSuccess(data.data?.titulo || data.titulo || 'Agendamento'),
      error: (error) => {
        // Verificar se é conflito específico
        if (error?.includes('já possui') || error?.includes('conflito')) {
          toastAudit.schedule.conflictError();
        } else {
          toastAudit.schedule.createError(error);
        }
      }
    },
    PUT: {
      success: (data) => toastAudit.schedule.updateSuccess(data.data?.titulo || data.titulo || 'Agendamento'),
      error: (error) => toastAudit.schedule.createError(error)
    },
    DELETE: {
      success: () => toastAudit.schedule.deleteSuccess('Agendamento'),
      error: (error) => toastAudit.error(`Erro ao remover agendamento: ${error}`)
    }
  },
  
  // Usuários
  'usuarios': {
    POST: {
      success: (data) => toastAudit.user.createSuccess(data.usuario?.nome || data.nome || 'Usuário'),
      error: (error) => toastAudit.user.createError(error)
    },
    PUT: {
      success: (data) => toastAudit.user.updateSuccess(data.usuario?.nome || data.nome || 'Usuário'),
      error: (error) => toastAudit.user.createError(error)
    }
  },
  
  // Arquivos
  'arquivos': {
    POST: {
      success: (data) => toastAudit.file.uploadSuccess(data.arquivo?.nome || data.nome || 'Arquivo'),
      error: (error) => toastAudit.file.uploadError(error)
    },
    DELETE: {
      success: () => toastAudit.file.deleteSuccess('Arquivo'),
      error: (error) => toastAudit.error(`Erro ao remover arquivo: ${error}`)
    }
  }
};

/**
 * Classe para interceptar e processar respostas de API automaticamente
 */
class ApiToastInterceptor {
  constructor() {
    this.enabled = true;
    this.debugMode = false;
  }

  /**
   * Habilitar/desabilitar interceptação automática
   */
  setEnabled(enabled) {
    this.enabled = enabled;
  }

  /**
   * Habilitar modo debug
   */
  setDebugMode(debug) {
    this.debugMode = debug;
  }

  /**
   * Processar resposta de sucesso da API
   */
  handleSuccess(url, method, responseData) {
    if (!this.enabled) return;
    
    try {
      const endpoint = this._extractEndpoint(url);
      const config = this._getEndpointConfig(endpoint, method);
      
      if (config?.success) {
        if (this.debugMode) {
          console.log(`🎯 Auto-toast sucesso: ${endpoint} [${method}]`, responseData);
        }
        config.success(responseData);
      }
    } catch (error) {
      console.error('Erro no interceptor de sucesso:', error);
    }
  }

  /**
   * Processar resposta de erro da API
   */
  handleError(url, method, error) {
    if (!this.enabled) return;
    
    try {
      const endpoint = this._extractEndpoint(url);
      const config = this._getEndpointConfig(endpoint, method);
      
      if (config?.error) {
        if (this.debugMode) {
          console.log(`🎯 Auto-toast erro: ${endpoint} [${method}]`, error);
        }
        config.error(error);
      } else {
        // Toast genérico para erros não mapeados
        this._handleGenericError(error, endpoint, method);
      }
    } catch (interceptorError) {
      console.error('Erro no interceptor de erro:', interceptorError);
    }
  }

  /**
   * Extrair endpoint da URL
   */
  _extractEndpoint(url) {
    // Remove base URL e parâmetros
    const cleanUrl = url.replace(/^.*\/api\//, '').split('?')[0];
    
    // Remove IDs numéricos da URL (ex: usuarios/123 -> usuarios)
    return cleanUrl.replace(/\/\d+$/, '').replace(/\/\d+\//, '/');
  }

  /**
   * Obter configuração para endpoint e método
   */
  _getEndpointConfig(endpoint, method) {
    const config = AUTO_TOAST_CONFIG[endpoint];
    
    if (!config) return null;
    
    // Se tem configuração específica por método
    if (config[method]) {
      return config[method];
    }
    
    // Se tem configuração geral (success/error)
    if (config.success || config.error) {
      return config;
    }
    
    return null;
  }

  /**
   * Tratar erros genéricos para endpoints não mapeados
   */
  _handleGenericError(error, endpoint, method) {
    if (this.debugMode) {
      console.log(`🔍 Erro genérico: ${endpoint} [${method}]`, error);
    }

    // Erros comuns de sistema
    if (typeof error === 'string') {
      if (error.includes('Network Error') || error.includes('fetch')) {
        toastAudit.system.networkError();
        return;
      }
      
      if (error.includes('500') || error.includes('Internal Server Error')) {
        toastAudit.system.serverError();
        return;
      }
      
      if (error.includes('401') || error.includes('Unauthorized')) {
        toastAudit.auth.unauthorized();
        return;
      }
      
      if (error.includes('403') || error.includes('Forbidden')) {
        toastAudit.auth.unauthorized();
        return;
      }
    }

    // Toast genérico para outros erros
    toastAudit.error(`Erro na operação: ${error}`);
  }

  /**
   * Wrapper para função de API que automaticamente processa respostas
   */
  wrapApiCall(apiFunction, url, options = {}) {
    return async (...args) => {
      try {
        const result = await apiFunction(...args);
        
        // Processar sucesso
        this.handleSuccess(url, options.method || 'GET', result);
        
        return result;
      } catch (error) {
        // Processar erro
        this.handleError(url, options.method || 'GET', error?.message || error);
        
        // Re-lançar erro para que a aplicação possa tratar se necessário
        throw error;
      }
    };
  }

  /**
   * Configurar interceptação global para fetch ou axios
   */
  setupGlobalInterception() {
    // Para fetch nativo
    if (typeof window !== 'undefined' && window.fetch) {
      const originalFetch = window.fetch;
      
      window.fetch = async (url, options = {}) => {
        try {
          const response = await originalFetch(url, options);
          
          if (response.ok) {
            const data = await response.clone().json().catch(() => ({}));
            this.handleSuccess(url, options.method || 'GET', data);
          } else {
            const errorData = await response.clone().json().catch(() => ({}));
            this.handleError(url, options.method || 'GET', errorData.message || `HTTP ${response.status}`);
          }
          
          return response;
        } catch (error) {
          this.handleError(url, options.method || 'GET', error.message || error);
          throw error;
        }
      };
    }
  }

  /**
   * Remover interceptação global
   */
  removeGlobalInterception() {
    // Implementar se necessário restaurar fetch original
  }
}

// Instância singleton
export const apiToastInterceptor = new ApiToastInterceptor();
export default apiToastInterceptor;
