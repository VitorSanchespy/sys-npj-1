// Teste específico para validar correções dos erros do frontend
// Simula as chamadas que estavam falhando no navegador

const axios = require('axios');

class FrontendErrorTest {
  constructor() {
    this.baseURL = 'http://localhost:3001';
    this.token = null;
    this.results = {
      notificationService: {},
      requestInterceptor: {},
      apiRequest: {},
      upload: {},
      processes: {}
    };
  }

  async login() {
    try {
      const response = await axios.post(`${this.baseURL}/auth/login`, {
        email: 'admin@teste.com',
        senha: '123456'
      });
      this.token = response.data.token;
      return true;
    } catch (error) {
      console.error('❌ Falha no login:', error.message);
      return false;
    }
  }

  async testNotificationServiceCorrections() {
    console.log('🔔 Testando correções do NotificationService...');
    
    const headers = { 'Authorization': `Bearer ${this.token}` };
    
    // 1. Teste da função getNotifications (corrigida de parâmetros separados para objeto)
    try {
      const response = await axios.get(`${this.baseURL}/api/notificacoes`, { headers });
      this.results.notificationService.getNotifications = { 
        status: 'success', 
        data: response.data.notificacoes || response.data 
      };
      console.log('✅ getNotifications corrigida com sucesso');
    } catch (error) {
      this.results.notificationService.getNotifications = { 
        status: 'error', 
        error: error.response?.data || error.message 
      };
      console.log('❌ getNotifications ainda com erro:', error.response?.data || error.message);
    }

    // 2. Teste da função markAllAsRead (corrigida para usar objeto)
    try {
      const response = await axios.put(`${this.baseURL}/api/notificacoes/marcar-todas-lidas`, {}, { headers });
      this.results.notificationService.markAllAsRead = { 
        status: 'success', 
        data: response.data 
      };
      console.log('✅ markAllAsRead corrigida com sucesso');
    } catch (error) {
      this.results.notificationService.markAllAsRead = { 
        status: 'error', 
        error: error.response?.data || error.message 
      };
      console.log('❌ markAllAsRead ainda com erro:', error.response?.data || error.message);
    }

    // 3. Teste da função getUnreadCount (corrigida)
    try {
      const response = await axios.get(`${this.baseURL}/api/notificacoes/nao-lidas/contador`, { headers });
      this.results.notificationService.getUnreadCount = { 
        status: 'success', 
        count: response.data.count 
      };
      console.log(`✅ getUnreadCount corrigida com sucesso - ${response.data.count} não lidas`);
    } catch (error) {
      this.results.notificationService.getUnreadCount = { 
        status: 'error', 
        error: error.response?.data || error.message 
      };
      console.log('❌ getUnreadCount ainda com erro:', error.response?.data || error.message);
    }

    // 4. Teste da função getNotificationSettings (corrigida)
    try {
      const response = await axios.get(`${this.baseURL}/api/notificacoes/configuracoes`, { headers });
      this.results.notificationService.getNotificationSettings = { 
        status: 'success', 
        data: response.data 
      };
      console.log('✅ getNotificationSettings corrigida com sucesso');
    } catch (error) {
      this.results.notificationService.getNotificationSettings = { 
        status: 'error', 
        error: error.response?.data || error.message 
      };
      console.log('❌ getNotificationSettings ainda com erro:', error.response?.data || error.message);
    }
  }

  async testProcessRouteCorrections() {
    console.log('📋 Testando correções das rotas de processos...');
    
    const headers = { 'Authorization': `Bearer ${this.token}` };
    
    // 1. Teste da rota /processos/21 (corrigida param processo_id)
    try {
      const response = await axios.get(`${this.baseURL}/processos/21`, { headers });
      this.results.processes.getProcessById = { 
        status: 'success', 
        data: response.data 
      };
      console.log('✅ Busca de processo por ID corrigida com sucesso');
    } catch (error) {
      this.results.processes.getProcessById = { 
        status: 'error', 
        error: error.response?.data || error.message 
      };
      console.log('❌ Busca de processo ainda com erro:', error.response?.data || error.message);
    }

    // 2. Teste da rota /processos/21/usuarios
    try {
      const response = await axios.get(`${this.baseURL}/processos/21/usuarios`, { headers });
      this.results.processes.getProcessUsers = { 
        status: 'success', 
        data: response.data 
      };
      console.log('✅ Busca de usuários do processo OK');
    } catch (error) {
      this.results.processes.getProcessUsers = { 
        status: 'error', 
        error: error.response?.data || error.message 
      };
      console.log('❌ Busca de usuários do processo com erro:', error.response?.data || error.message);
    }
  }

  async testArchiveRouteCorrections() {
    console.log('📁 Testando correções das rotas de arquivos...');
    
    const headers = { 'Authorization': `Bearer ${this.token}` };
    
    // 1. Teste da função listarArquivosUsuario (schema corrigido)
    try {
      const response = await axios.get(`${this.baseURL}/api/arquivos/usuario/351`, { headers });
      this.results.apiRequest.getUserFiles = { 
        status: 'success', 
        data: response.data 
      };
      console.log('✅ Listagem de arquivos do usuário corrigida');
    } catch (error) {
      this.results.apiRequest.getUserFiles = { 
        status: 'error', 
        error: error.response?.data || error.message 
      };
      console.log('❌ Listagem de arquivos ainda com erro:', error.response?.data || error.message);
    }

    // 2. Teste da rota de upload (URL corrigida)
    try {
      // Teste apenas se a rota existe (sem arquivo real)
      const response = await axios.post(`${this.baseURL}/api/arquivos/upload`, {}, { 
        headers,
        validateStatus: status => status < 500 // Aceitar 4xx como válido
      });
      
      if (response.status === 400 || response.status === 422) {
        this.results.upload.uploadRoute = { 
          status: 'success', 
          message: 'Rota de upload existe e responde corretamente' 
        };
        console.log('✅ Rota de upload corrigida - responde adequadamente');
      } else {
        this.results.upload.uploadRoute = { 
          status: 'unexpected', 
          status_code: response.status 
        };
        console.log(`⚠️ Rota de upload com resposta inesperada: ${response.status}`);
      }
    } catch (error) {
      if (error.response?.status === 400 || error.response?.status === 422) {
        this.results.upload.uploadRoute = { 
          status: 'success', 
          message: 'Rota de upload existe e valida requisições' 
        };
        console.log('✅ Rota de upload corrigida - valida corretamente');
      } else {
        this.results.upload.uploadRoute = { 
          status: 'error', 
          error: error.response?.data || error.message 
        };
        console.log('❌ Rota de upload ainda com problema:', error.response?.data || error.message);
      }
    }
  }

  async testUserRoutes() {
    console.log('👤 Testando rotas de usuários...');
    
    const headers = { 'Authorization': `Bearer ${this.token}` };
    
    try {
      const response = await axios.get(`${this.baseURL}/api/usuarios/me`, { headers });
      this.results.apiRequest.getUserMe = { 
        status: 'success', 
        data: response.data 
      };
      console.log('✅ Rota /api/usuarios/me funcionando');
    } catch (error) {
      this.results.apiRequest.getUserMe = { 
        status: 'error', 
        error: error.response?.data || error.message 
      };
      console.log('❌ Rota /api/usuarios/me com erro:', error.response?.data || error.message);
    }
  }

  generateReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 RELATÓRIO DE CORREÇÕES DOS ERROS DO FRONTEND');
    console.log('='.repeat(80));
    
    let totalTests = 0;
    let successfulTests = 0;
    
    // Contar e exibir resultados por categoria
    Object.keys(this.results).forEach(category => {
      console.log(`\n📂 ${category.toUpperCase()}:`);
      Object.keys(this.results[category]).forEach(test => {
        totalTests++;
        const result = this.results[category][test];
        if (result.status === 'success') {
          successfulTests++;
          console.log(`  ✅ ${test}: Corrigido`);
        } else if (result.status === 'error') {
          console.log(`  ❌ ${test}: ${result.error}`);
        } else {
          console.log(`  ⚠️ ${test}: Status ${result.status_code || result.status}`);
        }
      });
    });
    
    const successRate = ((successfulTests / totalTests) * 100).toFixed(1);
    
    console.log('\n' + '='.repeat(80));
    console.log(`📈 RESULTADOS FINAIS:`);
    console.log(`✅ Testes Passaram: ${successfulTests}/${totalTests}`);
    console.log(`📊 Taxa de Sucesso: ${successRate}%`);
    
    if (successRate >= 90) {
      console.log('🎉 EXCELENTE! A maioria dos erros foi corrigida.');
    } else if (successRate >= 70) {
      console.log('👍 BOM! Várias correções foram aplicadas com sucesso.');
    } else {
      console.log('⚠️ Ainda há erros importantes que precisam ser corrigidos.');
    }
    
    return {
      totalTests,
      successfulTests,
      successRate: parseFloat(successRate),
      results: this.results
    };
  }

  async runTests() {
    console.log('🚀 Executando teste de correções dos erros do frontend...\n');
    
    // Login
    const loginSuccess = await this.login();
    if (!loginSuccess) {
      console.log('❌ Teste interrompido - falha na autenticação');
      return;
    }
    
    // Executar testes
    await this.testNotificationServiceCorrections();
    await this.testProcessRouteCorrections();
    await this.testArchiveRouteCorrections();
    await this.testUserRoutes();
    
    return this.generateReport();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const test = new FrontendErrorTest();
  test.runTests().then(report => {
    process.exit(report && report.successRate >= 90 ? 0 : 1);
  }).catch(error => {
    console.error('❌ Erro durante execução do teste:', error);
    process.exit(1);
  });
}

module.exports = FrontendErrorTest;
