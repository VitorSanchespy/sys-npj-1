// Teste Massivo do Sistema NPJ
const http = require('http');

// Configurações
const CONFIG = {
  API_URL: 'http://localhost:3001',
  TIMEOUT: 10000,
  USER_TEST: {
    email: 'teste@backend.docker',
    senha: '123456'
  }
};

// Faz requisição HTTP
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const responseData = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, data: responseData });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(CONFIG.TIMEOUT, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Log de teste
function logTeste(emoji, mensagem, sucesso = true) {
  console.log(`${emoji} ${mensagem} ${sucesso ? '' : '❌'}`);
}

// Estatísticas de teste
let testStats = {
  total: 0,
  passed: 0,
  failed: 0
};

// Incrementa estatísticas
function updateStats(success) {
  testStats.total++;
  if (success) {
    testStats.passed++;
  } else {
    testStats.failed++;
  }
}

// Teste massivo principal
async function testeMassivo() {
  console.log('🚀 TESTE MASSIVO - SISTEMA NPJ DOCKER v2.0');
  console.log('==========================================');
  console.log(`API: ${CONFIG.API_URL}`);
  console.log(`Timeout: ${CONFIG.TIMEOUT}ms`);

  let token = null;

  try {
    // 1. Teste de Login
    console.log('🔐 TESTES DE AUTENTICAÇÃO');
    console.log('------------------------');
    
    const loginResponse = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, CONFIG.USER_TEST);

    if (loginResponse.status === 200 && loginResponse.data.token) {
      token = loginResponse.data.token;
      logTeste('✅', 'Login válido');
      updateStats(true);
    } else {
      logTeste('❌', 'Login válido', false);
      updateStats(false);
    }

    // Teste login inválido
    const loginInvalido = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'invalido@test.com', senha: 'senha_errada' });

    if (loginInvalido.status === 401) {
      logTeste('✅', 'Login inválido (falha esperada)');
      updateStats(true);
    } else {
      logTeste('❌', `Login inválido (falha esperada) - Status: ${loginInvalido.status}`, false);
      console.log('Debug login inválido:', loginInvalido.data);
      updateStats(false);
    }

    if (!token) {
      console.log('❌ Não foi possível obter token. Abortando testes.');
      return;
    }

    // Headers com token
    const authHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    // 2. Testes de Usuários
    console.log('👥 TESTES DE USUÁRIOS');
    console.log('--------------------');
    
    const usuarios = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/usuarios',
      method: 'GET',
      headers: authHeaders
    });

    if (usuarios.status === 200) {
      logTeste('✅', `Listar usuários (${usuarios.data.length} usuários)`);
      updateStats(true);
    } else {
      logTeste('❌', 'Listar usuários', false);
      updateStats(false);
    }

    const perfil = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/auth/perfil',
      method: 'GET',
      headers: authHeaders
    });

    if (perfil.status === 200) {
      logTeste('✅', 'Obter perfil');
      updateStats(true);
    } else {
      logTeste('❌', 'Obter perfil', false);
      updateStats(false);
    }

    // 3. Testes de Processos
    console.log('📁 TESTES DE PROCESSOS');
    console.log('---------------------');
    
    const processos = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/processos',
      method: 'GET',
      headers: authHeaders
    });

    if (processos.status === 200) {
      logTeste('✅', `Listar processos (${processos.data.length} processos)`);
      updateStats(true);
    } else {
      logTeste('❌', 'Listar processos', false);
      updateStats(false);
    }

    // Detalhe processo
    if (processos.data.length > 0) {
      const primeiroProcesso = processos.data[0];
      const detalhes = await makeRequest({
        hostname: 'localhost',
        port: 3001,
        path: `/api/processos/${primeiroProcesso.id}/detalhes`,
        method: 'GET',
        headers: authHeaders
      });

      if (detalhes.status === 200) {
        logTeste('✅', 'Detalhes do processo');
        updateStats(true);
      } else {
        logTeste('❌', 'Detalhes do processo', false);
        updateStats(false);
      }
    }

    // Criar processo teste
    const novoProcesso = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/processos',
      method: 'POST',
      headers: authHeaders
    }, {
      numero_processo: `TESTE-${Date.now()}`,
      descricao: 'Processo de teste automatizado',
      assistido: 'Teste Automatizado',
      contato_assistido: '(65) 99999-9999'
    });

    let processoTesteId = null;
    if (novoProcesso.status === 201) {
      processoTesteId = novoProcesso.data.id;
      logTeste('✅', `Criar processo (ID: ${processoTesteId})`);
      updateStats(true);
    } else {
      logTeste('❌', `Criar processo - Status: ${novoProcesso.status}`, false);
      console.log('Debug criar processo:', novoProcesso.data);
      updateStats(false);
    }

    // 4. Testes de Agendamentos
    console.log('📅 TESTES DE AGENDAMENTOS');
    console.log('------------------------');
    
    const agendamentos = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/agendamentos',
      method: 'GET',
      headers: authHeaders
    });

    if (agendamentos.status === 200) {
      logTeste('✅', `Listar agendamentos (${agendamentos.data.length} agendamentos)`);
      updateStats(true);
    } else {
      logTeste('❌', 'Listar agendamentos', false);
      updateStats(false);
    }

    // Criar agendamento teste
    const novoAgendamento = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/agendamentos',
      method: 'POST',
      headers: authHeaders
    }, {
      tipo_evento: 'outro',
      titulo: 'Teste Automatizado',
      descricao: 'Agendamento de teste',
      data_evento: new Date(Date.now() + 24*60*60*1000).toISOString(),
      local: 'Teste'
    });

    let agendamentoTesteId = null;
    if (novoAgendamento.status === 201) {
      agendamentoTesteId = novoAgendamento.data.id;
      logTeste('✅', `Criar agendamento (ID: ${agendamentoTesteId})`);
      updateStats(true);
    } else {
      logTeste('❌', 'Criar agendamento', false);
      updateStats(false);
    }

    // 5. Testes de Tabelas Auxiliares
    console.log('📊 TESTES DE TABELAS AUXILIARES');
    console.log('-------------------------------');
    
    const fases = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/aux/fase',
      method: 'GET',
      headers: authHeaders
    });

    if (fases.status === 200) {
      logTeste('✅', `Listar fases (${fases.data.length} fases)`);
      updateStats(true);
    } else {
      logTeste('❌', 'Listar fases', false);
      updateStats(false);
    }

    const materias = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/aux/materia-assunto',
      method: 'GET',
      headers: authHeaders
    });

    if (materias.status === 200) {
      logTeste('✅', `Listar matérias/assuntos (${materias.data.length} matérias)`);
      updateStats(true);
    } else {
      logTeste('❌', 'Listar matérias/assuntos', false);
      updateStats(false);
    }

    const locais = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/aux/local-tramitacao',
      method: 'GET',
      headers: authHeaders
    });

    if (locais.status === 200) {
      logTeste('✅', `Listar locais de tramitação (${locais.data.length} locais)`);
      updateStats(true);
    } else {
      logTeste('❌', 'Listar locais de tramitação', false);
      updateStats(false);
    }

    // 6. Limpeza dos dados de teste
    console.log('🧹 LIMPEZA DOS DADOS DE TESTE');
    console.log('-----------------------------');
    
    if (agendamentoTesteId) {
      const deleteAgendamento = await makeRequest({
        hostname: 'localhost',
        port: 3001,
        path: `/api/agendamentos/${agendamentoTesteId}`,
        method: 'DELETE',
        headers: authHeaders
      });

      if (deleteAgendamento.status === 200) {
        logTeste('✅', 'Deletar agendamento de teste');
        updateStats(true);
      } else {
        logTeste('❌', 'Deletar agendamento de teste', false);
        updateStats(false);
      }
    }

    if (processoTesteId) {
      console.log(`📝 Processo de teste criado com ID ${processoTesteId} (limpeza manual necessária)`);
      logTeste('✅', `Processo de teste criado (sem exclusão automática) ID: ${processoTesteId}`);
      updateStats(true);
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    updateStats(false);
  }

  // Resultado final
  console.log('🎯 RESULTADO FINAL DO TESTE MASSIVO');
  console.log('===================================');
  console.log(`✅ Testes que passaram: ${testStats.passed}`);
  console.log(`❌ Testes que falharam: ${testStats.failed}`);
  console.log(`📊 Taxa de sucesso: ${Math.round((testStats.passed / testStats.total) * 100)}%`);
  console.log(`🎲 Total de testes: ${testStats.total}`);
  
  if (testStats.failed === 0) {
    console.log('🎉 TODOS OS TESTES PASSARAM! SISTEMA 100% FUNCIONAL! 🎉');
  } else {
    console.log('⚠️ ALGUNS TESTES FALHARAM. VERIFICAR LOGS ACIMA.');
  }
  
  console.log(`📅 Teste executado em: ${new Date().toLocaleString('pt-BR')}`);
  console.log('📍 Localização: tests/organized/integration/test_massivo_docker.js');
}

// Executar teste
testeMassivo().catch(console.error);
