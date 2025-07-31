// Teste completo das funcionalidades do sistema
// Este teste valida todas as correções implementadas

const axios = require('axios');

class SystemTest {
  constructor() {
    this.baseURL = 'http://localhost:3001';
    this.token = null;
    this.usuarioId = null;
    this.errors = [];
    this.successes = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : '🔍';
    console.log(`${prefix} [${timestamp}] ${message}`);
    
    if (type === 'error') {
      this.errors.push(message);
    } else if (type === 'success') {
      this.successes.push(message);
    }
  }

  async makeRequest(method, endpoint, data = null, headers = {}) {
    try {
      const config = {
        method,
        url: `${this.baseURL}${endpoint}`,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      };

      if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        config.data = data;
      }

      const response = await axios(config);
      return { success: true, data: response.data, status: response.status };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data || error.message, 
        status: error.response?.status 
      };
    }
  }

  async testLogin() {
    this.log('🔐 Testando autenticação...');
    
    const result = await this.makeRequest('POST', '/auth/login', {
      email: 'admin@teste.com',
      senha: '123456'
    });

    if (result.success && result.data.token) {
      this.token = result.data.token;
      this.usuarioId = result.data.usuario?.id || 351;
      this.log('Login realizado com sucesso', 'success');
      return true;
    } else {
      this.log(`Falha no login: ${JSON.stringify(result.error)}`, 'error');
      return false;
    }
  }

  async testNotificationRoutes() {
    this.log('🔔 Testando rotas de notificações...');
    
    const headers = { 'Authorization': `Bearer ${this.token}` };
    
    // 1. Listar notificações
    const listResult = await this.makeRequest('GET', '/api/notificacoes', null, headers);
    if (listResult.success) {
      this.log('Listagem de notificações OK', 'success');
    } else {
      this.log(`Erro ao listar notificações: ${JSON.stringify(listResult.error)}`, 'error');
    }

    // 2. Contador de não lidas
    const countResult = await this.makeRequest('GET', '/api/notificacoes/nao-lidas/contador', null, headers);
    if (countResult.success) {
      this.log(`Contador de não lidas OK: ${countResult.data.count}`, 'success');
    } else {
      this.log(`Erro no contador: ${JSON.stringify(countResult.error)}`, 'error');
    }

    // 3. Marcar todas como lidas (corrigido para PUT)
    const markAllResult = await this.makeRequest('PUT', '/api/notificacoes/marcar-todas-lidas', null, headers);
    if (markAllResult.success) {
      this.log('Marcar todas como lidas OK', 'success');
    } else {
      this.log(`Erro ao marcar todas como lidas: ${JSON.stringify(markAllResult.error)}`, 'error');
    }

    // 4. Configurações de notificação
    const configResult = await this.makeRequest('GET', '/api/notificacoes/configuracoes', null, headers);
    if (configResult.success) {
      this.log('Configurações de notificação OK', 'success');
    } else {
      this.log(`Erro nas configurações: ${JSON.stringify(configResult.error)}`, 'error');
    }
  }

  async testProcessRoutes() {
    this.log('📋 Testando rotas de processos...');
    
    const headers = { 'Authorization': `Bearer ${this.token}` };
    
    // 1. Listar processos
    const listResult = await this.makeRequest('GET', '/api/processos', null, headers);
    if (listResult.success) {
      this.log('Listagem de processos OK', 'success');
    } else {
      this.log(`Erro ao listar processos: ${JSON.stringify(listResult.error)}`, 'error');
    }

    // 2. Buscar processo específico (corrigido)
    const processResult = await this.makeRequest('GET', '/processos/21', null, headers);
    if (processResult.success) {
      this.log('Busca de processo específico OK', 'success');
    } else {
      this.log(`Erro ao buscar processo 21: ${JSON.stringify(processResult.error)}`, 'error');
    }

    // 3. Usuários do processo
    const usersResult = await this.makeRequest('GET', '/processos/21/usuarios', null, headers);
    if (usersResult.success) {
      this.log('Usuários do processo OK', 'success');
    } else {
      this.log(`Erro ao buscar usuários do processo: ${JSON.stringify(usersResult.error)}`, 'error');
    }
  }

  async testFileRoutes() {
    this.log('📁 Testando rotas de arquivos...');
    
    const headers = { 'Authorization': `Bearer ${this.token}` };
    
    // 1. Listar arquivos do usuário (corrigido)
    const filesResult = await this.makeRequest('GET', `/api/arquivos/usuario/${this.usuarioId}`, null, headers);
    if (filesResult.success) {
      this.log('Listagem de arquivos do usuário OK', 'success');
    } else {
      this.log(`Erro ao listar arquivos: ${JSON.stringify(filesResult.error)}`, 'error');
    }

    // 2. Testar endpoint de upload (sem arquivo real, apenas validar rota)
    const uploadTest = await this.makeRequest('POST', '/api/arquivos', {}, headers);
    if (uploadTest.status === 400 || uploadTest.status === 422) {
      this.log('Endpoint de upload responde corretamente', 'success');
    } else {
      this.log(`Endpoint de upload com comportamento inesperado: ${uploadTest.status}`, 'error');
    }
  }

  async testUserRoutes() {
    this.log('👤 Testando rotas de usuários...');
    
    const headers = { 'Authorization': `Bearer ${this.token}` };
    
    // 1. Dados do usuário logado
    const meResult = await this.makeRequest('GET', '/api/usuarios/me', null, headers);
    if (meResult.success) {
      this.log('Dados do usuário logado OK', 'success');
    } else {
      this.log(`Erro ao buscar dados do usuário: ${JSON.stringify(meResult.error)}`, 'error');
    }

    // 2. Listar usuários
    const usersResult = await this.makeRequest('GET', '/api/usuarios', null, headers);
    if (usersResult.success) {
      this.log('Listagem de usuários OK', 'success');
    } else {
      this.log(`Erro ao listar usuários: ${JSON.stringify(usersResult.error)}`, 'error');
    }
  }

  async testAgendamentosRoutes() {
    this.log('📅 Testando rotas de agendamentos...');
    
    const headers = { 'Authorization': `Bearer ${this.token}` };
    
    const agendamentosResult = await this.makeRequest('GET', '/api/agendamentos', null, headers);
    if (agendamentosResult.success) {
      this.log('Listagem de agendamentos OK', 'success');
    } else {
      this.log(`Erro ao listar agendamentos: ${JSON.stringify(agendamentosResult.error)}`, 'error');
    }
  }

  async runAllTests() {
    console.log('🚀 Iniciando teste completo do sistema...\n');
    
    // 1. Teste de autenticação
    const loginSuccess = await this.testLogin();
    if (!loginSuccess) {
      this.log('Teste interrompido - falha na autenticação', 'error');
      return this.generateReport();
    }

    // 2. Testes das funcionalidades
    await this.testNotificationRoutes();
    await this.testProcessRoutes();
    await this.testFileRoutes();
    await this.testUserRoutes();
    await this.testAgendamentosRoutes();

    return this.generateReport();
  }

  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 RELATÓRIO FINAL DO TESTE');
    console.log('='.repeat(60));
    
    console.log(`✅ Sucessos: ${this.successes.length}`);
    console.log(`❌ Erros: ${this.errors.length}`);
    
    if (this.errors.length > 0) {
      console.log('\n🔍 ERROS ENCONTRADOS:');
      this.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }
    
    if (this.successes.length > 0) {
      console.log('\n✅ FUNCIONALIDADES OK:');
      this.successes.forEach((success, index) => {
        console.log(`${index + 1}. ${success}`);
      });
    }
    
    const successRate = ((this.successes.length / (this.successes.length + this.errors.length)) * 100).toFixed(1);
    console.log(`\n📈 Taxa de sucesso: ${successRate}%`);
    
    return {
      totalTests: this.successes.length + this.errors.length,
      successes: this.successes.length,
      errors: this.errors.length,
      successRate: parseFloat(successRate),
      errorDetails: this.errors
    };
  }
}

// Executar teste se chamado diretamente
if (require.main === module) {
  const test = new SystemTest();
  test.runAllTests().then(report => {
    process.exit(report.errors.length > 0 ? 1 : 0);
  }).catch(error => {
    console.error('❌ Erro durante execução do teste:', error);
    process.exit(1);
  });
}

module.exports = SystemTest;
