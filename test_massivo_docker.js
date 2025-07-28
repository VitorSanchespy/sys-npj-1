const http = require('http');

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
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testeMassivo() {
  console.log('🚀 TESTE MASSIVO - SISTEMA NPJ DOCKER');
  console.log('====================================');
  
  let token = null;
  let totalTestes = 0;
  let testesPassaram = 0;
  
  function logTeste(nome, sucesso, detalhes = '') {
    totalTestes++;
    if (sucesso) {
      testesPassaram++;
      console.log(`✅ ${nome} ${detalhes}`);
    } else {
      console.log(`❌ ${nome} ${detalhes}`);
    }
  }
  
  try {
    // === AUTENTICAÇÃO ===
    console.log('\n🔐 TESTES DE AUTENTICAÇÃO');
    console.log('------------------------');
    
    // Login válido
    const loginResponse = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'teste@backend.docker',
      senha: '123456'
    });
    
    logTeste('Login válido', loginResponse.status === 200 && loginResponse.data.success);
    if (loginResponse.data.success) {
      token = loginResponse.data.token;
    }
    
    // Login inválido
    const loginInvalido = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'teste@backend.docker',
      senha: 'senhaErrada'
    });
    
    logTeste('Login inválido (falha esperada)', loginInvalido.status === 401 || !loginInvalido.data.success);
    
    if (!token) return;
    
    // === USUÁRIOS ===
    console.log('\n👥 TESTES DE USUÁRIOS');
    console.log('--------------------');
    
    // Listar usuários
    const usuarios = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/usuarios',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    logTeste('Listar usuários', usuarios.status === 200, `(${Array.isArray(usuarios.data) ? usuarios.data.length : 0} usuários)`);
    
    // Perfil do usuário
    const perfil = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/usuarios/me',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    logTeste('Obter perfil', perfil.status === 200);
    
    // === PROCESSOS ===
    console.log('\n📁 TESTES DE PROCESSOS');
    console.log('---------------------');
    
    // Listar processos
    const processos = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/processos',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    logTeste('Listar processos', processos.status === 200, `(${Array.isArray(processos.data) ? processos.data.length : 0} processos)`);
    
    // Detalhes de um processo
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
    
    // Criar processo
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
      numero_processo: 'TESTE-' + Date.now(),
      descricao: 'Processo de Teste Massivo',
      status: 'ativo',
      sistema: 'PEA',
      materia_assunto_id: 66,
      fase_id: 59,
      diligencia_id: 40,
      local_tramitacao_id: 2,
      idusuario_responsavel: 350,
      assistido: 'João da Silva Teste',
      contato_assistido: 'joao.teste@email.com',
      observacoes: 'Processo para teste do sistema'
    });
    
    let processoTestId = null;
    if (novoProcesso.status === 201) {
      processoTestId = novoProcesso.data.id;
      logTeste('Criar processo', true, `(ID: ${processoTestId})`);
    } else {
      logTeste('Criar processo', false, `Status: ${novoProcesso.status}`);
    }
    
    // === AGENDAMENTOS ===
    console.log('\n📅 TESTES DE AGENDAMENTOS');
    console.log('------------------------');
    
    // Listar agendamentos
    const agendamentos = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/agendamentos',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    logTeste('Listar agendamentos', agendamentos.status === 200, `(${Array.isArray(agendamentos.data) ? agendamentos.data.length : 0} agendamentos)`);
    
    // Criar agendamento
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
      titulo: 'Audiência de Teste Massivo',
      descricao: 'Agendamento criado durante teste automatizado',
      data_evento: '2025-09-15 14:30:00',
      local: 'NPJ - Sala de Audiências'
    });
    
    let agendamentoTestId = null;
    if (novoAgendamento.status === 201) {
      agendamentoTestId = novoAgendamento.data.id;
      logTeste('Criar agendamento', true, `(ID: ${agendamentoTestId})`);
    } else {
      logTeste('Criar agendamento', false, `Status: ${novoAgendamento.status}`);
    }
    
    // === TABELAS AUXILIARES ===
    console.log('\n📊 TESTES DE TABELAS AUXILIARES');
    console.log('-------------------------------');
    
    // Fases
    const fases = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/aux/fase',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    logTeste('Listar fases', fases.status === 200, `(${Array.isArray(fases.data) ? fases.data.length : 0} fases)`);
    
    // Materias/Assuntos
    const materias = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/aux/materia-assunto',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    logTeste('Listar matérias/assuntos', materias.status === 200, `(${Array.isArray(materias.data) ? materias.data.length : 0} matérias)`);
    
    // Locais de tramitação
    const locais = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/aux/local-tramitacao',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    logTeste('Listar locais de tramitação', locais.status === 200, `(${Array.isArray(locais.data) ? locais.data.length : 0} locais)`);
    
    // === LIMPEZA ===
    console.log('\n🧹 LIMPEZA DOS DADOS DE TESTE');
    console.log('-----------------------------');
    
    // Deletar agendamento criado
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
    
    // Deletar processo criado
    if (processoTestId) {
      const deleteProcesso = await makeRequest({
        hostname: 'localhost',
        port: 3001,
        path: `/api/processos/${processoTestId}`,
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      logTeste('Deletar processo de teste', deleteProcesso.status === 200);
    }
    
  } catch (error) {
    console.log('❌ Erro durante os testes:', error.message);
  }
  
  // === RESULTADO FINAL ===
  console.log('\n🎯 RESULTADO FINAL DO TESTE MASSIVO');
  console.log('===================================');
  console.log(`✅ Testes que passaram: ${testesPassaram}`);
  console.log(`❌ Testes que falharam: ${totalTestes - testesPassaram}`);
  console.log(`📊 Taxa de sucesso: ${Math.round((testesPassaram / totalTestes) * 100)}%`);
  console.log(`🎲 Total de testes: ${totalTestes}`);
  
  if (testesPassaram === totalTestes) {
    console.log('\n🎉 TODOS OS TESTES PASSARAM! SISTEMA 100% FUNCIONAL! 🎉');
  } else if (testesPassaram / totalTestes > 0.9) {
    console.log('\n🟢 SISTEMA PRATICAMENTE COMPLETO! Apenas pequenos ajustes necessários.');
  } else if (testesPassaram / totalTestes > 0.7) {
    console.log('\n🟡 SISTEMA FUNCIONAL, mas precisa de algumas correções.');
  } else {
    console.log('\n🔴 SISTEMA PRECISA DE CORREÇÕES SIGNIFICATIVAS.');
  }
}

testeMassivo();
