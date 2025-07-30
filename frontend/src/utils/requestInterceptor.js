import { NPJ_CONFIG, ERROR_CODES, ERROR_MESSAGES, getRouteConfig } from '../config/npjConfig';
import { requestCache } from '../utils/requestCache';

// Interceptador de requisições otimizado
class RequestInterceptor {
  constructor() {
    this.requestQueue = new Map();
    this.activeRequests = new Set();
    this.retryCount = new Map();
  }

  // Interceptar requisição antes do envio
  async interceptRequest(url, options = {}) {
    const config = getRouteConfig(url);
    const requestId = `${options.method || 'GET'}:${url}:${JSON.stringify(options.body || {})}`;

    // Evitar requisições duplicadas simultâneas
    if (this.activeRequests.has(requestId)) {
      return await this.waitForActiveRequest(requestId);
    }

    // Aplicar timeout se não especificado
    if (!options.timeout) {
      options.timeout = NPJ_CONFIG.API.TIMEOUT;
    }

    // Marcar como ativa
    this.activeRequests.add(requestId);

    try {
      const response = await this.executeRequest(url, options, config);
      return response;
    } finally {
      this.activeRequests.delete(requestId);
      this.retryCount.delete(requestId);
    }
  }

  // Executar requisição com retry
  async executeRequest(url, options, config, attempt = 1) {
    const requestId = `${options.method || 'GET'}:${url}`;
    const maxAttempts = config.retry?.attempts || NPJ_CONFIG.API.RETRY_ATTEMPTS;

    try {
      const response = await this.makeRequest(url, options);
      
      if (NPJ_CONFIG.DEV.ENABLE_LOGS) {
        console.log(`✅ Request success: ${url} (attempt ${attempt})`);
      }
      
      return response;
    } catch (error) {
      if (NPJ_CONFIG.DEV.ENABLE_LOGS) {
        console.warn(`⚠️ Request failed: ${url} (attempt ${attempt}/${maxAttempts})`, error);
      }

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
        throw {
          status: response.status,
          statusText: response.statusText,
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
    // Não retry para erros de autenticação/autorização
    if (error.status === ERROR_CODES.UNAUTHORIZED || 
        error.status === ERROR_CODES.FORBIDDEN) {
      return false;
    }

    // Não retry para erros de validação
    if (error.status === ERROR_CODES.VALIDATION_ERROR) {
      return false;
    }

    // Retry para erros de servidor e rede
    return error.status >= 500 || 
           error.code === ERROR_CODES.NETWORK_ERROR ||
           error.code === ERROR_CODES.TIMEOUT;
  }

  // Normalizar erros
  normalizeError(error) {
    let normalizedError = {
      code: error.status || error.code || ERROR_CODES.SERVER_ERROR,
      message: ERROR_MESSAGES[error.status || error.code] || error.message || 'Erro desconhecido',
      url: error.url,
      originalError: error
    };

    // Casos especiais
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      normalizedError.code = ERROR_CODES.NETWORK_ERROR;
      normalizedError.message = ERROR_MESSAGES[ERROR_CODES.NETWORK_ERROR];
    }

    return normalizedError;
  }

  // Aguardar requisição ativa
  async waitForActiveRequest(requestId) {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (!this.activeRequests.has(requestId)) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
    });
  }

  // Sleep utility
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Limpar estado
  clear() {
    this.requestQueue.clear();
    this.activeRequests.clear();
    this.retryCount.clear();
  }
}

// Instância global
export const requestInterceptor = new RequestInterceptor();

// Função wrapper para usar com apiRequest
export async function interceptedRequest(url, options = {}) {
  const cacheKey = requestCache.generateKey(url, options);
  
  // Tentar cache primeiro para requisições GET
  if ((!options.method || options.method === 'GET')) {
    const cached = requestCache.get(cacheKey);
    if (cached) {
      if (NPJ_CONFIG.DEV.ENABLE_LOGS) {
        console.log(`💾 Cache hit: ${url}`);
      }
      return cached;
    }
  }

  // Executar requisição com interceptação
  const response = await requestInterceptor.interceptRequest(url, options);
  
  // Verificar se a resposta é válida
  if (!response) {
    throw new Error('Resposta inválida do servidor');
  }
  
  const data = await response.json();

  // Cachear resposta para requisições GET bem-sucedidas
  if ((!options.method || options.method === 'GET')) {
    requestCache.set(cacheKey, data);
  }

  return data;
}

export default requestInterceptor;
