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

    // Adicionar token de autorização se disponível
    const token = localStorage.getItem('token');
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
        // log removido
      }
      
      return response;
    } catch (error) {
      if (NPJ_CONFIG.DEV.ENABLE_LOGS) {
        // log removido
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
    // Para erros 401, limpar tokens e redirecionar para login
    if (error.status === ERROR_CODES.UNAUTHORIZED) {
      this.handleUnauthorized();
      return false;
    }

    // Não retry para erros de autorização
    if (error.status === ERROR_CODES.FORBIDDEN) {
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

  // Lidar com erro de autenticação
  handleUnauthorized() {
    // Limpar tokens expirados
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    // Redirecionar para login se não estiver já na página de login
    if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
      window.location.href = '/login';
    }
  }

  // Normalizar erros
  normalizeError(error) {
    let normalizedError = {
      code: error.status || error.code || ERROR_CODES.SERVER_ERROR,
      message: error.message || ERROR_MESSAGES[error.status || error.code] || 'Erro desconhecido',
      url: error.url,
      originalError: error
    };

    // Usar mensagem específica se disponível
    if (error.data && (error.data.erro || error.data.message || error.data.detalhes)) {
      normalizedError.message = error.data.erro || error.data.message || error.data.detalhes;
    }

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
        // log removido
      }
      return cached;
    }
  }

  // Executar requisição com interceptação
  const response = await requestInterceptor.interceptRequest(url, options);

  // Se a resposta for nula ou indefinida (ex: requisição throttled),
  // pode ser que outra requisição já esteja buscando o recurso.
  // Neste caso, tentamos obter do cache após um breve período.
  if (!response) {
    await new Promise(resolve => setTimeout(resolve, 100)); // Aguarda um pouco
    const cached = requestCache.get(cacheKey);
    if (cached) {
      if (NPJ_CONFIG.DEV.ENABLE_LOGS) {
        // log removido
      }
      return cached;
    }
    // Se ainda não houver nada, lançar um erro mais claro.
    throw new Error('A requisição foi interrompida pelo throttle/debounce e não houve resposta.');
  }
  
  // Se já é um objeto (dados do cache), retornar diretamente
  if (typeof response === 'object' && !response.json) {
    return response;
  }
  
  // Se é uma response do fetch, fazer parse JSON
  if (typeof response.json === 'function') {
    const data = await response.json();
    
    // Cachear resposta para requisições GET bem-sucedidas
    if ((!options.method || options.method === 'GET')) {
      requestCache.set(cacheKey, data);
    }
    
    return data;
  }
  
  // Fallback para outros tipos de resposta
  return response;
}

export default requestInterceptor;
