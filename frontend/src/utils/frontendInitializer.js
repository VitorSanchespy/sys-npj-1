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
    console.log('🚀 Inicializando Sistema NPJ Frontend...\n');
    
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
    console.log('⚙️ Verificando configurações...');
    
    const config = {
      'API Base URL': NPJ_CONFIG.API.BASE_URL,
      'API Timeout': `${NPJ_CONFIG.API.TIMEOUT}ms`,
      'Cache TTL': `${NPJ_CONFIG.CACHE.DEFAULT_TTL}ms`,
      'Environment': import.meta.env.NODE_ENV || 'development',
      'Dev Mode': import.meta.env.DEV ? 'Ativo' : 'Inativo'
    };
    
    Object.entries(config).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`);
    });
    
    console.log('✅ Configurações OK\n');
  }

  // Testar conectividade com backend
  async testBackendConnection() {
    console.log('🔌 Testando conectividade com backend...');
    
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
        
        console.log('✅ Backend conectado');
        console.log(`  Mensagem: ${this.backendStatus.message}`);
        console.log(`  DB Disponível: ${this.backendStatus.dbAvailable ? 'Sim' : 'Não'}`);
        
        if (this.backendStatus.dbAvailable) {
          console.log('✅ Banco de dados conectado');
        } else {
          console.log('⚠️ Backend em modo mock (sem banco)');
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      this.backendStatus = {
        connected: false,
        message: error.message,
        dbAvailable: false
      };
      
      console.log('❌ Erro ao conectar com backend');
      console.log(`  Erro: ${error.message}`);
      console.log('  Verifique se o backend está rodando em http://localhost:3001');
    }
    
    console.log('');
  }

  // Verificar localStorage
  checkLocalStorage() {
    console.log('💾 Verificando localStorage...');
    
    const items = {
      'Token': localStorage.getItem('token') ? '✅ Presente' : '❌ Ausente',
      'User': localStorage.getItem('user') ? '✅ Presente' : '❌ Ausente',
      'Refresh Token': localStorage.getItem('refreshToken') ? '✅ Presente' : '❌ Ausente'
    };
    
    Object.entries(items).forEach(([key, status]) => {
      console.log(`  ${key}: ${status}`);
    });
    
    const hasValidSession = localStorage.getItem('token') && localStorage.getItem('user');
    if (hasValidSession) {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        console.log(`  Usuário logado: ${user.nome || user.email || 'Desconhecido'}`);
        console.log('✅ Sessão válida encontrada');
      } catch (error) {
        console.log('⚠️ Dados de usuário corrompidos no localStorage');
      }
    } else {
      console.log('ℹ️ Nenhuma sessão ativa');
    }
    
    console.log('');
  }

  // Status final
  printStatus() {
    const initDuration = Date.now() - this.initTime;
    
    console.log('📊 STATUS FINAL DA INICIALIZAÇÃO');
    console.log('================================');
    console.log(`⏱️ Tempo de inicialização: ${initDuration}ms`);
    console.log(`🔌 Backend: ${this.backendStatus?.connected ? '✅ Conectado' : '❌ Desconectado'}`);
    console.log(`💾 Banco de dados: ${this.backendStatus?.dbAvailable ? '✅ Disponível' : '❌ Indisponível'}`);
    
    if (this.backendStatus?.connected && this.backendStatus?.dbAvailable) {
      console.log('🎉 Sistema completamente funcional!');
    } else if (this.backendStatus?.connected) {
      console.log('⚠️ Sistema em modo limitado (sem banco de dados)');
    } else {
      console.log('🚨 Sistema offline - verificar backend');
    }
    
    console.log('\n🧪 Para testar endpoints, execute: window.testAPI()');
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
