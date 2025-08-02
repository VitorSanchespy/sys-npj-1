const axios = require('axios');
const fs = require('fs');

const BASE_URL = 'http://localhost:3001';
let authToken = '';
let reportData = {
  timestamp: new Date().toISOString(),
  totalTests: 0,
  passedTests: 0,
  failedTests: 0,
  endpoints: [],
  errors: []
};

// Função utilitária para fazer requisições
async function makeRequest(method, endpoint, data = null, headers = {}) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status || 500
    };
  }
}

// Função para registrar resultado do teste
function logTest(endpoint, method, result, description = '') {
  reportData.totalTests++;
  
  const testResult = {
    endpoint,
    method,
    description,
    status: result.status,
    success: result.success,
    timestamp: new Date().toISOString()
  };
  
  if (result.success) {
    reportData.passedTests++;
    console.log(`✅ ${method} ${endpoint} - ${result.status} - ${description}`);
  } else {
    reportData.failedTests++;
    console.log(`❌ ${method} ${endpoint} - ${result.status} - ${description}`);
    testResult.error = result.error;
    reportData.errors.push({
      endpoint,
      method,
      error: result.error,
      status: result.status
    });
  }
  
  reportData.endpoints.push(testResult);
}

// Testes do sistema
async function runTests() {
  console.log('🚀 Iniciando testes completos do backend...\n');
  
  // 1. Teste de conexão básica
  console.log('📡 1. TESTANDO CONEXÃO BÁSICA');
  const healthResult = await makeRequest('GET', '/');
  logTest('/', 'GET', healthResult, 'Teste de conexão básica');
  
  // 2. Testes de autenticação
  console.log('\n🔐 2. TESTANDO AUTENTICAÇÃO');
  
  // Login com credenciais válidas
  const loginResult = await makeRequest('POST', '/api/auth/login', {
    email: 'admin@teste.com',
    senha: 'admin123'
  });
  logTest('/api/auth/login', 'POST', loginResult, 'Login com credenciais válidas');
  
  if (loginResult.success && loginResult.data.token) {
    authToken = loginResult.data.token;
    console.log('🔑 Token obtido com sucesso');
  }
  
  // Login com credenciais inválidas (deve falhar)
  const loginInvalidResult = await makeRequest('POST', '/api/auth/login', {
    email: 'invalido@teste.com',
    senha: 'senhaerrada'
  });
  // Este teste DEVE falhar - é um teste negativo
  const loginInvalidTestResult = {
    success: !loginInvalidResult.success && loginInvalidResult.status === 401,
    status: loginInvalidResult.status,
    error: loginInvalidResult.error
  };
  logTest('/api/auth/login', 'POST', loginInvalidTestResult, 'Login com credenciais inválidas (deve falhar)');
  
  // Registro de novo usuário
  const registroResult = await makeRequest('POST', '/api/auth/registro', {
    nome: 'Usuário Teste',
    email: 'novousuario@teste.com',
    senha: 'senha123',
    role_id: 2
  });
  logTest('/api/auth/registro', 'POST', registroResult, 'Registro de novo usuário');
  
  // Esqueci senha
  const esqueciSenhaResult = await makeRequest('POST', '/api/auth/esqueci-senha', {
    email: 'admin@teste.com'
  });
  logTest('/api/auth/esqueci-senha', 'POST', esqueciSenhaResult, 'Esqueci senha');
  
  // 3. Testes com autenticação
  const authHeaders = authToken ? { 'Authorization': `Bearer ${authToken}` } : {};
  
  console.log('\n👤 3. TESTANDO ENDPOINTS DE USUÁRIO');
  
  // Perfil do usuário
  const perfilResult = await makeRequest('GET', '/api/auth/perfil', null, authHeaders);
  logTest('/api/auth/perfil', 'GET', perfilResult, 'Obter perfil do usuário');
  
  // Listar usuários
  const usuariosResult = await makeRequest('GET', '/api/usuarios', null, authHeaders);
  logTest('/api/usuarios', 'GET', usuariosResult, 'Listar usuários');
  
  // Criar usuário
  const criarUsuarioResult = await makeRequest('POST', '/api/usuarios', {
    nome: 'Novo Usuário API',
    email: 'apiuser@teste.com',
    senha: 'senha123',
    role_id: 3
  }, authHeaders);
  logTest('/api/usuarios', 'POST', criarUsuarioResult, 'Criar novo usuário');
  
  // Obter usuário específico
  const usuarioResult = await makeRequest('GET', '/api/usuarios/1', null, authHeaders);
  logTest('/api/usuarios/1', 'GET', usuarioResult, 'Obter usuário específico');
  
  // Atualizar usuário
  const atualizarUsuarioResult = await makeRequest('PUT', '/api/usuarios/1', {
    nome: 'Nome Atualizado'
  }, authHeaders);
  logTest('/api/usuarios/1', 'PUT', atualizarUsuarioResult, 'Atualizar usuário');
  
  console.log('\n📋 4. TESTANDO ENDPOINTS DE PROCESSOS');
  
  // Listar processos
  const processosResult = await makeRequest('GET', '/api/processos', null, authHeaders);
  logTest('/api/processos', 'GET', processosResult, 'Listar processos');
  
  // Criar processo
  const criarProcessoResult = await makeRequest('POST', '/api/processos', {
    numero_processo: '2024-003-TESTE-API',
    parte_contraria: 'Empresa XYZ Ltda',
    assunto: 'Ação de Cobrança',
    comarca: 'Cuiabá',
    vara: '1ª Vara Civil',
    valor_causa: 5000.00,
    tipo_acao: 'Civil',
    status: 'Em Andamento',
    prioridade: 'Normal',
    descricao: 'Processo criado via API de teste',
    idusuario_responsavel: 1
  }, authHeaders);
  logTest('/api/processos', 'POST', criarProcessoResult, 'Criar novo processo');
  
  // Obter processo específico
  const processoResult = await makeRequest('GET', '/api/processos/1', null, authHeaders);
  logTest('/api/processos/1', 'GET', processoResult, 'Obter processo específico');
  
  // Atualizar processo
  const atualizarProcessoResult = await makeRequest('PUT', '/api/processos/1', {
    status: 'Finalizado'
  }, authHeaders);
  logTest('/api/processos/1', 'PUT', atualizarProcessoResult, 'Atualizar processo');
  
  console.log('\n📅 5. TESTANDO ENDPOINTS DE AGENDAMENTOS');
  
  // Listar agendamentos
  const agendamentosResult = await makeRequest('GET', '/api/agendamentos', null, authHeaders);
  logTest('/api/agendamentos', 'GET', agendamentosResult, 'Listar agendamentos');
  
  // Criar agendamento
  const criarAgendamentoResult = await makeRequest('POST', '/api/agendamentos', {
    titulo: 'Audiência de Teste API',
    data_agendamento: '2024-12-25',
    hora_inicio: '10:00',
    hora_fim: '11:00',
    local: 'Fórum Central',
    tipo: 'Audiência',
    descricao: 'Audiência criada via API de teste',
    idprocesso: 1,
    idusuario: 1
  }, authHeaders);
  logTest('/api/agendamentos', 'POST', criarAgendamentoResult, 'Criar novo agendamento');
  
  // Obter agendamento específico
  const agendamentoResult = await makeRequest('GET', '/api/agendamentos/1', null, authHeaders);
  logTest('/api/agendamentos/1', 'GET', agendamentoResult, 'Obter agendamento específico');
  
  // Atualizar agendamento
  const atualizarAgendamentoResult = await makeRequest('PUT', '/api/agendamentos/1', {
    status: 'Confirmado'
  }, authHeaders);
  logTest('/api/agendamentos/1', 'PUT', atualizarAgendamentoResult, 'Atualizar agendamento');
  
  console.log('\n🔔 6. TESTANDO ENDPOINTS DE NOTIFICAÇÕES');
  
  // Listar notificações
  const notificacoesResult = await makeRequest('GET', '/api/notificacoes', null, authHeaders);
  logTest('/api/notificacoes', 'GET', notificacoesResult, 'Listar notificações');
  
  // Criar notificação
  const criarNotificacaoResult = await makeRequest('POST', '/api/notificacoes', {
    titulo: 'Notificação de Teste API',
    mensagem: 'Esta é uma notificação criada via API de teste',
    idusuario: 1,
    tipo: 'info'
  }, authHeaders);
  logTest('/api/notificacoes', 'POST', criarNotificacaoResult, 'Criar nova notificação');
  
  // Marcar como lida
  const lerNotificacaoResult = await makeRequest('PUT', '/api/notificacoes/1/lida', {}, authHeaders);
  logTest('/api/notificacoes/1/lida', 'PUT', lerNotificacaoResult, 'Marcar notificação como lida');
  
  console.log('\n📁 7. TESTANDO ENDPOINTS DE ARQUIVOS');
  
  // Listar arquivos
  const arquivosResult = await makeRequest('GET', '/api/arquivos', null, authHeaders);
  logTest('/api/arquivos', 'GET', arquivosResult, 'Listar arquivos');
  
  // Upload seria testado com multipart, aqui testamos só a estrutura
  const uploadTestResult = await makeRequest('POST', '/api/arquivos/upload', {}, authHeaders);
  // Este teste verifica se a estrutura está funcionando - deve retornar erro de arquivo não enviado
  const uploadStructureTestResult = {
    success: !uploadTestResult.success && uploadTestResult.status === 400 && 
             uploadTestResult.error.erro === 'Nenhum arquivo foi enviado',
    status: uploadTestResult.status,
    error: uploadTestResult.error
  };
  logTest('/api/arquivos/upload', 'POST', uploadStructureTestResult, 'Teste estrutura upload (sem arquivo - deve falhar)');
  
  console.log('\n🔄 8. TESTANDO ENDPOINTS DE ATUALIZAÇÕES');
  
  // Listar atualizações
  const atualizacoesResult = await makeRequest('GET', '/api/atualizacoes', null, authHeaders);
  logTest('/api/atualizacoes', 'GET', atualizacoesResult, 'Listar atualizações de processo');
  
  // Criar atualização
  const criarAtualizacaoResult = await makeRequest('POST', '/api/atualizacoes', {
    titulo: 'Atualização de Teste API',
    descricao: 'Atualização criada via API de teste',
    idprocesso: 1,
    status_anterior: 'Em Andamento',
    status_novo: 'Aguardando'
  }, authHeaders);
  logTest('/api/atualizacoes', 'POST', criarAtualizacaoResult, 'Criar nova atualização');
  
  console.log('\n📊 9. TESTANDO ENDPOINTS DE TABELAS AUXILIARES');
  
  // Listar roles
  const rolesResult = await makeRequest('GET', '/api/tabelas/roles', null, authHeaders);
  logTest('/api/tabelas/roles', 'GET', rolesResult, 'Listar roles');
  
  // Listar status
  const statusResult = await makeRequest('GET', '/api/tabelas/status', null, authHeaders);
  logTest('/api/tabelas/status', 'GET', statusResult, 'Listar status');
  
  // Listar tipos
  const tiposResult = await makeRequest('GET', '/api/tabelas/tipos-acao', null, authHeaders);
  logTest('/api/tabelas/tipos-acao', 'GET', tiposResult, 'Listar tipos de ação');
  
  console.log('\n📊 RELATÓRIO FINAL');
  console.log('='.repeat(50));
  console.log(`📈 Total de testes: ${reportData.totalTests}`);
  console.log(`✅ Testes passaram: ${reportData.passedTests}`);
  console.log(`❌ Testes falharam: ${reportData.failedTests}`);
  console.log(`📊 Taxa de sucesso: ${((reportData.passedTests / reportData.totalTests) * 100).toFixed(1)}%`);
  
  if (reportData.errors.length > 0) {
    console.log('\n🚨 ERROS ENCONTRADOS:');
    reportData.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error.method} ${error.endpoint} - Status: ${error.status}`);
      console.log(`   Erro: ${JSON.stringify(error.error, null, 2)}`);
    });
  }
  
  // Salvar relatório
  fs.writeFileSync('test-report.json', JSON.stringify(reportData, null, 2));
  console.log('\n📝 Relatório salvo em test-report.json');
  
  console.log('\n🎉 Testes concluídos!');
}

// Verificar se o servidor está rodando
async function checkServer() {
  try {
    const response = await axios.get(BASE_URL);
    console.log('✅ Servidor está rodando');
    return true;
  } catch (error) {
    console.log('❌ Servidor não está rodando. Certifique-se de que o backend está ativo na porta 3001');
    return false;
  }
}

// Executar testes
async function main() {
  if (await checkServer()) {
    await runTests();
  }
}

main().catch(console.error);
