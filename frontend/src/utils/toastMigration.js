/**
 * MIGRAÇÃO AUTOMATIZADA DO SISTEMA DE TOAST
 * 
 * Este utilitário ajuda a migrar código existente do react-toastify
 * para o novo Sistema de Toast Audit.
 */

import { toastAudit } from '../services/toastSystemAudit';

/**
 * Wrapper de compatibilidade para código legado
 * Permite uso gradual do novo sistema
 */
class ToastMigrationWrapper {
  constructor() {
    this.migrationMode = true;
    this.logMigrations = true;
  }

  /**
   * Habilitar/desabilitar modo de migração
   */
  setMigrationMode(enabled) {
    this.migrationMode = enabled;
  }

  /**
   * Wrapper para toast.success - detecta padrões e migra
   */
  success(message, options = {}) {
    if (this.migrationMode) {
      const migratedToast = this._detectAndMigrate('success', message);
      if (migratedToast) {
        this._logMigration('success', message, migratedToast);
        return migratedToast;
      }
    }
    
    // Fallback para método original
    return toastAudit.success(message, options);
  }

  /**
   * Wrapper para toast.error - detecta padrões e migra
   */
  error(message, options = {}) {
    if (this.migrationMode) {
      const migratedToast = this._detectAndMigrate('error', message);
      if (migratedToast) {
        this._logMigration('error', message, migratedToast);
        return migratedToast;
      }
    }
    
    // Fallback para método original
    return toastAudit.error(message, options);
  }

  /**
   * Wrapper para toast.warning
   */
  warning(message, options = {}) {
    return toastAudit.warning(message, options);
  }

  /**
   * Wrapper para toast.info
   */
  info(message, options = {}) {
    return toastAudit.info(message, options);
  }

  /**
   * Detectar padrões comuns e migrar automaticamente
   */
  _detectAndMigrate(type, message) {
    const msgLower = message.toLowerCase();
    
    // Padrões de autenticação
    if (this._matchesAuthPattern(msgLower)) {
      return this._migrateAuthToast(type, message, msgLower);
    }
    
    // Padrões de processo
    if (this._matchesProcessPattern(msgLower)) {
      return this._migrateProcessToast(type, message, msgLower);
    }
    
    // Padrões de agendamento
    if (this._matchesSchedulePattern(msgLower)) {
      return this._migrateScheduleToast(type, message, msgLower);
    }
    
    // Padrões de usuário
    if (this._matchesUserPattern(msgLower)) {
      return this._migrateUserToast(type, message, msgLower);
    }
    
    // Padrões de arquivo
    if (this._matchesFilePattern(msgLower)) {
      return this._migrateFileToast(type, message, msgLower);
    }
    
    // Padrões de validação
    if (this._matchesValidationPattern(msgLower)) {
      return this._migrateValidationToast(type, message, msgLower);
    }
    
    return null;
  }

  /**
   * Verificar padrões de autenticação
   */
  _matchesAuthPattern(msg) {
    const authPatterns = [
      'login', 'logout', 'entrar', 'sair', 'autenticação',
      'credenciais', 'senha', 'usuário logado', 'sessão',
      'autorização', 'acesso negado', 'não autorizado'
    ];
    return authPatterns.some(pattern => msg.includes(pattern));
  }

  /**
   * Migrar toasts de autenticação
   */
  _migrateAuthToast(type, message, msgLower) {
    if (type === 'success') {
      if (msgLower.includes('login') || msgLower.includes('entrar')) {
        const userName = this._extractUserName(message);
        return toastAudit.auth.loginSuccess(userName || 'Usuário');
      }
      if (msgLower.includes('logout') || msgLower.includes('sair')) {
        return toastAudit.auth.logoutSuccess();
      }
      if (msgLower.includes('cadastro') || msgLower.includes('registro')) {
        const userName = this._extractUserName(message);
        return toastAudit.auth.registerSuccess(userName || 'Usuário');
      }
    }
    
    if (type === 'error') {
      if (msgLower.includes('login') || msgLower.includes('entrar')) {
        return toastAudit.auth.loginError(message);
      }
      if (msgLower.includes('autorização') || msgLower.includes('acesso negado')) {
        return toastAudit.auth.unauthorized();
      }
      if (msgLower.includes('cadastro') || msgLower.includes('registro')) {
        return toastAudit.auth.registerError(message);
      }
    }
    
    return null;
  }

  /**
   * Verificar padrões de processo
   */
  _matchesProcessPattern(msg) {
    const processPatterns = [
      'processo', 'criado', 'atualizado', 'removido', 'excluído',
      'salvo', 'editado', 'deletado'
    ];
    return processPatterns.some(pattern => msg.includes(pattern));
  }

  /**
   * Migrar toasts de processo
   */
  _migrateProcessToast(type, message, msgLower) {
    const processTitle = this._extractEntityName(message, 'processo');
    
    if (type === 'success') {
      if (msgLower.includes('criado') || msgLower.includes('salvo')) {
        return toastAudit.process.createSuccess(processTitle || 'Processo');
      }
      if (msgLower.includes('atualizado') || msgLower.includes('editado')) {
        return toastAudit.process.updateSuccess(processTitle || 'Processo');
      }
      if (msgLower.includes('removido') || msgLower.includes('excluído') || msgLower.includes('deletado')) {
        return toastAudit.process.deleteSuccess(processTitle || 'Processo');
      }
    }
    
    if (type === 'error') {
      if (msgLower.includes('criar') || msgLower.includes('salvar')) {
        return toastAudit.process.createError(message);
      }
      if (msgLower.includes('atualizar') || msgLower.includes('editar')) {
        return toastAudit.process.updateError(message);
      }
      if (msgLower.includes('remover') || msgLower.includes('excluir') || msgLower.includes('deletar')) {
        return toastAudit.process.deleteError(message);
      }
    }
    
    return null;
  }

  /**
   * Verificar padrões de agendamento
   */
  _matchesSchedulePattern(msg) {
    const schedulePatterns = [
      'agendamento', 'agendado', 'consulta', 'reunião',
      'horário', 'data', 'conflito', 'já possui'
    ];
    return schedulePatterns.some(pattern => msg.includes(pattern));
  }

  /**
   * Migrar toasts de agendamento
   */
  _migrateScheduleToast(type, message, msgLower) {
    if (msgLower.includes('conflito') || msgLower.includes('já possui')) {
      return toastAudit.schedule.conflictError();
    }
    
    const scheduleTitle = this._extractEntityName(message, 'agendamento');
    
    if (type === 'success') {
      if (msgLower.includes('criado') || msgLower.includes('agendado')) {
        return toastAudit.schedule.createSuccess(scheduleTitle || 'Agendamento');
      }
      if (msgLower.includes('atualizado')) {
        return toastAudit.schedule.updateSuccess(scheduleTitle || 'Agendamento');
      }
    }
    
    if (type === 'error') {
      return toastAudit.schedule.createError(message);
    }
    
    return null;
  }

  /**
   * Verificar padrões de usuário
   */
  _matchesUserPattern(msg) {
    const userPatterns = [
      'usuário', 'user', 'cliente', 'perfil'
    ];
    return userPatterns.some(pattern => msg.includes(pattern));
  }

  /**
   * Migrar toasts de usuário
   */
  _migrateUserToast(type, message, msgLower) {
    const userName = this._extractUserName(message);
    
    if (type === 'success') {
      if (msgLower.includes('criado') || msgLower.includes('cadastrado')) {
        return toastAudit.user.createSuccess(userName || 'Usuário');
      }
      if (msgLower.includes('atualizado') || msgLower.includes('editado')) {
        return toastAudit.user.updateSuccess(userName || 'Usuário');
      }
      if (msgLower.includes('removido') || msgLower.includes('excluído')) {
        return toastAudit.user.deleteSuccess(userName || 'Usuário');
      }
    }
    
    if (type === 'error') {
      return toastAudit.user.createError(message);
    }
    
    return null;
  }

  /**
   * Verificar padrões de arquivo
   */
  _matchesFilePattern(msg) {
    const filePatterns = [
      'arquivo', 'upload', 'download', 'anexo', 'documento'
    ];
    return filePatterns.some(pattern => msg.includes(pattern));
  }

  /**
   * Migrar toasts de arquivo
   */
  _migrateFileToast(type, message, msgLower) {
    const fileName = this._extractFileName(message);
    
    if (type === 'success') {
      if (msgLower.includes('upload') || msgLower.includes('enviado')) {
        return toastAudit.file.uploadSuccess(fileName || 'Arquivo');
      }
      if (msgLower.includes('download') || msgLower.includes('baixado')) {
        return toastAudit.file.downloadSuccess(fileName || 'Arquivo');
      }
      if (msgLower.includes('removido') || msgLower.includes('excluído')) {
        return toastAudit.file.deleteSuccess(fileName || 'Arquivo');
      }
    }
    
    if (type === 'error') {
      return toastAudit.file.uploadError(message);
    }
    
    return null;
  }

  /**
   * Verificar padrões de validação
   */
  _matchesValidationPattern(msg) {
    const validationPatterns = [
      'obrigatório', 'inválido', 'incorreto', 'formato',
      'campo', 'preenchimento', 'validação'
    ];
    return validationPatterns.some(pattern => msg.includes(pattern));
  }

  /**
   * Migrar toasts de validação
   */
  _migrateValidationToast(type, message, msgLower) {
    if (msgLower.includes('obrigatório')) {
      const fieldName = this._extractFieldName(message);
      return toastAudit.validation.requiredField(fieldName || 'Campo');
    }
    
    if (msgLower.includes('email') && msgLower.includes('inválido')) {
      return toastAudit.validation.invalidEmail();
    }
    
    if (msgLower.includes('formato') || msgLower.includes('inválido')) {
      return toastAudit.validation.invalidFormat(message);
    }
    
    return null;
  }

  /**
   * Extrair nome de usuário da mensagem
   */
  _extractUserName(message) {
    // Tentar extrair nome entre aspas ou após "usuário"
    const quotedName = message.match(/"([^"]+)"/);
    if (quotedName) return quotedName[1];
    
    const afterUser = message.match(/usuário\s+([^\s]+)/i);
    if (afterUser) return afterUser[1];
    
    return null;
  }

  /**
   * Extrair nome de entidade da mensagem
   */
  _extractEntityName(message, entityType) {
    const regex = new RegExp(`${entityType}\\s+"?([^"\\s]+)"?`, 'i');
    const match = message.match(regex);
    return match ? match[1] : null;
  }

  /**
   * Extrair nome de arquivo da mensagem
   */
  _extractFileName(message) {
    // Tentar extrair extensão de arquivo comum
    const fileMatch = message.match(/([^\s]+\.(pdf|doc|docx|jpg|png|txt|xlsx?))/i);
    if (fileMatch) return fileMatch[1];
    
    // Tentar extrair nome entre aspas
    const quotedFile = message.match(/"([^"]+)"/);
    if (quotedFile) return quotedFile[1];
    
    return null;
  }

  /**
   * Extrair nome de campo da mensagem
   */
  _extractFieldName(message) {
    // Tentar extrair campo antes de "obrigatório"
    const fieldMatch = message.match(/([^\s]+)\s+(?:é\s+)?obrigatório/i);
    if (fieldMatch) return fieldMatch[1];
    
    // Tentar extrair campo entre aspas
    const quotedField = message.match(/"([^"]+)"/);
    if (quotedField) return quotedField[1];
    
    return null;
  }

  /**
   * Log de migração para debugging
   */
  _logMigration(type, originalMessage, migratedMethod) {
    if (this.logMigrations) {
      console.log(`🔄 Toast Migration: ${type}("${originalMessage}") -> ${migratedMethod.name || 'migrated method'}`);
    }
  }

  /**
   * Gerar relatório de migração
   */
  generateMigrationReport() {
    return {
      timestamp: new Date().toISOString(),
      migrationsPerformed: this._migrationCount || 0,
      commonPatterns: this._getCommonPatterns(),
      recommendations: this._getMigrationRecommendations()
    };
  }

  /**
   * Obter padrões comuns encontrados
   */
  _getCommonPatterns() {
    return [
      'Login/Logout patterns',
      'CRUD operation patterns',
      'Validation error patterns',
      'File operation patterns',
      'Scheduling conflict patterns'
    ];
  }

  /**
   * Obter recomendações de migração
   */
  _getMigrationRecommendations() {
    return [
      'Replace direct toast.success/error calls with categorized methods',
      'Use useFormValidationToast for form validation',
      'Implement useApiWithToast for API operations',
      'Consider useCrudToast for standard CRUD operations',
      'Enable auto-interception for consistent API response handling'
    ];
  }
}

// Instância singleton para migração
export const toastMigration = new ToastMigrationWrapper();

/**
 * Wrapper de compatibilidade que pode substituir import do react-toastify
 */
export const toast = {
  success: (message, options) => toastMigration.success(message, options),
  error: (message, options) => toastMigration.error(message, options),
  warning: (message, options) => toastMigration.warning(message, options),
  info: (message, options) => toastMigration.info(message, options),
  
  // Métodos do sistema audit diretamente disponíveis
  audit: toastAudit,
  
  // Configuração de migração
  setMigrationMode: (enabled) => toastMigration.setMigrationMode(enabled),
  setLogMigrations: (enabled) => toastMigration.setLogMigrations(enabled),
  generateReport: () => toastMigration.generateMigrationReport()
};

export default toast;
