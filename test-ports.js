const axios = require('axios');

async function testFrontendBackendConnection() {
  try {
    console.log('🌐 Testando conexão Frontend -> Backend...');
    
    // Teste 1: Verificar se o backend está respondendo diretamente
    console.log('\n📡 Teste 1: Backend direto (porta 3001)');
    try {
      const backendResponse = await axios.get('http://localhost:3001/api/health');
      console.log('✅ Backend responde diretamente:', backendResponse.status);
    } catch (error) {
      console.log('⚠️ Backend não tem endpoint /health, testando login...');
      try {
        const loginResponse = await axios.post('http://localhost:3001/auth/login', {
          email: 'admin@npj.com',
          senha: 'admin123'
        });
        console.log('✅ Backend responde ao login:', loginResponse.status);
      } catch (loginError) {
        console.log('❌ Erro no backend:', loginError.message);
      }
    }
    
    // Teste 2: Verificar se o frontend está servindo
    console.log('\n🖥️ Teste 2: Frontend (porta 5173)');
    try {
      const frontendResponse = await axios.get('http://localhost:5173/', {
        timeout: 5000
      });
      console.log('✅ Frontend acessível:', frontendResponse.status);
    } catch (error) {
      console.log('❌ Erro no frontend:', error.message);
    }
    
    // Teste 3: Verificar proxy do Vite (frontend -> backend)
    console.log('\n🔄 Teste 3: Proxy Vite (frontend:5173/api -> backend:3001)');
    try {
      const proxyResponse = await axios.post('http://localhost:5173/api/auth/login', {
        email: 'admin@npj.com',
        senha: 'admin123'
      });
      console.log('✅ Proxy funcionando:', proxyResponse.status);
    } catch (error) {
      console.log('❌ Erro no proxy:', error.response?.status || error.message);
    }
    
    console.log('\n🎉 Configuração de portas verificada!');
    console.log('📍 Frontend: http://localhost:5173/');
    console.log('📍 Backend: http://localhost:3001/');
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testFrontendBackendConnection();
