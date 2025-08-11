/**
 * Testes Massivos e Mapeamento de Endpoints - Sistema NPJ
 * 
 * Este script realiza testes abrangentes de todos os endpoints do sistema,
 * validando permissões específicas para cada tipo de usuário:
 * - Admin: Acesso total
 * - Professor: Acesso limitado (não pode gerenciar admins)
 * - Aluno: Acesso restrito aos próprios dados
 */

const axios = require('axios');
const fs = require('fs');

// Configuração base
const BASE_URL = 'http://localhost:3001/api';
const CREDENTIALS = {
  admin: { email: 'admin@teste.com', senha: '123456' },
  professor: { email: 'prof.teste@npj.com', senha: '123456' },
  aluno: { email: 'aluno.teste@npj.com', senha: '123456' }
};

// Tokens de autenticação (serão preenchidos durante login)
let TOKENS = {
  admin: null,
  professor: null,
  aluno: null
};

// IDs de dados de teste (serão preenchidos durante execução)
let TEST_IDS = {
  processos: [],
  agendamentos: [],
  arquivos: [],
  usuarios: []
};

// Cores para output do console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Função para logs coloridos
function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

// Função para delay entre requests
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Classe para gerenciar resultados dos testes
class TestResults {
  constructor() {
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      endpoints: {},
      permissions: {
        admin: { passed: 0, failed: 0 },
        professor: { passed: 0, failed: 0 },
        aluno: { passed: 0, failed: 0 }
      }
    };
  }

  addTest(endpoint, userType, status, details = '') {
    this.results.total++;
    
    if (!this.results.endpoints[endpoint]) {
      this.results.endpoints[endpoint] = { admin: null, professor: null, aluno: null };
    }
    
    this.results.endpoints[endpoint][userType] = { status, details };
    
    if (status === 'PASS') {
      this.results.passed++;
      this.results.permissions[userType].passed++;
    } else {
      this.results.failed++;
      this.results.permissions[userType].failed++;
    }
  }

  generateReport() {
    const report = {
      summary: {
        totalTests: this.results.total,
        passed: this.results.passed,
        failed: this.results.failed,
        successRate: ((this.results.passed / this.results.total) * 100).toFixed(2) + '%'
      },
      byUserType: this.results.permissions,
      endpointDetails: this.results.endpoints,
      timestamp: new Date().toISOString()
    };

    // Salvar relatório em arquivo
    fs.writeFileSync('test-report.json', JSON.stringify(report, null, 2));
    
    // Log do resumo
    log('\n' + '='.repeat(60), 'cyan');
    log('RELATÓRIO FINAL DE TESTES', 'bright');
    log('='.repeat(60), 'cyan');
    log(`Total de testes: ${report.summary.totalTests}`, 'blue');
    log(`Sucessos: ${report.summary.passed}`, 'green');
    log(`Falhas: ${report.summary.failed}`, 'red');
    log(`Taxa de sucesso: ${report.summary.successRate}`, 'yellow');
    
    log('\nPor tipo de usuário:', 'bright');
    Object.entries(report.byUserType).forEach(([userType, stats]) => {
      log(`${userType.toUpperCase()}: ${stats.passed} sucessos, ${stats.failed} falhas`, 'blue');
    });
    
    log('\nRelatório completo salvo em: test-report.json', 'green');
    log('='.repeat(60), 'cyan');

    return report;
  }
}

const testResults = new TestResults();

// Função para fazer request com tratamento de erro
async function makeRequest(method, endpoint, data = null, token = null, expectedStatus = [200, 201]) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      timeout: 10000
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      config.data = data;
    }

    const response = await axios(config);
    return {
      success: expectedStatus.includes(response.status),
      status: response.status,
      data: response.data,
      error: null
    };
  } catch (error) {
    return {
      success: expectedStatus.includes(error.response?.status),
      status: error.response?.status || 0,
      data: null,
      error: error.message
    };
  }
}

// Função de login para obter tokens
async function loginAllUsers() {
  log('Fazendo login para todos os tipos de usuário...', 'yellow');
  
  for (const [userType, credentials] of Object.entries(CREDENTIALS)) {
    try {
      const response = await makeRequest('POST', '/auth/login', credentials);
      if (response.success && response.data.token) {
        TOKENS[userType] = response.data.token;
        log(`✓ Login ${userType} realizado com sucesso`, 'green');
      } else {
        log(`✗ Falha no login ${userType}`, 'red');
      }
    } catch (error) {
      log(`✗ Erro no login ${userType}: ${error.message}`, 'red');
    }
    await delay(500);
  }
}

// Teste de endpoint específico para um usuário
async function testEndpoint(endpoint, method, userType, data = null, expectedStatuses = [200, 201]) {
  const token = TOKENS[userType];
  const response = await makeRequest(method, endpoint, data, token, expectedStatuses);
  
  const status = response.success ? 'PASS' : 'FAIL';
  const details = `${method} ${endpoint} - Status: ${response.status}`;
  
  testResults.addTest(endpoint, userType, status, details);
  
  const color = response.success ? 'green' : 'red';
  log(`[${userType.toUpperCase()}] ${method} ${endpoint} - ${status} (${response.status})`, color);
  
  return response;
}

// Testes dos endpoints de autenticação
async function testAuthEndpoints() {
  log('\n📋 TESTANDO ENDPOINTS DE AUTENTICAÇÃO', 'cyan');
  
  // Teste de registro (todos devem conseguir se registrar)
  for (const userType of ['admin', 'professor', 'aluno']) {
    await testEndpoint('/auth/registro', 'POST', userType, {
      nome: `Teste ${userType}`,
      email: `teste-${userType}-${Date.now()}@teste.com`,
      senha: '123456',
      role_id: userType === 'admin' ? 1 : userType === 'professor' ? 2 : 3
    }, [200, 201, 400]); // 400 pode ser esperado se usuário já existe
    await delay(300);
  }

  // Teste de refresh token
  for (const userType of ['admin', 'professor', 'aluno']) {
    await testEndpoint('/auth/refresh', 'POST', userType, null, [200, 401]);
    await delay(300);
  }
}

// Testes dos endpoints de usuários
async function testUserEndpoints() {
  log('\n👥 TESTANDO ENDPOINTS DE USUÁRIOS', 'cyan');
  
  // Listar usuários
  await testEndpoint('/usuarios', 'GET', 'admin', null, [200]);
  await testEndpoint('/usuarios', 'GET', 'professor', null, [200]);
  await testEndpoint('/usuarios', 'GET', 'aluno', null, [403]); // Aluno não deve ter acesso
  
  // Perfil próprio
  for (const userType of ['admin', 'professor', 'aluno']) {
    await testEndpoint('/usuarios/perfil', 'GET', userType, null, [200]);
    await delay(300);
  }
  
  // Criar usuário (teste de permissão)
  const novoUsuario = {
    nome: 'Usuário Teste',
    email: `teste-criacao-${Date.now()}@teste.com`,
    senha: '123456',
    role_id: 3
  };
  
  await testEndpoint('/usuarios', 'POST', 'admin', novoUsuario, [200, 201]);
  await testEndpoint('/usuarios', 'POST', 'professor', novoUsuario, [200, 201, 403]);
  await testEndpoint('/usuarios', 'POST', 'aluno', novoUsuario, [403]); // Aluno não pode criar
}

// Testes dos endpoints de processos
async function testProcessEndpoints() {
  log('\n⚖️ TESTANDO ENDPOINTS DE PROCESSOS', 'cyan');
  
  // Listar processos
  await testEndpoint('/processos', 'GET', 'admin', null, [200]);
  await testEndpoint('/processos', 'GET', 'professor', null, [200]);
  await testEndpoint('/processos', 'GET', 'aluno', null, [200]);
  
  // Processos do usuário
  for (const userType of ['admin', 'professor', 'aluno']) {
    await testEndpoint('/processos/usuario', 'GET', userType, null, [200]);
    await delay(300);
  }
  
  // Criar processo
  const novoProcesso = {
    numero: `PROC-TEST-${Date.now()}`,
    titulo: 'Processo de Teste',
    descricao: 'Descrição do processo de teste',
    data_abertura: new Date().toISOString().split('T')[0],
    status: 'Ativo'
  };
  
  const adminProcesso = await testEndpoint('/processos', 'POST', 'admin', novoProcesso, [200, 201]);
  if (adminProcesso.success && adminProcesso.data?.id) {
    TEST_IDS.processos.push(adminProcesso.data.id);
  }
  
  await testEndpoint('/processos', 'POST', 'professor', { ...novoProcesso, numero: `PROF-${Date.now()}` }, [200, 201]);
  await testEndpoint('/processos', 'POST', 'aluno', { ...novoProcesso, numero: `ALUNO-${Date.now()}` }, [403]); // Aluno não pode criar
  
  // Testar vinculação de usuário (se temos processo criado)
  if (TEST_IDS.processos.length > 0) {
    const processoId = TEST_IDS.processos[0];
    
    await testEndpoint(`/processos/${processoId}/vincular-usuario`, 'POST', 'admin', {
      usuario_id: 1,
      role: 'Aluno'
    }, [200, 201, 400]);
    
    await testEndpoint(`/processos/${processoId}/vincular-usuario`, 'POST', 'professor', {
      usuario_id: 1,
      role: 'Aluno'
    }, [200, 201, 400, 403]);
    
    await testEndpoint(`/processos/${processoId}/vincular-usuario`, 'POST', 'aluno', {
      usuario_id: 1,
      role: 'Aluno'
    }, [403]); // Aluno não pode vincular
  }
}

// Testes dos endpoints de agendamentos
async function testAgendamentoEndpoints() {
  log('\n📅 TESTANDO ENDPOINTS DE AGENDAMENTOS', 'cyan');
  
  // Listar agendamentos (todos devem ter acesso)
  for (const userType of ['admin', 'professor', 'aluno']) {
    await testEndpoint('/agendamentos', 'GET', userType, null, [200]);
    await delay(300);
  }
  
  // Agendamentos do usuário
  for (const userType of ['admin', 'professor', 'aluno']) {
    await testEndpoint('/agendamentos/usuario', 'GET', userType, null, [200]);
    await delay(300);
  }
  
  // Criar agendamento (todos devem conseguir)
  const novoAgendamento = {
    titulo: 'Agendamento de Teste',
    descricao: 'Descrição do agendamento',
    data_hora: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Amanhã
    local: 'Sala de Reuniões',
    tipo: 'Reunião'
  };
  
  for (const userType of ['admin', 'professor', 'aluno']) {
    const response = await testEndpoint('/agendamentos', 'POST', userType, {
      ...novoAgendamento,
      titulo: `${novoAgendamento.titulo} - ${userType}`
    }, [200, 201]);
    
    if (response.success && response.data?.id) {
      TEST_IDS.agendamentos.push(response.data.id);
    }
    await delay(300);
  }
  
  // Estatísticas de agendamentos
  for (const userType of ['admin', 'professor', 'aluno']) {
    await testEndpoint('/agendamentos/estatisticas', 'GET', userType, null, [200]);
    await delay(300);
  }
}

// Testes dos endpoints de dashboard
async function testDashboardEndpoints() {
  log('\n📊 TESTANDO ENDPOINTS DE DASHBOARD', 'cyan');
  
  // Estatísticas do dashboard
  for (const userType of ['admin', 'professor', 'aluno']) {
    await testEndpoint('/dashboard/estatisticas', 'GET', userType, null, [200]);
    await delay(300);
  }
  
  // Stats alternativo
  for (const userType of ['admin', 'professor', 'aluno']) {
    await testEndpoint('/dashboard/stats', 'GET', userType, null, [200]);
    await delay(300);
  }
  
  // Exportar relatório (todos devem ter acesso)
  for (const userType of ['admin', 'professor', 'aluno']) {
    await testEndpoint('/dashboard/exportar', 'GET', userType, null, [200]);
    await delay(300);
  }
  
  // Status detalhado
  for (const userType of ['admin', 'professor', 'aluno']) {
    await testEndpoint('/dashboard/status-detalhado', 'GET', userType, null, [200]);
    await delay(300);
  }
}

// Testes dos endpoints de arquivos
async function testArquivoEndpoints() {
  log('\n📁 TESTANDO ENDPOINTS DE ARQUIVOS', 'cyan');
  
  // Listar arquivos (todos devem ter acesso aos próprios)
  for (const userType of ['admin', 'professor', 'aluno']) {
    await testEndpoint('/arquivos', 'GET', userType, null, [200]);
    await delay(300);
  }
  
  // Arquivos por usuário (teste de permissão)
  await testEndpoint('/arquivos/usuario/1', 'GET', 'admin', null, [200, 404]);
  await testEndpoint('/arquivos/usuario/1', 'GET', 'professor', null, [200, 403, 404]);
  await testEndpoint('/arquivos/usuario/1', 'GET', 'aluno', null, [403]); // Aluno não deve acessar arquivos de outros
}

// Testes dos endpoints de notificações
async function testNotificacaoEndpoints() {
  log('\n🔔 TESTANDO ENDPOINTS DE NOTIFICAÇÕES', 'cyan');
  
  // Listar notificações (todos devem ter acesso às próprias)
  for (const userType of ['admin', 'professor', 'aluno']) {
    await testEndpoint('/notificacoes', 'GET', userType, null, [200]);
    await delay(300);
  }
  
  // Marcar como lida (todos devem conseguir com suas próprias notificações)
  for (const userType of ['admin', 'professor', 'aluno']) {
    await testEndpoint('/notificacoes/1/lida', 'PUT', userType, null, [200, 404]); // 404 se não existir
    await delay(300);
  }
}

// Testes dos endpoints de tabelas auxiliares
async function testTabelaAuxiliarEndpoints() {
  log('\n🗂️ TESTANDO ENDPOINTS DE TABELAS AUXILIARES', 'cyan');
  
  // Roles (todos devem ter acesso para visualização)
  for (const userType of ['admin', 'professor', 'aluno']) {
    await testEndpoint('/tabelas/roles', 'GET', userType, null, [200]);
    await delay(300);
  }
  
  // Outras tabelas auxiliares que possam existir
  const tabelasComuns = ['/tabelas/fases', '/tabelas/materias', '/tabelas/locais'];
  
  for (const tabela of tabelasComuns) {
    for (const userType of ['admin', 'professor', 'aluno']) {
      await testEndpoint(tabela, 'GET', userType, null, [200, 404]); // 404 se endpoint não existir
      await delay(200);
    }
  }
}

// Teste de atualização automática pós-CRUD
async function testAutoRefresh() {
  log('\n🔄 TESTANDO REFRESH AUTOMÁTICO PÓS-CRUD', 'cyan');
  
  // Este teste verifica se as operações de CRUD retornam dados atualizados
  // Na prática, seria testado no frontend, mas podemos simular aqui
  
  if (TEST_IDS.agendamentos.length > 0) {
    const agendamentoId = TEST_IDS.agendamentos[0];
    
    // Atualizar agendamento e verificar se retorna dados atualizados
    for (const userType of ['admin', 'professor', 'aluno']) {
      const updateResponse = await testEndpoint(`/agendamentos/${agendamentoId}`, 'PUT', userType, {
        titulo: `Agendamento Atualizado - ${userType}`,
        descricao: 'Descrição atualizada'
      }, [200, 403, 404]);
      
      if (updateResponse.success) {
        // Verificar se os dados foram atualizados
        const getResponse = await testEndpoint(`/agendamentos/${agendamentoId}`, 'GET', userType, null, [200]);
        
        if (getResponse.success && getResponse.data?.titulo?.includes('Atualizado')) {
          log(`✓ Refresh automático funcionando para ${userType}`, 'green');
        } else {
          log(`✗ Problema no refresh automático para ${userType}`, 'red');
        }
      }
      await delay(300);
    }
  }
}

// Função principal de execução dos testes
async function runAllTests() {
  try {
    log('🚀 INICIANDO TESTES MASSIVOS DO SISTEMA NPJ', 'bright');
    log('='.repeat(60), 'cyan');
    
    // 1. Login de todos os usuários
    await loginAllUsers();
    await delay(1000);
    
    // 2. Testar endpoints por categoria
    await testAuthEndpoints();
    await delay(500);
    
    await testUserEndpoints();
    await delay(500);
    
    await testProcessEndpoints();
    await delay(500);
    
    await testAgendamentoEndpoints();
    await delay(500);
    
    await testDashboardEndpoints();
    await delay(500);
    
    await testArquivoEndpoints();
    await delay(500);
    
    await testNotificacaoEndpoints();
    await delay(500);
    
    await testTabelaAuxiliarEndpoints();
    await delay(500);
    
    // 3. Testes específicos de funcionalidade
    await testAutoRefresh();
    
    // 4. Gerar relatório final
    const report = testResults.generateReport();
    
    // 5. Recomendações baseadas nos resultados
    log('\n📋 RECOMENDAÇÕES:', 'bright');
    
    if (report.summary.successRate < 80) {
      log('⚠️ Taxa de sucesso baixa - revisar implementações críticas', 'red');
    }
    
    if (report.byUserType.aluno.failed > report.byUserType.aluno.passed) {
      log('⚠️ Muitas falhas para usuário Aluno - verificar restrições', 'yellow');
    }
    
    if (report.byUserType.admin.failed > 0) {
      log('⚠️ Admin tem falhas - verificar permissões administrativas', 'yellow');
    }
    
    log('\n✅ Testes concluídos! Verifique o arquivo test-report.json para detalhes completos.', 'green');
    
  } catch (error) {
    log(`❌ Erro durante execução dos testes: ${error.message}`, 'red');
    console.error(error);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  runAllTests,
  testResults,
  TOKENS,
  TEST_IDS
};
