// Configurações de otimização para o sistema NPJ
export const NPJ_CONFIG = {
  // URLs da API
  API: {
    BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
    TIMEOUT: 10000, // 10 segundos
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000 // 1 segundo
  },

  // Configurações de cache
  CACHE: {
    DEFAULT_TTL: 2 * 60 * 1000, // 2 minutos
    MAX_SIZE: 200,
    CLEANUP_INTERVAL: 60 * 1000, // 1 minuto
    PRIORITIES: {
      high: 30 * 1000,    // 30 segundos - dados críticos
      medium: 2 * 60 * 1000, // 2 minutos - dados normais
      low: 30 * 60 * 1000   // 30 minutos - dados estáticos
    }
  },

  // Configurações de autenticação
  AUTH: {
    TOKEN_REFRESH_BEFORE: 2 * 60 * 1000, // 2 minutos antes do vencimento
    AUTO_LOGOUT_AFTER: 30 * 60 * 1000,   // 30 minutos de inatividade
    CHECK_INTERVAL: 60 * 1000             // Verificar a cada minuto
  },

  // Configurações de UI
  UI: {
  DEBOUNCE_DELAY: 800,     // 800ms para busca (menos sensível)
    LOADING_MIN_TIME: 500,   // Mostrar loading por pelo menos 500ms
    TOAST_DURATION: 4000,    // 4 segundos para toasts
    PAGINATION_SIZE: 20      // 20 items por página
  },

  // Configurações de desenvolvimento
  DEV: {
    ENABLE_LOGS: process.env.NODE_ENV === 'development',
    PERFORMANCE_MONITOR: process.env.NODE_ENV === 'development',
    CACHE_STATS: process.env.NODE_ENV === 'development'
  }
};

// Códigos de erro padronizados
export const ERROR_CODES = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATION_ERROR: 422,
  SERVER_ERROR: 500,
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT'
};

// Mensagens de erro padronizadas
export const ERROR_MESSAGES = {
  [ERROR_CODES.BAD_REQUEST]: 'Dados inválidos na requisição.',
  [ERROR_CODES.UNAUTHORIZED]: 'Sessão expirada. Faça login novamente.',
  [ERROR_CODES.FORBIDDEN]: 'Você não tem permissão para esta ação.',
  [ERROR_CODES.NOT_FOUND]: 'Recurso não encontrado.',
  [ERROR_CODES.VALIDATION_ERROR]: 'Dados inválidos. Verifique os campos.',
  [ERROR_CODES.SERVER_ERROR]: 'Erro interno do servidor. Tente novamente.',
  [ERROR_CODES.NETWORK_ERROR]: 'Erro de conexão. Verifique sua internet.',
  [ERROR_CODES.TIMEOUT]: 'Tempo limite excedido. Tente novamente.'
};

// Configurações específicas por rota para otimização
export const ROUTE_CONFIG = {
  '/api/usuarios/me': {
    cache: { ttl: 5 * 60 * 1000, priority: 'high' },
    retry: { attempts: 2, delay: 500 }
  },
  '/api/processos': {
    cache: { ttl: 2 * 60 * 1000, priority: 'medium' },
    retry: { attempts: 3, delay: 1000 }
  },
  '/api/agendamentos': {
    cache: { ttl: 1 * 60 * 1000, priority: 'high' },
    retry: { attempts: 2, delay: 500 }
  },
  '/api/aux': {
    cache: { ttl: 30 * 60 * 1000, priority: 'low' },
    retry: { attempts: 1, delay: 2000 }
  }
};

// Helper para obter configuração de uma rota
export function getRouteConfig(url) {
  // Verificar se url é uma string válida
  if (typeof url !== 'string') {
    console.warn('⚠️ getRouteConfig: URL inválida:', url);
    return {
      cache: { ttl: NPJ_CONFIG.CACHE.DEFAULT_TTL, priority: 'medium' },
      retry: { attempts: NPJ_CONFIG.API.RETRY_ATTEMPTS, delay: NPJ_CONFIG.API.RETRY_DELAY }
    };
  }
  
  for (const [pattern, config] of Object.entries(ROUTE_CONFIG)) {
    if (url.includes(pattern)) {
      return config;
    }
  }
  return {
    cache: { ttl: NPJ_CONFIG.CACHE.DEFAULT_TTL, priority: 'medium' },
    retry: { attempts: NPJ_CONFIG.API.RETRY_ATTEMPTS, delay: NPJ_CONFIG.API.RETRY_DELAY }
  };
}

// Estados de loading padronizados
export const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
};

// Tipos de notificação
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

export default NPJ_CONFIG;
