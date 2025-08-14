const axios = require('axios');

async function testSearch() {
  try {
    console.log('🔍 Testando funcionalidade de busca...');
    
    // Primeiro, vamos fazer login com admin@npj.com
    const loginResponse = await axios.post('http://localhost:3001/auth/login', {
      email: 'admin@npj.com',
      senha: 'admin123'
    });
    
    if (!loginResponse.data.token) {
      console.log('❌ Falha no login');
      return;
    }
    
    const token = loginResponse.data.token;
    console.log('✅ Login realizado com sucesso');
    
    // Teste 1: Busca sem parâmetros
    console.log('\n📋 Teste 1: Listagem sem busca');
    const listResponse = await axios.get('http://localhost:3001/api/agendamentos-global?page=1&limit=5', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Total de agendamentos:', listResponse.data.data?.pagination?.total || 0);
    
    // Teste 2: Busca com termo "teste"
    console.log('\n🔍 Teste 2: Busca por "teste"');
    const searchResponse = await axios.get('http://localhost:3001/api/agendamentos-global?search=teste&page=1&limit=10', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('📊 Resultado da busca por "teste":', {
      success: searchResponse.data.success,
      totalResults: searchResponse.data.data?.pagination?.total || 0,
      foundAgendamentos: searchResponse.data.data?.agendamentos?.length || 0
    });
    
    // Teste 3: Busca com termo "audiência"
    console.log('\n🔍 Teste 3: Busca por "audiência"');
    const searchResponse2 = await axios.get('http://localhost:3001/api/agendamentos-global?search=audiência&page=1&limit=10', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('� Resultado da busca por "audiência":', {
      success: searchResponse2.data.success,
      totalResults: searchResponse2.data.data?.pagination?.total || 0,
      foundAgendamentos: searchResponse2.data.data?.agendamentos?.length || 0
    });
    
    console.log('\n✅ Teste de busca concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
  }
}

testSearch();
