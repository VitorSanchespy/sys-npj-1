/**
 * HOOKS E UTILITÁRIOS PARA INTEGRAÇÃO DO SISTEMA DE TOAST
 * 
 * Este módulo fornece hooks e funções utilitárias para facilitar
 * a integração do sistema de toast audit em componentes React.
 */

import { useCallback, useEffect, useRef } from 'react';
import { toastAudit } from './toastSystemAudit';
import { apiToastInterceptor } from './apiToastInterceptor';

/**
 * Hook para usar o sistema de toast audit
 */
export const useToastAudit = () => {
  return {
    // Métodos de autenticação
    auth: toastAudit.auth,
    
    // Métodos de processo
    process: toastAudit.process,
    
    // Métodos de agendamento
    schedule: toastAudit.schedule,
    
    // Métodos de usuário
    user: toastAudit.user,
    
    // Métodos de arquivo
    file: toastAudit.file,
    
    // Métodos de validação
    validation: toastAudit.validation,
    
    // Métodos de sistema
    system: toastAudit.system,
    
    // Métodos básicos
    success: toastAudit.success,
    error: toastAudit.error,
    warning: toastAudit.warning,
    info: toastAudit.info,
    
    // Utilitários
    clear: toastAudit.clear,
    getActiveToasts: toastAudit.getActiveToasts
  };
};

/**
 * Hook para operações de API com toast automático
 */
export const useApiWithToast = () => {
  const pendingRequests = useRef(new Set());
  
  /**
   * Executar operação de API com toast automático
   */
  const executeApi = useCallback(async (
    apiFunction,
    options = {}
  ) => {
    const {
      url = '',
      method = 'GET',
      showLoading = false,
      loadingMessage = 'Processando...',
      preventDuplicateLoading = true,
      onSuccess,
      onError,
      successMessage,
      errorMessage
    } = options;
    
    // Prevenir duplicação de requisições se habilitado
    const requestKey = `${method}:${url}`;
    if (preventDuplicateLoading && pendingRequests.current.has(requestKey)) {
      toastAudit.warning('Operação já em andamento...');
      return;
    }
    
    // Adicionar à lista de requisições pendentes
    if (preventDuplicateLoading) {
      pendingRequests.current.add(requestKey);
    }
    
    // Mostrar loading se solicitado
    let loadingToastId = null;
    if (showLoading) {
      loadingToastId = toastAudit.info(loadingMessage, { autoClose: false });
    }
    
    try {
      // Executar função da API
      const result = await apiFunction();
      
      // Remover loading
      if (loadingToastId) {
        toastAudit.clear(loadingToastId);
      }
      
      // Toast de sucesso personalizado ou automático
      if (successMessage) {
        toastAudit.success(successMessage);
      } else {
        // Interceptor automático processará
        apiToastInterceptor.handleSuccess(url, method, result);
      }
      
      // Callback de sucesso
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
      
    } catch (error) {
      // Remover loading
      if (loadingToastId) {
        toastAudit.clear(loadingToastId);
      }
      
      // Toast de erro personalizado ou automático
      if (errorMessage) {
        toastAudit.error(errorMessage);
      } else {
        // Interceptor automático processará
        apiToastInterceptor.handleError(url, method, error?.message || error);
      }
      
      // Callback de erro
      if (onError) {
        onError(error);
      }
      
      throw error;
      
    } finally {
      // Remover da lista de requisições pendentes
      if (preventDuplicateLoading) {
        pendingRequests.current.delete(requestKey);
      }
    }
  }, []);
  
  // Limpar requisições pendentes quando componente desmonta
  useEffect(() => {
    return () => {
      pendingRequests.current.clear();
    };
  }, []);
  
  return {
    executeApi,
    clearPendingRequests: () => pendingRequests.current.clear()
  };
};

/**
 * Hook para validação de formulário com toast
 */
export const useFormValidationToast = () => {
  const toast = useToastAudit();
  
  /**
   * Validar campo obrigatório
   */
  const validateRequired = useCallback((value, fieldName) => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      toast.validation.requiredField(fieldName);
      return false;
    }
    return true;
  }, [toast]);
  
  /**
   * Validar email
   */
  const validateEmail = useCallback((email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.validation.invalidEmail();
      return false;
    }
    return true;
  }, [toast]);
  
  /**
   * Validar senha
   */
  const validatePassword = useCallback((password, minLength = 6) => {
    if (!password || password.length < minLength) {
      toast.validation.invalidFormat(`Senha deve ter pelo menos ${minLength} caracteres`);
      return false;
    }
    return true;
  }, [toast]);
  
  /**
   * Validar confirmação de senha
   */
  const validatePasswordConfirmation = useCallback((password, confirmation) => {
    if (password !== confirmation) {
      toast.validation.invalidFormat('Senhas não coincidem');
      return false;
    }
    return true;
  }, [toast]);
  
  /**
   * Validar data
   */
  const validateDate = useCallback((date, fieldName = 'Data') => {
    if (!date || isNaN(new Date(date).getTime())) {
      toast.validation.invalidFormat(`${fieldName} inválida`);
      return false;
    }
    return true;
  }, [toast]);
  
  /**
   * Validar data futura
   */
  const validateFutureDate = useCallback((date, fieldName = 'Data') => {
    if (!validateDate(date, fieldName)) return false;
    
    if (new Date(date) <= new Date()) {
      toast.validation.invalidFormat(`${fieldName} deve ser futura`);
      return false;
    }
    return true;
  }, [toast]);
  
  return {
    validateRequired,
    validateEmail,
    validatePassword,
    validatePasswordConfirmation,
    validateDate,
    validateFutureDate,
    toast
  };
};

/**
 * Hook para operações CRUD com toast automático
 */
export const useCrudToast = (entityName = 'Item') => {
  const toast = useToastAudit();
  const { executeApi } = useApiWithToast();
  
  /**
   * Criar entidade
   */
  const create = useCallback(async (apiFunction, data) => {
    return executeApi(apiFunction, {
      url: `${entityName.toLowerCase()}s`,
      method: 'POST',
      showLoading: true,
      loadingMessage: `Criando ${entityName.toLowerCase()}...`
    });
  }, [executeApi, entityName]);
  
  /**
   * Atualizar entidade
   */
  const update = useCallback(async (apiFunction, id, data) => {
    return executeApi(apiFunction, {
      url: `${entityName.toLowerCase()}s/${id}`,
      method: 'PUT',
      showLoading: true,
      loadingMessage: `Atualizando ${entityName.toLowerCase()}...`
    });
  }, [executeApi, entityName]);
  
  /**
   * Deletar entidade
   */
  const remove = useCallback(async (apiFunction, id) => {
    return executeApi(apiFunction, {
      url: `${entityName.toLowerCase()}s/${id}`,
      method: 'DELETE',
      showLoading: true,
      loadingMessage: `Removendo ${entityName.toLowerCase()}...`
    });
  }, [executeApi, entityName]);
  
  /**
   * Listar entidades (sem toast automático)
   */
  const list = useCallback(async (apiFunction) => {
    return executeApi(apiFunction, {
      url: `${entityName.toLowerCase()}s`,
      method: 'GET',
      showLoading: false
    });
  }, [executeApi, entityName]);
  
  return {
    create,
    update,
    remove,
    list,
    toast
  };
};

/**
 * Utilitário para configurar interceptação global
 */
export const setupGlobalToastInterception = () => {
  apiToastInterceptor.setupGlobalInterception();
};

/**
 * Utilitário para remover interceptação global
 */
export const removeGlobalToastInterception = () => {
  apiToastInterceptor.removeGlobalInterception();
};

/**
 * Utilitário para configurar modo debug
 */
export const setToastDebugMode = (enabled) => {
  apiToastInterceptor.setDebugMode(enabled);
};

// Exportar tudo junto
export default {
  useToastAudit,
  useApiWithToast,
  useFormValidationToast,
  useCrudToast,
  setupGlobalToastInterception,
  removeGlobalToastInterception,
  setToastDebugMode
};
