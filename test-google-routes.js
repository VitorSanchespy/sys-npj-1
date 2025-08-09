// Teste rápido das rotas do Google Calendar
// Execute: node test-google-routes.js

const axios = require('axios');

async function testarRotasGoogle() {
  console.log('🧪 Testando rotas do Google Calendar...\n');

  // 1. Testar servidor
  try {
    const health = await axios.get('http://localhost:3001');
    console.log('✅ Backend funcionando:', health.data.message);
  } catch (error) {
    console.log('❌ Backend não está rodando');
    return;
  }

  // 2. Testar rota status sem token (deve retornar 401)
  try {
    await axios.get('http://localhost:3001/api/google-calendar/status');
    console.log('❌ Rota status não está protegida');
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log('✅ Rota status protegida corretamente');
    } else {
      console.log('❌ Erro inesperado na rota status:', error.response?.status);
    }
  }

  // 3. Testar rota auth-url sem token (deve retornar 401)
  try {
    await axios.get('http://localhost:3001/api/google-calendar/auth-url');
    console.log('❌ Rota auth-url não está protegida');
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log('✅ Rota auth-url protegida corretamente');
    } else {
      console.log('❌ Erro inesperado na rota auth-url:', error.response?.status);
    }
  }

  console.log('\n🎉 Testes concluídos!');
  console.log('\n📝 Próximos passos:');
  console.log('1. Faça login no frontend (http://localhost:5174)');
  console.log('2. Vá para /agendamentos');
  console.log('3. Teste a conexão com Google Calendar');
}

testarRotasGoogle();
