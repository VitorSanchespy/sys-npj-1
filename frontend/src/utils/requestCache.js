// Cache global para requisições API
class RequestCache {
  constructor() {
    this.cache = new Map();
    this.pendingRequests = new Map();
  }

  // Gera uma chave única para a requisição
  generateKey(url, method = 'GET', body = null) {
    const bodyStr = body ? JSON.stringify(body) : '';
    return `${method}:${url}:${bodyStr}`;
  }

  // Verifica se existe cache válido (5 minutos)
  has(key) {
    const cached = this.cache.get(key);
    if (!cached) return false;
    
    const now = Date.now();
    const isExpired = now - cached.timestamp > 5 * 60 * 1000; // 5 minutos
    
    if (isExpired) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  // Obtém dados do cache
  get(key) {
    const cached = this.cache.get(key);
    return cached ? cached.data : null;
  }

  // Armazena dados no cache
  set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // Controla requisições pendentes para evitar duplicatas
  async getOrFetch(key, fetchFn) {
    // Se existe no cache, retorna imediatamente
    if (this.has(key)) {
      return this.get(key);
    }

    // Se já existe uma requisição pendente, aguarda ela
    if (this.pendingRequests.has(key)) {
      return await this.pendingRequests.get(key);
    }

    // Cria nova requisição e armazena como pendente
    const promise = fetchFn().then(data => {
      this.set(key, data);
      this.pendingRequests.delete(key);
      return data;
    }).catch(error => {
      this.pendingRequests.delete(key);
      throw error;
    });

    this.pendingRequests.set(key, promise);
    return await promise;
  }

  // Limpa cache específico ou todo cache
  clear(key = null) {
    if (key) {
      this.cache.delete(key);
      this.pendingRequests.delete(key);
    } else {
      this.cache.clear();
      this.pendingRequests.clear();
    }
  }
}

// Instância global
export const requestCache = new RequestCache();
