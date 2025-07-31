const axios = require('axios');

async function testarRotaNotificacoes() {
  try {
    console.log('🧪 Testando rota de notificações...');
    
    // Login
    const loginResponse = await axios.post('http://localhost:3001/auth/login', {
      email: 'teste@teste.com',
      senha: '123456'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login realizado');

    // Testar rota de notificações
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    const notificacoesResponse = await axios.get(
      'http://localhost:3001/api/notificacoes',
      { headers }
    );

    console.log('✅ Rota de notificações funcionando!');
    console.log(`📧 ${notificacoesResponse.data.length} notificações encontradas:`);
    
    notificacoesResponse.data.forEach((notif, index) => {
      console.log(`   ${index + 1}. ${notif.titulo} (${notif.tipo}) - Status: ${notif.status}`);
      console.log(`      "${notif.mensagem}"`);
    });

  } catch (error) {
    if (error.response) {
      console.error('❌ Erro na resposta:', error.response.status, error.response.data);
    } else {
      console.error('❌ Erro:', error.message);
    }
  }
}

testarRotaNotificacoes();
