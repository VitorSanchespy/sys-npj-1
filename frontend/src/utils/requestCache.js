// Sistema de cache inteligente para requisições do NPJ
class RequestCache {
  constructor() {
    this.cache = new Map();
    this.timestamps = new Map();
    this.pendingRequests = new Map();
    
    // Configurações de cache por tipo de dados
    this.cacheConfig = {
      '/api/usuarios/me': { ttl: 5 * 60 * 1000, priority: 'high' }, // 5 min - perfil
      '/api/processos': { ttl: 2 * 60 * 1000, priority: 'medium' }, // 2 min - processos
      '/api/usuarios': { ttl: 3 * 60 * 1000, priority: 'medium' }, // 3 min - usuários
      '/api/aux/': { ttl: 30 * 60 * 1000, priority: 'low' }, // 30 min - tabelas auxiliares
      '/api/agendamentos': { ttl: 1 * 60 * 1000, priority: 'high' }, // 1 min - agendamentos
      '/api/atualizacoes': { ttl: 30 * 1000, priority: 'high' } // 30 seg - atualizações
    };
    
    // Limpeza automática do cache a cada minuto
    setInterval(() => this.cleanupCache(), 60 * 1000);
  }

  // Gerar chave única para cache
  generateKey(url, options = {}) {
    const { method = 'GET', body, token } = options;
    const baseKey = `${method}:${url}`;
    
    if (body) {
      return `${baseKey}:${JSON.stringify(body)}`;
    }
    
    return baseKey;
  }

  // Obter TTL baseado na URL
  getTTL(url) {
    for (const [pattern, config] of Object.entries(this.cacheConfig)) {
      if (url.includes(pattern)) {
        return config.ttl;
      }
    }
    return 2 * 60 * 1000; // 2 minutos padrão
  }

  // Verificar se item está válido no cache
  isValid(key) {
    if (!this.cache.has(key)) return false;
    
    const timestamp = this.timestamps.get(key);
    const ttl = this.getTTL(key);
    
    return Date.now() - timestamp < ttl;
  }

  // Obter do cache se válido
  get(key) {
    if (this.isValid(key)) {
      return this.cache.get(key);
    }
    return null;
  }

  // Armazenar no cache
  set(key, data) {
    this.cache.set(key, data);
    this.timestamps.set(key, Date.now());
    
    // Limitar tamanho do cache
    if (this.cache.size > 200) {
      this.cleanupCache();
    }
  }

  // Invalidar cache específico
  invalidate(pattern) {
    const keysToDelete = [];
    
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => {
      this.cache.delete(key);
      this.timestamps.delete(key);
    });
  }

  // Limpeza automática
  cleanupCache() {
    const now = Date.now();
    const keysToDelete = [];
    
    for (const [key, timestamp] of this.timestamps.entries()) {
      const ttl = this.getTTL(key);
      if (now - timestamp > ttl) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => {
      this.cache.delete(key);
      this.timestamps.delete(key);
    });
    
    // Limpeza silenciosa do cache
  }

  // Evitar requisições duplicadas simultâneas
  async getOrFetch(key, fetchFunction) {
    // Verificar cache primeiro
    const cachedData = this.get(key);
    if (cachedData) {
      return cachedData;
    }

    // Verificar se já existe uma requisição pendente
    if (this.pendingRequests.has(key)) {
      return await this.pendingRequests.get(key);
    }

    // Criar nova requisição
    const request = fetchFunction().finally(() => {
      this.pendingRequests.delete(key);
    });
    
    this.pendingRequests.set(key, request);
    
    try {
      const data = await request;
      this.set(key, data);
      return data;
    } catch (error) {
      // Não cachear erros
      throw error;
    }
  }

  // Limpar todo o cache (silencioso)
  clear() {
    this.cache.clear();
    this.timestamps.clear();
    this.pendingRequests.clear();
  }

  // Estatísticas do cache (para desenvolvimento)
  getStats() {
    return {
      size: this.cache.size,
      pending: this.pendingRequests.size,
      keys: Array.from(this.cache.keys()).slice(0, 10), // primeiras 10 chaves
      oldestEntry: Math.min(...Array.from(this.timestamps.values())),
      newestEntry: Math.max(...Array.from(this.timestamps.values()))
    };
  }
}

// Instância global do cache
export const requestCache = new RequestCache();

// Hook para desenvolvimento - estatísticas do cache
if (process.env.NODE_ENV === 'development') {
  window.cacheStats = () => console.table(requestCache.getStats());
  window.clearCache = () => requestCache.clear();
}
