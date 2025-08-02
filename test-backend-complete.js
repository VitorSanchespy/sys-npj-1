#!/usr/bin/env node

const axios = require('axios');

console.log('🚀 TESTE COMPLETO DOS ENDPOINTS - BACKEND NPJ');
console.log('==============================================\n');

const BASE_URL = 'http://localhost:3001';
let authToken = null;

// Função helper para fazer requisições
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

// Função para fazer login e obter token
async function login() {
  console.log('🔐 Testando login...');
  
  const result = await makeRequest('POST', '/auth/login', {
    email: 'admin@teste.com',
    senha: 'admin123'
  });
  
  if (result.success && result.data.token) {
    authToken = result.data.token;
    console.log('✅ Login bem-sucedido');
    return true;
  } else {
    console.log('❌ Falha no login:', result.error);
    return false;
  }
}

// Função para testar endpoints autenticados
async function testAuthenticatedEndpoint(method, endpoint, data = null, description = '') {
  if (!authToken) {
    console.log(`❌ ${description} - Sem token de autenticação`);
    return false;
  }
  
  const result = await makeRequest(method, endpoint, data, {
    'Authorization': `Bearer ${authToken}`
  });
  
  if (result.success) {
    console.log(`✅ ${description} - Status: ${result.status}`);
    return true;
  } else {
    console.log(`❌ ${description} - Erro: ${result.error} - Status: ${result.status}`);
    return false;
  }
}

// Função principal de teste
async function runAllTests() {
  let successCount = 0;
  let totalTests = 0;
  
  // Teste 1: Servidor funcionando
  console.log('📡 Testando conectividade do servidor...');
  totalTests++;
  const serverTest = await makeRequest('GET', '/test');
  if (serverTest.success) {
    console.log('✅ Servidor online');
    successCount++;
  } else {
    console.log('❌ Servidor offline:', serverTest.error);
  }
  
  // Teste 2: Login
  totalTests++;
  if (await login()) {
    successCount++;
  }
  
  if (!authToken) {
    console.log('\n❌ Não foi possível fazer login. Parando testes autenticados.');
    return;
  }
  
  console.log('\n🔒 Testando endpoints autenticados...\n');
  
  // Testes de Usuários
  console.log('👥 USUÁRIOS:');
  totalTests++; await testAuthenticatedEndpoint('GET', '/api/usuarios', null, 'Listar usuários') && successCount++;
  totalTests++; await testAuthenticatedEndpoint('GET', '/auth/perfil', null, 'Perfil do usuário') && successCount++;
  
  // Testes de Processos
  console.log('\n📋 PROCESSOS:');
  totalTests++; await testAuthenticatedEndpoint('GET', '/api/processos', null, 'Listar processos') && successCount++;
  totalTests++; await testAuthenticatedEndpoint('GET', '/api/processos/usuario', null, 'Processos do usuário') && successCount++;
  
  // Testes de Agendamentos
  console.log('\n📅 AGENDAMENTOS:');
  totalTests++; await testAuthenticatedEndpoint('GET', '/api/agendamentos', null, 'Listar agendamentos') && successCount++;
  totalTests++; await testAuthenticatedEndpoint('GET', '/api/agendamentos/usuario', null, 'Agendamentos do usuário') && successCount++;
  
  // Testes de Notificações
  console.log('\n🔔 NOTIFICAÇÕES:');
  totalTests++; await testAuthenticatedEndpoint('GET', '/api/notificacoes', null, 'Listar notificações') && successCount++;
  totalTests++; await testAuthenticatedEndpoint('GET', '/api/notificacoes/usuario', null, 'Notificações do usuário') && successCount++;
  totalTests++; await testAuthenticatedEndpoint('GET', '/api/notificacoes/nao-lidas/count', null, 'Contador não lidas') && successCount++;
  
  // Testes de Atualizações
  console.log('\n📝 ATUALIZAÇÕES:');
  totalTests++; await testAuthenticatedEndpoint('GET', '/api/atualizacoes', null, 'Listar atualizações') && successCount++;
  
  // Testes de Arquivos
  console.log('\n📎 ARQUIVOS:');
  totalTests++; await testAuthenticatedEndpoint('GET', '/api/arquivos', null, 'Listar arquivos') && successCount++;
  
  // Testes de Tabelas Auxiliares
  console.log('\n🗂️ TABELAS AUXILIARES:');
  totalTests++; await testAuthenticatedEndpoint('GET', '/api/tabelas/todas', null, 'Todas as opções') && successCount++;
  totalTests++; await testAuthenticatedEndpoint('GET', '/api/tabelas/roles', null, 'Roles') && successCount++;
  totalTests++; await testAuthenticatedEndpoint('GET', '/api/tabelas/tipos-acao', null, 'Tipos de ação') && successCount++;
  totalTests++; await testAuthenticatedEndpoint('GET', '/api/tabelas/status', null, 'Status de processo') && successCount++;
  totalTests++; await testAuthenticatedEndpoint('GET', '/api/tabelas/prioridades', null, 'Prioridades') && successCount++;
  totalTests++; await testAuthenticatedEndpoint('GET', '/api/tabelas/comarcas', null, 'Comarcas') && successCount++;
  totalTests++; await testAuthenticatedEndpoint('GET', '/api/tabelas/varas', null, 'Varas') && successCount++;
  
  // Teste de criação (POST)
  console.log('\n➕ TESTES DE CRIAÇÃO:');
  totalTests++; await testAuthenticatedEndpoint('POST', '/api/agendamentos', {
    titulo: 'Teste Agendamento',
    descricao: 'Agendamento de teste via API',
    data_agendamento: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    hora_inicio: '14:00',
    hora_fim: '15:00',
    local: 'Teste'
  }, 'Criar agendamento') && successCount++;
  
  totalTests++; await testAuthenticatedEndpoint('POST', '/api/notificacoes', {
    titulo: 'Notificação Teste',
    mensagem: 'Esta é uma notificação de teste',
    tipo: 'info',
    idusuario: 1
  }, 'Criar notificação') && successCount++;
  
  // Relatório final
  console.log('\n📊 RELATÓRIO FINAL');
  console.log('==================');
  console.log(`✅ Sucessos: ${successCount}`);
  console.log(`❌ Falhas: ${totalTests - successCount}`);
  console.log(`📊 Total: ${totalTests}`);
  console.log(`🎯 Taxa de sucesso: ${Math.round((successCount / totalTests) * 100)}%`);
  
  if (successCount === totalTests) {
    console.log('\n🎉 TODOS OS TESTES PASSARAM! Backend 100% funcional!');
  } else {
    console.log(`\n⚠️ ${totalTests - successCount} teste(s) falharam. Verifique os endpoints com problema.`);
  }
}

// Executar testes
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('❌ Erro durante os testes:', error);
    process.exit(1);
  });
}

module.exports = { runAllTests };
