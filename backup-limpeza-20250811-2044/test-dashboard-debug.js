/**
 * Teste específico do dashboard para identificar erro 500
 */

const axios = require('axios');

async function testDashboard() {
  try {
    // Login
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin@teste.com',
      senha: '123456'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login realizado');
    
    // Testar estatísticas
    try {
      const statsResponse = await axios.get('http://localhost:3001/api/dashboard/estatisticas', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Estatísticas funcionando');
      console.log('Dados:', JSON.stringify(statsResponse.data, null, 2));
    } catch (error) {
      console.log('❌ Erro nas estatísticas:');
      console.log('Status:', error.response?.status);
      console.log('Erro:', error.response?.data);
    }
    
    // Testar exportar
    try {
      const exportResponse = await axios.get('http://localhost:3001/api/dashboard/exportar', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Exportar funcionando');
    } catch (error) {
      console.log('❌ Erro no exportar:');
      console.log('Status:', error.response?.status);
      console.log('Erro:', error.response?.data);
    }
    
    // Testar status detalhado
    try {
      const detailResponse = await axios.get('http://localhost:3001/api/dashboard/status-detalhado', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Status detalhado funcionando');
    } catch (error) {
      console.log('❌ Erro no status detalhado:');
      console.log('Status:', error.response?.status);
      console.log('Erro:', error.response?.data);
    }
    
  } catch (loginError) {
    console.log('❌ Erro no login:', loginError.message);
  }
}

testDashboard().catch(console.error);
