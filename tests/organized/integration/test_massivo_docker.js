/**
 * @fileoverview Teste Completo e Massivo do Sistema NPJ Docker
 * @description Executa todos os testes de integração do sistema NPJ
 * @author Sistema NPJ
 * @version 2.0.0
 * @since 2025-07-28
 */

const http = require('http');

/**
 * Configurações principais do sistema
 */
const CONFIG = {
  API_URL: 'http://localhost:3001',
  TIMEOUT: 10000,
  USER_TEST: {
    email: 'teste@backend.docker',
    senha: '123456'
  }
};

/**
 * Utilitário para fazer requisições HTTP simples
 * @param {Object} options - Opções da requisição (hostname, port, path, method, headers)
 * @param {Object|null} data - Dados para enviar no body (POST/PUT)
 * @returns {Promise<Object>} Resposta da requisição com status e data
 */
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(body)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: body
          });
        }
      });
    });
    
    req.on('error', reject);
    req.setTimeout(CONFIG.TIMEOUT, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

/**
 * Registra resultado de um teste individual
 * @param {string} nome - Nome do teste
 * @param {boolean} sucesso - Se o teste passou ou falhou
 * @param {string} detalhes - Detalhes adicionais do resultado
 */
function logTeste(nome, sucesso, detalhes = '') {
  testStats.total++;
  if (sucesso) {
    testStats.passed++;
    console.log(`✅ ${nome} ${detalhes}`);
  } else {
    testStats.failed++;
    console.log(`❌ ${nome} ${detalhes}`);
  }
}

/**
 * Estatísticas dos testes
 */
const testStats = {
  total: 0,
  passed: 0,
  failed: 0
};

/**
 * Executa todos os testes do sistema NPJ
 * @returns {Promise<void>}
 */
async function testeMassivo() {
  console.log('🚀 TESTE MASSIVO - SISTEMA NPJ DOCKER v2.0');
  console.log('==========================================');
  console.log(`API: ${CONFIG.API_URL}`);
  console.log(`Timeout: ${CONFIG.TIMEOUT}ms`);
  console.log('');

  let token = null;

  try {
    // ============================================================================
    // SEÇÃO 1: TESTES DE AUTENTICAÇÃO
    // ============================================================================
    console.log('🔐 TESTES DE AUTENTICAÇÃO');
    console.log('------------------------');
    
    // Teste 1.1: Login válido
    const loginResponse = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, CONFIG.USER_TEST);
    
    const loginSuccess = loginResponse.status === 200 && loginResponse.data.success;
    logTeste('Login válido', loginSuccess);
    
    if (loginSuccess) {
      token = loginResponse.data.token;
    } else {
      console.log('❌ Não foi possível obter token. Encerrando testes.');
      return;
    }
    
    // Teste 1.2: Login inválido (deve falhar)
    const loginInvalido = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: CONFIG.USER_TEST.email,
      senha: 'senhaErrada'
    });
    
    logTeste('Login inválido (falha esperada)', 
      loginInvalido.status === 401 || !loginInvalido.data.success);
    // ============================================================================
    // SEÇÃO 2: TESTES DE USUÁRIOS
    // ============================================================================
    console.log('\n👥 TESTES DE USUÁRIOS');
    console.log('--------------------');
    
    // Teste 2.1: Listar usuários
    const usuarios = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/usuarios',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    logTeste('Listar usuários', usuarios.status === 200, 
      `(${Array.isArray(usuarios.data) ? usuarios.data.length : 0} usuários)`);
    
    // Teste 2.2: Obter perfil do usuário logado
    const perfil = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/usuarios/me',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    logTeste('Obter perfil', perfil.status === 200);
    // ============================================================================
    // SEÇÃO 3: TESTES DE PROCESSOS
    // ============================================================================
    console.log('\n📁 TESTES DE PROCESSOS');
    console.log('---------------------');
    
    // Teste 3.1: Listar processos
    const processos = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/processos',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    logTeste('Listar processos', processos.status === 200, 
      `(${Array.isArray(processos.data) ? processos.data.length : 0} processos)`);
    
    // Teste 3.2: Detalhes de processo (se houver processos)
    if (processos.data && processos.data.length > 0) {
      const processoId = processos.data[0].id;
      const detalhesProcesso = await makeRequest({
        hostname: 'localhost',
        port: 3001,
        path: `/api/processos/${processoId}/detalhes`,
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      logTeste('Detalhes do processo', detalhesProcesso.status === 200);
    }
    
    // Teste 3.3: Criar novo processo
    const novoProcesso = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/processos/novo',
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      }
    }, {
      numero_processo: `TESTE-${Date.now()}`,
      descricao: 'Processo de Teste Automatizado',
      status: 'ativo',
      sistema: 'PEA',
      materia_assunto_id: 66,
      fase_id: 59,
      diligencia_id: 40,
      local_tramitacao_id: 2,
      idusuario_responsavel: 350,
      assistido: 'Cliente Teste Automatizado',
      contato_assistido: 'teste.automatizado@email.com',
      observacoes: 'Processo criado durante teste automatizado'
    });
    
    let processoTestId = null;
    if (novoProcesso.status === 201) {
      processoTestId = novoProcesso.data.id;
      logTeste('Criar processo', true, `(ID: ${processoTestId})`);
    } else {
      logTeste('Criar processo', false, `Status: ${novoProcesso.status}`);
    }
    // ============================================================================
    // SEÇÃO 4: TESTES DE AGENDAMENTOS
    // ============================================================================
    console.log('\n📅 TESTES DE AGENDAMENTOS');
    console.log('------------------------');
    
    // Teste 4.1: Listar agendamentos
    const agendamentos = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/agendamentos',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    logTeste('Listar agendamentos', agendamentos.status === 200, 
      `(${Array.isArray(agendamentos.data) ? agendamentos.data.length : 0} agendamentos)`);
    
    // Teste 4.2: Criar novo agendamento
    const processoParaAgendamento = processoTestId || 20;
    const novoAgendamento = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/agendamentos',
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      }
    }, {
      processo_id: processoParaAgendamento,
      tipo_evento: 'audiencia',
      titulo: 'Teste Automatizado - Audiência',
      descricao: 'Agendamento criado durante teste automatizado do sistema',
      data_evento: '2025-09-15 14:30:00',
      local: 'NPJ - Sala de Audiências - Teste'
    });
    
    let agendamentoTestId = null;
    if (novoAgendamento.status === 201) {
      agendamentoTestId = novoAgendamento.data.id;
      logTeste('Criar agendamento', true, `(ID: ${agendamentoTestId})`);
    } else {
      logTeste('Criar agendamento', false, `Status: ${novoAgendamento.status}`);
    }

    // ============================================================================
    // SEÇÃO 5: TESTES DE TABELAS AUXILIARES
    // ============================================================================
    console.log('\n📊 TESTES DE TABELAS AUXILIARES');
    console.log('-------------------------------');
    
    // Teste 5.1: Listar fases
    const fases = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/aux/fase',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    logTeste('Listar fases', fases.status === 200, 
      `(${Array.isArray(fases.data) ? fases.data.length : 0} fases)`);
    
    // Teste 5.2: Listar matérias/assuntos
    const materias = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/aux/materia-assunto',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    logTeste('Listar matérias/assuntos', materias.status === 200, 
      `(${Array.isArray(materias.data) ? materias.data.length : 0} matérias)`);
    
    // Teste 5.3: Listar locais de tramitação
    const locais = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/aux/local-tramitacao',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    logTeste('Listar locais de tramitação', locais.status === 200, 
      `(${Array.isArray(locais.data) ? locais.data.length : 0} locais)`);
    // ============================================================================
    // SEÇÃO 6: LIMPEZA DOS DADOS DE TESTE
    // ============================================================================
    console.log('\n🧹 LIMPEZA DOS DADOS DE TESTE');
    console.log('-----------------------------');
    
    // Limpeza 6.1: Deletar agendamento criado
    if (agendamentoTestId) {
      const deleteAgendamento = await makeRequest({
        hostname: 'localhost',
        port: 3001,
        path: `/api/agendamentos/${agendamentoTestId}`,
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      logTeste('Deletar agendamento de teste', deleteAgendamento.status === 200);
    }
    
    // Limpeza 6.2: Processo criado (só referência - sem endpoint de exclusão)
    if (processoTestId) {
      console.log(`📝 Processo de teste criado com ID ${processoTestId} (limpeza manual necessária)`);
      logTeste('Processo de teste criado (sem exclusão automática)', true, `ID: ${processoTestId}`);
    }
    
  } catch (error) {
    console.log('❌ Erro crítico durante os testes:', error.message);
    testStats.failed++;
  }

  // ============================================================================
  // RESULTADO FINAL
  // ============================================================================
  console.log('\n🎯 RESULTADO FINAL DO TESTE MASSIVO');
  console.log('===================================');
  console.log(`✅ Testes que passaram: ${testStats.passed}`);
  console.log(`❌ Testes que falharam: ${testStats.failed}`);
  console.log(`📊 Taxa de sucesso: ${Math.round((testStats.passed / testStats.total) * 100)}%`);
  console.log(`🎲 Total de testes: ${testStats.total}`);
  
  // Mensagem final baseada na taxa de sucesso
  const successRate = testStats.passed / testStats.total;
  if (testStats.passed === testStats.total) {
    console.log('\n🎉 TODOS OS TESTES PASSARAM! SISTEMA 100% FUNCIONAL! 🎉');
  } else if (successRate > 0.9) {
    console.log('\n🟢 SISTEMA PRATICAMENTE COMPLETO! Apenas pequenos ajustes necessários.');
  } else if (successRate > 0.7) {
    console.log('\n🟡 SISTEMA FUNCIONAL, mas precisa de algumas correções.');
  } else {
    console.log('\n🔴 SISTEMA PRECISA DE CORREÇÕES SIGNIFICATIVAS.');
  }
  
  console.log(`\n📅 Teste executado em: ${new Date().toLocaleString('pt-BR')}`);
  console.log('📍 Localização: tests/organized/integration/test_massivo_docker.js');
}

// Executar o teste se for chamado diretamente
if (require.main === module) {
  testeMassivo().catch(console.error);
}

module.exports = { testeMassivo, makeRequest, CONFIG };
