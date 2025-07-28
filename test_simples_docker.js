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

async function testeCompleto() {
  console.log('🧪 TESTE BACKEND DOCKER - COMPLETO');
  console.log('==================================');
  
  let token = null;
  
  try {
    // 1. LOGIN
    console.log('1️⃣ TESTE DE LOGIN');
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
    
    if (loginResponse.status === 200 && loginResponse.data.success) {
      token = loginResponse.data.token;
      console.log('✅ Login bem-sucedido');
    } else {
      console.log('❌ Falha no login:', loginResponse.data);
      return;
    }
    
    // 2. LISTAGEM DE AGENDAMENTOS
    console.log('\n2️⃣ TESTE DE LISTAGEM DE AGENDAMENTOS');
    const listResponse = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/agendamentos',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (listResponse.status === 200) {
      console.log(`✅ Listagem OK - ${Array.isArray(listResponse.data) ? listResponse.data.length : 0} agendamentos`);
    } else {
      console.log('❌ Falha na listagem:', listResponse.data);
    }
    
    // 3. CRIAÇÃO DE AGENDAMENTO
    console.log('\n3️⃣ TESTE DE CRIAÇÃO DE AGENDAMENTO');
    const createResponse = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/agendamentos',
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      }
    }, {
      processo_id: 20,
      tipo_evento: 'reuniao',
      titulo: 'Teste Agendamento Docker',
      descricao: 'Teste automatizado no container',
      data_evento: '2025-08-25 10:00:00',
      local: 'NPJ - Sala de Testes'
    });
    
    if (createResponse.status === 201) {
      console.log('✅ Agendamento criado:', createResponse.data.titulo);
      
      // 4. EXCLUSÃO DO AGENDAMENTO
      console.log('\n4️⃣ TESTE DE EXCLUSÃO DE AGENDAMENTO');
      const deleteResponse = await makeRequest({
        hostname: 'localhost',
        port: 3001,
        path: `/api/agendamentos/${createResponse.data.id}`,
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (deleteResponse.status === 200) {
        console.log('✅ Agendamento deletado com sucesso');
      } else {
        console.log('❌ Falha na exclusão:', deleteResponse.data);
      }
    } else {
      console.log('❌ Falha na criação:', createResponse.data);
    }
    
    console.log('\n🎯 TESTE CONCLUÍDO');
    
  } catch (error) {
    console.log('❌ Erro geral:', error.message);
  }
}

testeCompleto();
