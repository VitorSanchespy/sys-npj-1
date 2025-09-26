// Hook para feedback automático de APIs MELHORADO - com detecção de sessão
import { toastService } from '../services/toastService';
import { toastAudit } from '../services/toastSystemAudit';
import { useAuthContext } from '../contexts/AuthContext';

export const useApiFeedback = () => {
  const { forceReauth, tryRefreshToken } = useAuthContext();

  // Função para extrair mensagem de erro mais detalhada
  const extractErrorMessage = (error) => {
    if (error?.response?.data?.message) {
      return error.response.data.message;
    }
    if (error?.response?.data?.error || error?.response?.data?.erro) {
      return error.response.data.error || error.response.data.erro;
    }
    if (error?.message) {
      return error.message;
    }
    if (error?.status || error?.response?.status) {
      const status = error?.status || error?.response?.status;
      switch (status) {
        case 400:
          return 'Dados inválidos. Verifique as informações enviadas.';
        case 401:
          return 'Token expirado ou inválido. Sessão será renovada automaticamente.';
        case 403:
          return 'Acesso negado. Você não tem permissão para esta ação.';
        case 404:
          return 'Recurso não encontrado.';
        case 409:
          return 'Conflito. Dados já existem ou estão em uso.';
        case 422:
          return 'Dados inválidos. Verifique os campos obrigatórios.';
        case 429:
          return 'Muitas tentativas. Tente novamente em alguns minutos.';
        case 500:
          return 'Erro interno do servidor. Tente novamente mais tarde.';
        case 503:
          return 'Serviço temporariamente indisponível. Tente novamente em alguns minutos.';
        default:
          return `Erro ${status}: Falha na comunicação com o servidor`;
      }
    }
    return 'Erro inesperado. Tente novamente.';
  };

  // Função para detectar e tratar erros de autenticação - NOVA
  const handleAuthError = async (error) => {
    const status = error?.status || error?.response?.status;
    
    if (status === 401) {
      console.log('🔒 Erro de autenticação detectado no useApiFeedback');
      
      // Tentar renovar token automaticamente
      try {
        const renewed = await tryRefreshToken();
        if (renewed) {
          toastAudit.success('Sessão renovada automaticamente');
          return { renewed: true };
        }
      } catch (refreshError) {
        console.log('❌ Falha na renovação automática:', refreshError);
      }
      
      // Se não conseguiu renovar, forçar nova autenticação
      forceReauth('Sua sessão expirou. Faça login novamente.');
      return { renewed: false, forceLogin: true };
    }
    
    return { renewed: false, forceLogin: false };
  };

  // Função para mostrar feedback de sucesso
  const showSuccessFeedback = (message, action = '') => {
    const successMessages = {
      'login': '🎉 Login realizado com sucesso!',
      'register': '✅ Cadastro realizado com sucesso! Bem-vindo(a)!',
      'logout': '👋 Logout realizado com sucesso!',
      'create': '✅ Criado com sucesso!',
      'update': '✅ Atualizado com sucesso!',
      'delete': '🗑️ Excluído com sucesso!',
      'upload': '📁 Arquivo enviado com sucesso!',
      'download': '⬇️ Download iniciado!',
      'save': '💾 Salvo com sucesso!',
      'send': '📤 Enviado com sucesso!',
      'approve': '✅ Aprovado com sucesso!',
      'reject': '❌ Rejeitado com sucesso!',
      'assign': '👥 Atribuído com sucesso!',
      'unassign': '👤 Desvinculado com sucesso!',
      'sync': '🔄 Sincronizado com sucesso!',
      'reset': '🔄 Redefinido com sucesso!',
      'default': message || '✅ Operação realizada com sucesso!'
    };

    const finalMessage = successMessages[action] || successMessages['default'];
    toastService.success(finalMessage);
  };

  // Função para mostrar feedback de erro - MELHORADA
  const showErrorFeedback = async (error, context = '') => {
    // Primeiro, verificar se é erro de autenticação
    const authResult = await handleAuthError(error);
    
    if (authResult.forceLogin) {
      // Se força login, não mostrar erro adicional
      return;
    }
    
    if (authResult.renewed) {
      // Se token foi renovado, não mostrar erro
      return;
    }
    
    const errorMessage = extractErrorMessage(error);
    
    // Contextos específicos para melhor UX
    const contextMessages = {
      'login': `❌ Falha no login: ${errorMessage}`,
      'register': `❌ Falha no cadastro: ${errorMessage}`,
      'create': `❌ Falha ao criar: ${errorMessage}`,
      'update': `❌ Falha ao atualizar: ${errorMessage}`,
      'delete': `❌ Falha ao excluir: ${errorMessage}`,
      'upload': `❌ Falha no upload: ${errorMessage}`,
      'fetch': `❌ Falha ao carregar: ${errorMessage}`,
      'sync': `❌ Falha na sincronização: ${errorMessage}`,
      'session': `🔒 Problema de sessão: ${errorMessage}`,
      'network': `🌐 Problema de conexão: ${errorMessage}`,
      'default': `❌ Erro: ${errorMessage}`
    };

    const finalMessage = contextMessages[context] || contextMessages['default'];
    
    // Usar sistema de toast auditado para melhor consistência
    toastAudit.error(finalMessage, context);
  };

  // Função para mostrar avisos
  const showWarningFeedback = (message, context = '') => {
    const warningMessages = {
      'validation': `⚠️ Atenção: ${message}`,
      'permission': '⚠️ Você não tem permissão para esta ação.',
      'offline': '⚠️ Você está offline. Algumas funcionalidades podem não funcionar.',
      'session': '⚠️ Sua sessão está expirando. Faça login novamente.',
      'limit': '⚠️ Limite atingido. Aguarde antes de tentar novamente.',
      'default': `⚠️ ${message}`
    };

    const finalMessage = warningMessages[context] || warningMessages['default'];
    toastService.warning(finalMessage);
  };

  // Wrapper para requisições com feedback automático - MELHORADO
  const withFeedback = async (
    apiCall, 
    { 
      successMessage = '', 
      successAction = 'default',
      errorContext = 'default',
      showLoading = false,
      retryOnAuthError = true 
    } = {}
  ) => {
    try {
      if (showLoading) {
        toastAudit.system.loading('Processando...');
      }

      const result = await apiCall();
      
      // Mostrar sucesso
      showSuccessFeedback(successMessage, successAction);
      
      return { success: true, data: result };
    } catch (error) {
      // Verificar se é erro de autenticação e tentar renovar
      if (retryOnAuthError && (error?.status === 401 || error?.response?.status === 401)) {
        console.log('🔄 Tentando renovar token e repetir requisição...');
        
        const authResult = await handleAuthError(error);
        
        if (authResult.renewed) {
          // Token renovado, tentar a requisição novamente
          try {
            const retryResult = await apiCall();
            showSuccessFeedback(successMessage, successAction);
            return { success: true, data: retryResult, retried: true };
          } catch (retryError) {
            // Se falhar na segunda tentativa, mostrar erro
            await showErrorFeedback(retryError, errorContext);
            return { 
              success: false, 
              error: extractErrorMessage(retryError),
              originalError: retryError,
              retried: true
            };
          }
        }
        
        if (authResult.forceLogin) {
          // Se forçou login, não mostrar erro adicional
          return { 
            success: false, 
            error: 'Sessão expirada',
            originalError: error,
            forceLogin: true
          };
        }
      }
      
      // Para outros erros ou se não conseguiu renovar
      await showErrorFeedback(error, errorContext);
      
      return { 
        success: false, 
        error: extractErrorMessage(error),
        originalError: error 
      };
    }
  };

  return {
    showSuccessFeedback,
    showErrorFeedback,
    showWarningFeedback,
    withFeedback,
    extractErrorMessage
  };
};

export default useApiFeedback;
