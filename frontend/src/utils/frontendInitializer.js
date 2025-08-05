/**
 * Script de inicialização do frontend NPJ
 * Testa conectividade com backend e verifica configurações
 */

import { NPJ_CONFIG } from '../config/npjConfig';

class FrontendInitializer {
  constructor() {
    this.backendStatus = null;
    this.initTime = Date.now();
  }

  // Inicialização completa
  async initialize() {
    // console.log removido
    // 1. Verificar configurações
    this.checkConfig();
    // 2. Testar conectividade com backend
    await this.testBackendConnection();
    // 3. Verificar localStorage
    this.checkLocalStorage();
    // 4. Status final
    this.printStatus();
    return this.backendStatus;
  }

  // Verificar configurações
  checkConfig() {
    const config = {
      'API Base URL': NPJ_CONFIG.API.BASE_URL,
      'API Timeout': `${NPJ_CONFIG.API.TIMEOUT}ms`,
      'Cache TTL': `${NPJ_CONFIG.CACHE.DEFAULT_TTL}ms`,
      'Environment': import.meta.env.NODE_ENV || 'development',
      'Dev Mode': import.meta.env.DEV ? 'Ativo' : 'Inativo'
    };
    
    Object.entries(config).forEach(([key, value]) => {
      // logs removidos
    });
  }

  // Testar conectividade com backend
  async testBackendConnection() {
    try {
      const response = await fetch(`${NPJ_CONFIG.API.BASE_URL}/test`, {
        method: 'GET',
        timeout: 5000
      });
      
      if (response.ok) {
        const data = await response.json();
        this.backendStatus = {
          connected: true,
          message: data.message || 'Backend conectado',
          timestamp: data.timestamp,
          dbAvailable: data.dbAvailable
        };
        
        // logs removidos
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      this.backendStatus = {
        connected: false,
        message: error.message,
        dbAvailable: false
      };
      
      // logs removidos
    }
  }

  // Verificar localStorage
  checkLocalStorage() {
    const items = {
      'Token': localStorage.getItem('token') ? '✅ Presente' : '❌ Ausente',
      'User': localStorage.getItem('user') ? '✅ Presente' : '❌ Ausente',
      'Refresh Token': localStorage.getItem('refreshToken') ? '✅ Presente' : '❌ Ausente'
    };
    
    Object.entries(items).forEach(([key, status]) => {
      // logs removidos
    });
    
    const hasValidSession = localStorage.getItem('token') && localStorage.getItem('user');
    if (hasValidSession) {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        // logs removidos
      } catch (error) {
        // logs removidos
      }
    } else {
      // logs removidos
    }
  }

  // Status final
  printStatus() {
    const initDuration = Date.now() - this.initTime;
    
    // logs removidos

    if (this.backendStatus?.connected && this.backendStatus?.dbAvailable) {
      // logs removidos
    } else if (this.backendStatus?.connected) {
      // logs removidos
    } else {
      // logs removidos
    }
  }

  // Método estático para inicialização rápida
  static async quickInit() {
    const initializer = new FrontendInitializer();
    return await initializer.initialize();
  }
}

// Auto-executar em desenvolvimento
if (import.meta.env.DEV) {
  // Aguardar um pouco para o DOM carregar
  setTimeout(() => {
    FrontendInitializer.quickInit();
  }, 1000);
  
  // Disponibilizar globalmente
  window.initFrontend = () => FrontendInitializer.quickInit();
}

export default FrontendInitializer;
