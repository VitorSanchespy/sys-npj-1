// Constantes do sistema NPJ - centraliza todas as configurações
const SYSTEM_CONFIG = {
  // Configurações do servidor
  SERVER: {
    DEFAULT_PORT: 3001,
    VERSION: '1.0.0',
    NAME: 'Sistema NPJ'
  },

  // Configurações de banco de dados
  DATABASE: {
    DEFAULT_HOST: 'localhost',
    DEFAULT_PORT: 3306,
    DEFAULT_USER: 'root',
    DIALECT: 'mysql'
  },

  // Configurações de JWT
  JWT: {
    DEFAULT_EXPIRES_IN: '24h',
    REFRESH_EXPIRES_IN: '7d'
  },

  // Configurações de upload
  UPLOAD: {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'],
    UPLOAD_PATH: 'uploads/'
  },

  // Configurações de notificações
  NOTIFICATIONS: {
    POLL_INTERVAL: 30000, // 30 segundos
    MAX_NOTIFICATIONS: 50
  },

  // Status de processos
  PROCESS_STATUS: {
    EM_ANDAMENTO: 'Em andamento',
    CONCLUIDO: 'Concluído',
    SUSPENSO: 'Suspenso',
    ARQUIVADO: 'Arquivado'
  },

  // Tipos de eventos
  EVENT_TYPES: {
    AUDIENCIA: 'audiencia',
    PRAZO: 'prazo',
    REUNIAO: 'reuniao',
    DILIGENCIA: 'diligencia',
    OUTRO: 'outro'
  },

  // Tipos de notificação
  NOTIFICATION_TYPES: {
    LEMBRETE: 'lembrete',
    ALERTA: 'alerta',
    INFORMACAO: 'informacao',
    SISTEMA: 'sistema'
  },

  // Status de notificação
  NOTIFICATION_STATUS: {
    PENDENTE: 'pendente',
    ENVIADO: 'enviado',
    LIDO: 'lido',
    ERRO: 'erro'
  },

  // Roles do sistema
  USER_ROLES: {
    ADMIN: { id: 1, nome: 'Admin' },
    PROFESSOR: { id: 2, nome: 'Professor' },
    ALUNO: { id: 3, nome: 'Aluno' }
  },

  // Mensagens de erro comuns
  ERROR_MESSAGES: {
    UNAUTHORIZED: 'Usuário não autorizado',
    FORBIDDEN: 'Acesso negado',
    NOT_FOUND: 'Recurso não encontrado',
    VALIDATION_ERROR: 'Erro de validação',
    DUPLICATE_ENTRY: 'Dados duplicados',
    SERVER_ERROR: 'Erro interno do servidor',
    DATABASE_ERROR: 'Erro de banco de dados'
  },

  // Mensagens de sucesso
  SUCCESS_MESSAGES: {
    CREATED: 'Criado com sucesso',
    UPDATED: 'Atualizado com sucesso',
    DELETED: 'Removido com sucesso',
    LOGGED_IN: 'Login realizado com sucesso',
    LOGGED_OUT: 'Logout realizado com sucesso'
  }
};

module.exports = SYSTEM_CONFIG;
