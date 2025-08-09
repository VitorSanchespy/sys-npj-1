import { interceptedRequest } from '../utils/requestInterceptor';
import { NPJ_CONFIG } from '../config/npjConfig';

const API_BASE_URL = NPJ_CONFIG.API.BASE_URL;

// Cache para requisições frequentes
const requestCache = new Map();
const CACHE_DURATION = NPJ_CONFIG.CACHE.DEFAULT_TTL;

// Função utilitária para logs detalhados
const logRequest = (url, options, response = null, error = null) => {
  if (NPJ_CONFIG.DEV.ENABLE_LOGS) {
    if (error) {
      console.log('❌ API Error Details:', error);
      console.log('❌ API Request Failed:', { url, error: error.message || error });
    } else if (response) {
      console.log('✅ API Success:', { url, status: response.status });
    }
  }
};

// Função principal de requisição otimizada com interceptador
export async function apiRequest(url, options = {}) {
  const { token, method = 'GET', body, headers = {}, ...fetchOptions } = options;

  // Log de debug para PUT requests
  if (method === 'PUT' && url.includes('/processos/')) {
    console.log('🔍 DEBUG apiRequest.js: URL:', url);
    console.log('🔍 DEBUG apiRequest.js: Method:', method);
    console.log('🔍 DEBUG apiRequest.js: Body:', body);
    console.log('🔍 DEBUG apiRequest.js: Token:', token);
  }

  // Headers padrão otimizados
  const requestHeaders = {
    'Content-Type': 'application/json',
    ...headers
  };

  // Adicionar token se fornecido
  if (token) {
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  // Configuração da requisição
  const requestOptions = {
    method,
    headers: requestHeaders,
    body: body && method !== 'GET' ? JSON.stringify(body) : undefined,
    ...fetchOptions
  };

  try {
    // Usar o interceptador para todas as requisições
    const data = await interceptedRequest(url, requestOptions);
    return data;
  } catch (error) {
    logRequest(url, options, null, error);
    throw error;
  }
}

// Função para upload de arquivos otimizada
export async function uploadFile(url, file, options = {}) {
  const { token, onProgress, ...fetchOptions } = options;

  const formData = new FormData();
  formData.append('file', file);

  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const requestOptions = {
    method: 'POST',
    headers,
    body: formData,
    ...fetchOptions
  };

  try {
    // Usar o interceptador também para uploads
    const data = await interceptedRequest(url, requestOptions);
    return data;
  } catch (error) {
    logRequest(url, options, null, error);
    throw error;
  }
}

// Função para limpar cache manualmente
export function clearApiCache() {
  requestCache.clear();
  if (window.clearCache) {
    window.clearCache();
  }
}

// Função para requisições em lote otimizadas
export async function batchRequest(requests) {
  const promises = requests.map(({ url, options }) => 
    apiRequest(url, options).catch(error => ({ error, url }))
  );
  
  return await Promise.all(promises);
}

// Helpers específicos para o sistema NPJ
export const api = {
  get: (url, token) => apiRequest(url, { method: 'GET', token }),
  post: (url, body, token) => apiRequest(url, { method: 'POST', body, token }),
  put: (url, body, token) => apiRequest(url, { method: 'PUT', body, token }),
  delete: (url, token) => apiRequest(url, { method: 'DELETE', token }),
  patch: (url, body, token) => apiRequest(url, { method: 'PATCH', body, token })
};

export default apiRequest;
