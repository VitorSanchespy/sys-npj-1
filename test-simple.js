console.log('🧪 Teste iniciado');

// Simular a função fetch que funciona
const http = require('http');
const querystring = require('querystring');

function makeRequest(hostname, port, path, method, headers, data) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname,
      port,
      path,
      method,
      headers
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
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
  try {
    console.log('🔑 Fazendo login...');
    
    const loginResponse = await makeRequest('localhost', 3001, '/api/auth/login', 'POST', {
      'Content-Type': 'application/json'
    }, {
      email: 'admin@teste.com',
      senha: 'admin123'
    });

    if (loginResponse.status !== 200 || !loginResponse.data.success) {
      console.log('❌ Erro no login:', loginResponse.data);
      return;
    }

    console.log('✅ Login realizado');
    const token = loginResponse.data.token;

    console.log('🔍 Listando agendamentos...');
    const agendamentosResponse = await makeRequest('localhost', 3001, '/api/agendamentos', 'GET', {
      'Authorization': `Bearer ${token}`
    });

    console.log('📅 Status:', agendamentosResponse.status);
    console.log('📅 Resposta:', JSON.stringify(agendamentosResponse.data, null, 2));

    if (agendamentosResponse.data.data && agendamentosResponse.data.data.length > 0) {
      const agendamento = agendamentosResponse.data.data[0];
      console.log('📧 Testando lembrete para agendamento:', agendamento.id);
      
      const lembreteResponse = await makeRequest('localhost', 3001, `/api/agendamentos/${agendamento.id}/lembrete`, 'POST', {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });

      console.log('📧 Status lembrete:', lembreteResponse.status);
      console.log('📧 Resposta lembrete:', JSON.stringify(lembreteResponse.data, null, 2));
    } else {
      console.log('❌ Nenhum agendamento encontrado');
    }

  } catch (error) {
    console.error('💥 Erro:', error.message);
  }
}

testeCompleto();
