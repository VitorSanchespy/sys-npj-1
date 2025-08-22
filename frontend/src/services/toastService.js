import { toast } from 'react-toastify';

/**
 * Serviço de Toast para notificações simples e temporárias
 * Substitui o sistema de notificações legado
 */
class ToastService {
  
  // Toast de sucesso
  success(message, options = {}) {
    toast.success(message, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options
    });
  }

  // Toast de erro
  error(message, options = {}) {
    toast.error(message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options
    });
  }

  // Toast de informação
  info(message, options = {}) {
    toast.info(message, {
      position: "top-right",
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options
    });
  }

  // Toast de aviso
  warning(message, options = {}) {
    toast.warn(message, {
      position: "top-right",
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options
    });
  }

  // Toast personalizado
  custom(message, type = 'default', options = {}) {
    toast(message, {
      type: type,
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options
    });
  }

  // Toast para operações de processo
  processCreated(processName) {
    this.success(`Processo "${processName}" criado com sucesso!`);
  }

  processUpdated(processName) {
    this.info(`Processo "${processName}" atualizado!`);
  }

  processDeleted(processName) {
    this.warning(`Processo "${processName}" excluído!`);
  }

  // Toast para operações de agendamento
  scheduleCreated(title) {
    this.success(`Agendamento "${title}" criado!`);
  }

  scheduleUpdated(title) {
    this.info(`Agendamento "${title}" atualizado!`);
  }

  scheduleDeleted(title) {
    this.warning(`Agendamento "${title}" removido!`);
  }

  // Toast para operações de arquivo
  fileUploaded(fileName) {
    this.success(`Arquivo "${fileName}" enviado com sucesso!`);
  }

  fileDeleted(fileName) {
    this.warning(`Arquivo "${fileName}" removido!`);
  }

  // Toast para operações de usuário
  userLoggedIn(userName) {
    this.success(`Bem-vindo, ${userName}!`);
  }

  userLoggedOut() {
    this.info('Logout realizado com sucesso!');
  }

  // Toast para erros comuns
  networkError() {
    this.error('Erro de conexão. Verifique sua internet.');
  }

  serverError() {
    this.error('Erro interno do servidor. Tente novamente.');
  }

  unauthorized() {
    this.error('Acesso negado. Faça login novamente.');
  }

  validationError(message = 'Dados inválidos') {
    this.error(message);
  }
}

export const toastService = new ToastService();
export default toastService;
