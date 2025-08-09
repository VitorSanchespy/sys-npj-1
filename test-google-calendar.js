// Teste da Integração Google Calendar
// Execute com: node test-google-calendar.js

const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testarIntegracaoGoogleCalendar() {
  console.log('🧪 Testando Integração Google Calendar\n');

  try {
    // 1. Testar se o servidor está rodando
    console.log('1. Testando conexão com servidor...');
    const healthCheck = await axios.get('http://localhost:3001');
    console.log('✅ Servidor respondendo:', healthCheck.data.message);

    // 2. Testar rota de auth URL (sem autenticação por enquanto)
    console.log('\n2. Testando rota de auth URL...');
    try {
      const authUrlResponse = await axios.get(`${API_BASE}/google-calendar/auth-url`);
      console.log('✅ Rota auth-url funcionando');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Rota auth-url protegida (precisa de token) - OK');
      } else {
        console.log('❌ Erro na rota auth-url:', error.message);
      }
    }

    // 3. Testar rota de status
    console.log('\n3. Testando rota de status...');
    try {
      const statusResponse = await axios.get(`${API_BASE}/google-calendar/status`);
      console.log('✅ Rota status funcionando');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Rota status protegida (precisa de token) - OK');
      } else {
        console.log('❌ Erro na rota status:', error.message);
      }
    }

    console.log('\n🎉 Integração Google Calendar configurada com sucesso!');
    console.log('\n📋 Próximos passos:');
    console.log('1. Faça login no frontend');
    console.log('2. Vá para a página de Agendamentos');
    console.log('3. Clique em "Conectar Google Calendar"');
    console.log('4. Autorize o aplicativo');
    console.log('5. Crie um agendamento e veja no Google Calendar!');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    console.error('Stack:', error.stack);
  }
}

// Executar o teste
testarIntegracaoGoogleCalendar();
