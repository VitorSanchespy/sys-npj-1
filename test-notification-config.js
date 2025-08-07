const https = require('https');
const http = require('http');

const BASE_URL = 'http://localhost:3001';

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const module = urlObj.protocol === 'https:' ? https : http;
    
    const req = module.request(url, {
      method: options.method || 'GET',
      headers: options.headers || {}
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, data: parsed, text: data });
        } catch (e) {
          resolve({ status: res.statusCode, data: null, text: data });
        }
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function testNotificationConfig() {
  console.log('🔔 Testando endpoints de configuração de notificações...\n');

  try {
    // Primeiro fazer login para obter token
    console.log('🔐 Fazendo login...');
    const loginResponse = await makeRequest(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@teste.com',
        senha: 'admin123'
      })
    });

    if (loginResponse.status !== 200) {
      throw new Error(`Login falhou: ${loginResponse.status}`);
    }

    const token = loginResponse.data.token;
    console.log('✅ Login realizado com sucesso');

    // Testar GET configurações
    console.log('\n📋 Testando GET /api/notificacoes/configuracoes');
    const getResponse = await makeRequest(`${BASE_URL}/api/notificacoes/configuracoes`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log(`Status: ${getResponse.status}`);
    
    if (getResponse.status !== 200) {
      console.log('❌ Erro:', getResponse.text);
    } else {
      console.log('✅ Configurações obtidas:', JSON.stringify(getResponse.data, null, 2));
    }

    // Testar PUT configurações
    console.log('\n📝 Testando PUT /api/notificacoes/configuracoes');
    const putResponse = await makeRequest(`${BASE_URL}/api/notificacoes/configuracoes`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email_lembretes: false,
        sistema_alertas: false
      })
    });

    console.log(`Status: ${putResponse.status}`);
    
    if (putResponse.status !== 200) {
      console.log('❌ Erro:', putResponse.text);
    } else {
      console.log('✅ Configurações atualizadas:', JSON.stringify(putResponse.data, null, 2));
    }

  } catch (error) {
    console.error('❌ Erro durante teste:', error.message);
  }
}

testNotificationConfig();
