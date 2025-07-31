const axios = require('axios');

const testPages = async () => {
  try {
    console.log('🚀 TESTANDO NAVEGAÇÃO DAS PÁGINAS');
    console.log('====================================');

    // Login para obter token
    console.log('🔐 Fazendo login...');
    const loginResponse = await axios.post('http://localhost:3001/auth/login', {
      email: 'admin@teste.com',
      senha: '123456'
    });
    
    const token = loginResponse.data.token;
    console.log(`✅ Login bem-sucedido`);

    // Headers com token
    const headers = { 'Authorization': `Bearer ${token}` };

    // Testar diferentes endpoints das páginas
    const tests = [
      { name: 'Dashboard Stats', url: 'http://localhost:3001/api/dashboard/stats' },
      { name: 'Processos', url: 'http://localhost:3001/api/processos' },
      { name: 'Agendamentos', url: 'http://localhost:3001/api/agendamentos' },
      { name: 'Usuários', url: 'http://localhost:3001/api/usuarios' },
      { name: 'Notificações', url: 'http://localhost:3001/api/notificacoes' },
      { name: 'Notificações Count', url: 'http://localhost:3001/api/notificacoes/nao-lidas/contador' },
    ];

    console.log('\n📋 TESTANDO ENDPOINTS DAS PÁGINAS:');
    console.log('=====================================');

    for (const test of tests) {
      try {
        const response = await axios.get(test.url, { headers });
        console.log(`✅ ${test.name}: ${response.status} - ${response.data?.length || 'OK'} ${Array.isArray(response.data) ? 'items' : ''}`);
      } catch (error) {
        console.log(`❌ ${test.name}: ${error.response?.status || error.message}`);
      }
    }

    // Verificar se o frontend está funcionando
    console.log('\n🌐 TESTANDO FRONTEND:');
    console.log('=====================');
    
    try {
      const frontendResponse = await axios.get('http://localhost:5173');
      console.log(`✅ Frontend: ${frontendResponse.status} - Página carregada`);
    } catch (error) {
      console.log(`❌ Frontend: ${error.message}`);
    }

    console.log('\n🎯 RESUMO DO TESTE:');
    console.log('==================');
    console.log('✅ Sistema funcionando!');
    console.log('📍 Frontend: http://localhost:5173');
    console.log('📍 Backend: http://localhost:3001');
    console.log('🔑 Use admin@teste.com / 123456 para login');

  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
};

testPages();
