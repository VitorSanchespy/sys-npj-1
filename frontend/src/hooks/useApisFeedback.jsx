// Hook para feedback automático de APIs - intercepta requisições e mostra toasts
import { useToast } from '../components/common/Toast';

export const useApiFeedback = () => {
  const { showSuccess, showError, showWarning } = useToast();

  // Função para extrair mensagem de erro mais detalhada
  const extractErrorMessage = (error) => {
    if (error?.response?.data?.message) {
      return error.response.data.message;
    }
    if (error?.response?.data?.error) {
      return error.response.data.error;
    }
    if (error?.message) {
      return error.message;
    }
    if (error?.response?.status) {
      switch (error.response.status) {
        case 400:
          return 'Dados inválidos. Verifique as informações enviadas.';
        case 401:
          return 'Não autorizado. Faça login novamente.';
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
        default:
          return `Erro ${error.response.status}: ${error.response.statusText}`;
      }
    }
    return 'Erro inesperado. Tente novamente.';
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
    showSuccess(finalMessage, 3000);
  };

  // Função para mostrar feedback de erro
  const showErrorFeedback = (error, context = '') => {
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
      'default': `❌ Erro: ${errorMessage}`
    };

    const finalMessage = contextMessages[context] || contextMessages['default'];
    showError(finalMessage, 5000);
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
    showWarning(finalMessage, 4000);
  };

  // Wrapper para requisições com feedback automático
  const withFeedback = async (
    apiCall, 
    { 
      successMessage = '', 
      successAction = 'default',
      errorContext = 'default',
      showLoading = false 
    } = {}
  ) => {
    try {
      if (showLoading) {
        // Aqui poderia adicionar um loading toast se necessário
      }

      const result = await apiCall();
      
      // Mostrar sucesso
      showSuccessFeedback(successMessage, successAction);
      
      return { success: true, data: result };
    } catch (error) {
      // Mostrar erro
      showErrorFeedback(error, errorContext);
      
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
