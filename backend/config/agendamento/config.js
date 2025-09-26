/**
 * Configurações específicas do sistema de agendamentos
 */

const CRON_SCHEDULES = {
  // Lembretes diários às 8h da manhã
  LEMBRETES_DIARIOS: '0 8 * * *',
  
  // Lembretes 1 hora antes - executa a cada hora
  LEMBRETES_1H_ANTES: '0 * * * *',
  
  // Verificação de status automática - a cada 30 minutos
  VERIFICACAO_STATUS: '*/30 * * * *',
  
  // Limpeza de logs antigos - todo domingo às 2h
  LIMPEZA_LOGS: '0 2 * * 0'
};

const EMAIL_CONFIG = {
  // Configurações de retry para emails
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 5000,
  
  // Rate limiting
  MAX_EMAILS_PER_MINUTE: 30,
  
  // Templates
  TEMPLATE_DIR: 'templates/email',
  DEFAULT_FROM_NAME: 'Sistema NPJ - Agendamentos'
};

const CACHE_CONFIG = {
  // TTL para diferentes tipos de cache (em segundos)
  AGENDAMENTOS_LIST_TTL: 300, // 5 minutos
  USUARIO_PERMISSIONS_TTL: 600, // 10 minutos
  PROCESSO_INFO_TTL: 1800, // 30 minutos
  
  // Prefixos para keys do cache
  CACHE_PREFIXES: {
    AGENDAMENTO: 'agendamento:',
    USUARIO: 'usuario:',
    PROCESSO: 'processo:',
    STATS: 'stats:'
  }
};

const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 12,
  MAX_PAGE_SIZE: 100,
  MIN_PAGE_SIZE: 1
};

const VALIDATION_CONFIG = {
  // Configurações de validação customizáveis
  TITULO_MIN_LENGTH: 3,
  TITULO_MAX_LENGTH: 255,
  DESCRICAO_MAX_LENGTH: 1000,
  LOCAL_MAX_LENGTH: 500,
  OBSERVACOES_MAX_LENGTH: 1000,
  MOTIVO_RECUSA_MIN_LENGTH: 10,
  MOTIVO_RECUSA_MAX_LENGTH: 500,
  NOME_CONVIDADO_MAX_LENGTH: 100
};

const LOG_CONFIG = {
  // Configurações de logging
  LEVELS: {
    ERROR: 'error',
    WARN: 'warn', 
    INFO: 'info',
    DEBUG: 'debug'
  },
  
  // Arquivos de log
  FILES: {
    ERROR: 'logs/agendamento-errors.log',
    COMBINED: 'logs/agendamento-combined.log',
    AUDIT: 'logs/agendamento-audit.log'
  }
};

module.exports = {
  CRON_SCHEDULES,
  EMAIL_CONFIG,
  CACHE_CONFIG,
  PAGINATION_CONFIG,
  VALIDATION_CONFIG,
  LOG_CONFIG
};