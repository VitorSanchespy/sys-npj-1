/**
 * AUDITORIA COMPLETA DO SISTEMA DE NOTIFICAÇÕES TOAST
 * 
 * Este módulo centraliza todas as notificações do sistema NPJ,
 * garantindo consistência, evitando duplicatas e padronizando mensagens.
 */

import { toastService } from './toastService';

/**
 * Sistema centralizado de notificações para todo o fluxo do usuário
 */
class ToastSystemAudit {
  constructor() {
    this.activeToasts = new Set(); // Previne duplicatas
    this.lastToastTime = {};       // Controla timing
    this.duplicateThreshold = 2000; // 2 segundos para prevenir spam
  }

  /**
   * Método principal para exibir toast com verificação anti-duplicata
   */
  showToast(type, message, context = '', options = {}) {
    const toastKey = `${type}-${message}-${context}`;
    const now = Date.now();
    
    // Verificar se já existe toast similar recente
    if (this.lastToastTime[toastKey] && 
        (now - this.lastToastTime[toastKey] < this.duplicateThreshold)) {
      console.log(`🚫 Toast duplicado bloqueado: ${message}`);
      return;
    }
    
    this.lastToastTime[toastKey] = now;
    this.activeToasts.add(toastKey);
    
    // Executar toast através do toastService
    toastService[type](message, options);
    
    // Remover da lista após duração padrão
    setTimeout(() => {
      this.activeToasts.delete(toastKey);
    }, options.autoClose || 5000);
  }

  /**
   * Limpar cache de toasts para permitir novas notificações
   */
  clearCache() {
    this.activeToasts.clear();
    this.lastToastTime = {};
  }

  // ============= AUTENTICAÇÃO =============
  auth = {
    loginSuccess: (userName) => {
      this.showToast('success', `🎉 Bem-vindo(a), ${userName}!`, 'auth.login');
    },
    
    loginError: (error) => {
      const message = this._getLoginErrorMessage(error);
      this.showToast('error', message, 'auth.login');
    },
    
    logoutSuccess: () => {
      this.showToast('info', '👋 Logout realizado com sucesso!', 'auth.logout');
    },
    
    registerSuccess: (userName) => {
      this.showToast('success', `✅ Conta criada com sucesso! Bem-vindo(a), ${userName}!`, 'auth.register');
    },
    
    registerError: (error) => {
      const message = this._getRegisterErrorMessage(error);
      this.showToast('error', message, 'auth.register');
    },
    
    passwordChangeSuccess: () => {
      this.showToast('success', '🔐 Senha alterada com sucesso!', 'auth.password');
    },
    
    passwordResetSuccess: () => {
      this.showToast('success', '📧 E-mail de recuperação enviado!', 'auth.reset');
    },
    
    sessionExpired: () => {
      this.showToast('warning', '⏰ Sessão expirada. Faça login novamente.', 'auth.session');
    },
    
    unauthorized: () => {
      this.showToast('error', '🚫 Acesso negado. Verifique suas permissões.', 'auth.permission');
    }
  };

  // ============= PROCESSOS =============
  process = {
    createSuccess: (processName) => {
      this.showToast('success', `📋 Processo "${processName}" criado com sucesso!`, 'process.create');
    },
    
    createError: (error) => {
      const message = this._getProcessErrorMessage(error, 'criar');
      this.showToast('error', message, 'process.create');
    },
    
    updateSuccess: (processName) => {
      this.showToast('info', `📝 Processo "${processName}" atualizado!`, 'process.update');
    },
    
    updateError: (error) => {
      const message = this._getProcessErrorMessage(error, 'atualizar');
      this.showToast('error', message, 'process.update');
    },
    
    deleteSuccess: (processName) => {
      this.showToast('warning', `🗑️ Processo "${processName}" excluído!`, 'process.delete');
    },
    
    deleteError: (error) => {
      this.showToast('error', `❌ Erro ao excluir processo: ${error}`, 'process.delete');
    },
    
    assignSuccess: (studentName, processName) => {
      this.showToast('success', `👥 ${studentName} atribuído ao processo "${processName}"!`, 'process.assign');
    },
    
    statusChangeSuccess: (status) => {
      this.showToast('info', `📊 Status alterado para "${status}"!`, 'process.status');
    }
  };

  // ============= AGENDAMENTOS =============
  schedule = {
    createSuccess: (title) => {
      this.showToast('success', `📅 Agendamento "${title}" criado! Aguardando aprovação.`, 'schedule.create');
    },
    
    createError: (error) => {
      const message = this._getScheduleErrorMessage(error);
      this.showToast('error', message, 'schedule.create');
    },
    
    updateSuccess: (title) => {
      this.showToast('info', `📝 Agendamento "${title}" atualizado!`, 'schedule.update');
    },
    
    deleteSuccess: (title) => {
      this.showToast('warning', `🗑️ Agendamento "${title}" removido!`, 'schedule.delete');
    },
    
    approveSuccess: (title) => {
      this.showToast('success', `✅ Agendamento "${title}" aprovado!`, 'schedule.approve');
    },
    
    rejectSuccess: (title) => {
      this.showToast('warning', `❌ Agendamento "${title}" recusado!`, 'schedule.reject');
    },
    
    conflictError: () => {
      this.showToast('error', '⚠️ Você já possui um agendamento no mesmo horário', 'schedule.conflict');
    },
    
    reminderSent: (title) => {
      this.showToast('info', `📧 Lembrete enviado para "${title}"!`, 'schedule.reminder');
    }
  };

  // ============= USUÁRIOS =============
  user = {
    createSuccess: (userName) => {
      this.showToast('success', `👤 Usuário "${userName}" criado com sucesso!`, 'user.create');
    },
    
    createError: (error) => {
      const message = this._getUserErrorMessage(error, 'criar');
      this.showToast('error', message, 'user.create');
    },
    
    updateSuccess: (userName) => {
      this.showToast('info', `👤 Usuário "${userName}" atualizado!`, 'user.update');
    },
    
    deactivateSuccess: (userName) => {
      this.showToast('warning', `👤 Usuário "${userName}" inativado!`, 'user.deactivate');
    },
    
    activateSuccess: (userName) => {
      this.showToast('success', `👤 Usuário "${userName}" reativado!`, 'user.activate');
    }
  };

  // ============= ARQUIVOS/DOCUMENTOS =============
  file = {
    uploadSuccess: (fileName) => {
      this.showToast('success', `📁 Arquivo "${fileName}" enviado com sucesso!`, 'file.upload');
    },
    
    uploadError: (error) => {
      this.showToast('error', `❌ Erro no upload: ${error}`, 'file.upload');
    },
    
    deleteSuccess: (fileName) => {
      this.showToast('warning', `🗑️ Arquivo "${fileName}" removido!`, 'file.delete');
    },
    
    downloadStart: (fileName) => {
      this.showToast('info', `⬇️ Download de "${fileName}" iniciado!`, 'file.download');
    },
    
    maxSizeError: () => {
      this.showToast('error', '📏 Arquivo muito grande. Tamanho máximo: 10MB', 'file.size');
    },
    
    invalidTypeError: () => {
      this.showToast('error', '📄 Tipo de arquivo não permitido', 'file.type');
    }
  };

  // ============= VALIDAÇÃO E FORMULÁRIOS =============
  validation = {
    requiredField: (fieldName) => {
      this.showToast('warning', `⚠️ ${fieldName} é obrigatório`, 'validation.required');
    },
    
    invalidEmail: () => {
      this.showToast('warning', '📧 E-mail deve ter um formato válido', 'validation.email');
    },
    
    passwordTooShort: () => {
      this.showToast('warning', '🔐 Senha deve ter pelo menos 6 caracteres', 'validation.password');
    },
    
    invalidDate: () => {
      this.showToast('warning', '📅 Data inválida. Verifique o formato', 'validation.date');
    },
    
    formSaveSuccess: () => {
      this.showToast('success', '💾 Dados salvos com sucesso!', 'validation.save');
    },
    
    formError: (error) => {
      this.showToast('error', `❌ Erro nos dados: ${error}`, 'validation.form');
    }
  };

  // ============= SISTEMA E CONEXÃO =============
  system = {
    networkError: () => {
      this.showToast('error', '🌐 Erro de conexão. Verifique sua internet.', 'system.network');
    },
    
    serverError: () => {
      this.showToast('error', '🔧 Erro interno do servidor. Tente novamente.', 'system.server');
    },
    
    loading: (message = 'Carregando...') => {
      this.showToast('info', `⏳ ${message}`, 'system.loading', { autoClose: 2000 });
    },
    
    syncSuccess: () => {
      this.showToast('success', '🔄 Dados sincronizados!', 'system.sync');
    },
    
    maintenanceMode: () => {
      this.showToast('warning', '🔧 Sistema em manutenção. Algumas funcionalidades podem estar indisponíveis.', 'system.maintenance');
    }
  };

  // ============= MÉTODOS AUXILIARES =============
  
  _getLoginErrorMessage(error) {
    if (typeof error === 'string') {
      // Tratar mensagens específicas do backend
      if (error.includes('Email não encontrado') || error.includes('não encontrado no sistema')) {
        return '❌ E-mail não encontrado no sistema. Verifique se digitou corretamente ou faça seu cadastro.';
      }
      if (error.includes('Senha incorreta')) {
        return '❌ Senha incorreta. Verifique sua senha e tente novamente.';
      }
      if (error.includes('Email e senha são obrigatórios')) {
        return '⚠️ E-mail e senha são obrigatórios para fazer login.';
      }
      if (error.includes('inativ') || error.includes('bloqueado')) {
        return '❌ Sua conta está inativa. Entre em contato com o administrador.';
      }
      if (error.includes('Banco de dados não disponível')) {
        return '🔧 Sistema temporariamente indisponível. Tente novamente em alguns instantes.';
      }
      if (error.includes('Erro interno do servidor')) {
        return '🔧 Erro interno do servidor. Entre em contato com o suporte se persistir.';
      }
    }
    
    // Se for um objeto de erro com propriedades específicas
    if (error && typeof error === 'object') {
      if (error.status === 404) {
        return '❌ E-mail não encontrado no sistema. Verifique se digitou corretamente ou faça seu cadastro.';
      }
      if (error.status === 401) {
        return '❌ Senha incorreta. Verifique sua senha e tente novamente.';
      }
      if (error.status === 400) {
        return '⚠️ E-mail e senha são obrigatórios para fazer login.';
      }
      if (error.status === 503) {
        return '🔧 Sistema temporariamente indisponível. Tente novamente em alguns instantes.';
      }
      if (error.status === 500) {
        return '🔧 Erro interno do servidor. Entre em contato com o suporte se persistir.';
      }
    }
    
    return `❌ Falha no login: ${error || 'Erro inesperado. Tente novamente.'}`;
  }

  _getRegisterErrorMessage(error) {
    if (typeof error === 'string') {
      if (error.includes('email') && error.includes('existe')) {
        return '❌ Este e-mail já está cadastrado. Tente fazer login ou use outro e-mail.';
      }
      if (error.includes('senha')) {
        return '❌ Senha não atende aos critérios de segurança. Use pelo menos 6 caracteres.';
      }
      if (error.includes('telefone')) {
        return '❌ Telefone inválido. Use um formato válido com DDD.';
      }
    }
    return `❌ Falha no cadastro: ${error || 'Erro inesperado. Tente novamente.'}`;
  }

  _getProcessErrorMessage(error, action) {
    if (typeof error === 'string') {
      if (error.includes('duplicat') || error.includes('existe')) {
        return '❌ Já existe um processo com este número';
      }
      if (error.includes('validation') || error.includes('inválido')) {
        return '❌ Dados inválidos. Verifique os campos obrigatórios';
      }
      if (error.includes('permission') || error.includes('permissão')) {
        return '❌ Você não tem permissão para esta ação';
      }
    }
    return `❌ Erro ao ${action} processo: ${error || 'Erro inesperado'}`;
  }

  _getScheduleErrorMessage(error) {
    if (typeof error === 'string') {
      if (error.includes('conflito') || error.includes('já existe')) {
        return '⚠️ Você já possui um agendamento no mesmo horário';
      }
      if (error.includes('data') || error.includes('horário')) {
        return '❌ Erro nas datas: verifique se estão corretas';
      }
      if (error.includes('validation') || error.includes('inválido')) {
        return '❌ Dados inválidos. Verifique os campos obrigatórios';
      }
    }
    return `❌ Erro ao criar agendamento: ${error || 'Erro inesperado'}`;
  }

  _getUserErrorMessage(error, action) {
    if (typeof error === 'string') {
      if (error.includes('email') && error.includes('existe')) {
        return '❌ Este e-mail já está cadastrado no sistema';
      }
      if (error.includes('validation') || error.includes('inválido')) {
        return '❌ Dados inválidos. Verifique os campos obrigatórios';
      }
    }
    return `❌ Erro ao ${action} usuário: ${error || 'Erro inesperado'}`;
  }

  // ============= MÉTODOS DE UTILITÁRIOS =============
  
  /**
   * Exibir toast de sucesso genérico
   */
  success(message, context = '') {
    this.showToast('success', message, context);
  }

  /**
   * Exibir toast de erro genérico
   */
  error(message, context = '') {
    this.showToast('error', message, context);
  }

  /**
   * Exibir toast de aviso genérico
   */
  warning(message, context = '') {
    this.showToast('warning', message, context);
  }

  /**
   * Exibir toast de informação genérico
   */
  info(message, context = '') {
    this.showToast('info', message, context);
  }

  /**
   * Método para debug - listar toasts ativos
   */
  debug() {
    console.log('🔍 Toasts ativos:', Array.from(this.activeToasts));
    console.log('🕐 Último timing:', this.lastToastTime);
  }
}

// Instância singleton
export const toastAudit = new ToastSystemAudit();
export default toastAudit;
