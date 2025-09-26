import { NPJ_CONFIG, ERROR_CODES, ERROR_MESSAGES, getRouteConfig } from '../config/npjConfig';

// Interceptador de requisições simplificado
class RequestInterceptor {
  constructor() {
    this.activeRequests = new Set();
    this.retryCount = new Map();
  }

  // Interceptar requisição antes do envio
  async interceptRequest(url, options = {}) {
    const config = getRouteConfig(url);

    // Aplicar timeout se não especificado
    if (!options.timeout) {
      options.timeout = NPJ_CONFIG.API.TIMEOUT;
    }

    // Priorizar token passado como parâmetro, senão usar localStorage
    const token = options.token || localStorage.getItem('token');
    if (token) {
      options.headers = {
        'Content-Type': 'application/json',
        ...options.headers,
        'Authorization': `Bearer ${token}`
      };
    } else if (options.body && typeof options.body === 'string') {
      // Adicionar Content-Type mesmo sem token para requisições POST/PUT
      options.headers = {
        'Content-Type': 'application/json',
        ...options.headers
      };
    }

    try {
      const response = await this.executeRequest(url, options, config);
      return response;
    } finally {
      this.retryCount.delete(`${options.method || 'GET'}:${url}`);
    }
  }

  // Executar requisição com retry
  async executeRequest(url, options, config, attempt = 1) {
    const maxAttempts = config.retry?.attempts || NPJ_CONFIG.API.RETRY_ATTEMPTS;

    try {
      const response = await this.makeRequest(url, options);
      return response;
    } catch (error) {
      // Determinar se deve fazer retry
      if (attempt < maxAttempts && this.shouldRetry(error)) {
        const delay = config.retry?.delay || NPJ_CONFIG.API.RETRY_DELAY;
        const backoffDelay = delay * Math.pow(2, attempt - 1); // Exponential backoff
        
        await this.sleep(backoffDelay);
        return this.executeRequest(url, options, config, attempt + 1);
      }

      throw this.normalizeError(error);
    }
  }

  // Fazer a requisição HTTP
  async makeRequest(url, options) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout);

    try {
      const response = await fetch(`${NPJ_CONFIG.API.BASE_URL}${url}`, {
        ...options,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Tentar extrair mensagem de erro do corpo da resposta
        let errorMessage = `HTTP ${response.status}`;
        let errorData = null;
        
        try {
          const responseText = await response.text();
          if (responseText) {
            errorData = JSON.parse(responseText);
            errorMessage = errorData.erro || errorData.message || errorData.detalhes || errorMessage;
          }
        } catch (parseError) {
          console.warn('Não foi possível extrair erro do corpo da resposta:', parseError);
        }

        throw {
          status: response.status,
          statusText: response.statusText,
          message: errorMessage,
          data: errorData,
          url
        };
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw { code: ERROR_CODES.TIMEOUT, message: 'Request timeout', url };
      }
      
      throw error;
    }
  }

  // Determinar se deve fazer retry
  shouldRetry(error) {
    // Para erros 401 na página de login, NÃO limpar tokens nem redirecionar
    if (error.status === ERROR_CODES.UNAUTHORIZED) {
      // Se estamos na página de login, não fazer nada (permitir Toast)
      if (window.location.pathname.includes('/login') || 
          window.location.pathname === '/' || 
          window.location.pathname.includes('/auth')) {
        return false; // Não retry, não redirect - deixar form tratar
      }
      // Se não estamos na página de login, então limpar e redirecionar
      this.handleUnauthorized();
      return false;
    }

    // Não retry para erros de autorização
    if (error.status === ERROR_CODES.FORBIDDEN) {
      return false;
    }

    // Retry para erros de rede e timeout
    return [
      ERROR_CODES.NETWORK_ERROR,
      ERROR_CODES.TIMEOUT,
      ERROR_CODES.INTERNAL_SERVER_ERROR,
      ERROR_CODES.BAD_GATEWAY,
      ERROR_CODES.SERVICE_UNAVAILABLE,
      ERROR_CODES.GATEWAY_TIMEOUT
    ].includes(error.status);
  }

  // Normalizar erro
  normalizeError(error) {
    if (error.code) return error;

    // Mapear códigos de status HTTP para códigos de erro internos
    const statusToCode = {
      400: ERROR_CODES.BAD_REQUEST,
      401: ERROR_CODES.UNAUTHORIZED,
      403: ERROR_CODES.FORBIDDEN,
      404: ERROR_CODES.NOT_FOUND,
      422: ERROR_CODES.VALIDATION_ERROR,
      500: ERROR_CODES.INTERNAL_SERVER_ERROR,
      502: ERROR_CODES.BAD_GATEWAY,
      503: ERROR_CODES.SERVICE_UNAVAILABLE,
      504: ERROR_CODES.GATEWAY_TIMEOUT
    };

    const code = statusToCode[error.status] || ERROR_CODES.NETWORK_ERROR;
    
    return {
      code,
      message: error.message || ERROR_MESSAGES[code] || 'Erro desconhecido',
      status: error.status,
      data: error.data,
      url: error.url,
      originalError: error
    };
  }

  // Lidar com erro 401 - MELHORADO
  handleUnauthorized() {
    console.log('🚨 Erro 401 detectado pelo interceptador');
    
    // Emitir evento personalizado para o AuthContext capturar
    window.dispatchEvent(new CustomEvent('auth:unauthorized', {
      detail: { 
        message: 'Token inválido ou expirado',
        timestamp: new Date().toISOString()
      }
    }));
    
    // Limpar tokens do localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    // Se não está na página de login, redirecionar
    if (!window.location.pathname.includes('/login') && 
        !window.location.pathname.includes('/') &&
        !window.location.pathname.includes('/auth')) {
      console.log('🔄 Redirecionando para login...');
      window.location.href = '/login';
    }
  }

  // Sleep utility
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Limpar estado
  clear() {
    this.activeRequests.clear();
    this.retryCount.clear();
  }
}

// Instância global
export const requestInterceptor = new RequestInterceptor();

// Função wrapper para usar com apiRequest
export async function interceptedRequest(url, options = {}) {
  // Executar requisição com interceptação
  const response = await requestInterceptor.interceptRequest(url, options);

  // Se a resposta for nula, retornar um erro mais simples
  if (!response) {
    throw new Error('Erro na requisição');
  }
  
  // Se já é um objeto (dados do cache), retornar diretamente
  if (typeof response === 'object' && !response.json) {
    return response;
  }
  
  // Se é uma response do fetch, fazer parse JSON
  if (typeof response.json === 'function') {
    const data = await response.json();
    return data;
  }
  
  // Fallback para outros tipos de resposta
  return response;
}

export default requestInterceptor;
