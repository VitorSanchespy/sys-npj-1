const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testNewRoutes() {
  try {
    console.log('🚀 Testando novas rotas de detalhes do processo...');
    
    // 1. Fazer login para obter token
    console.log('🔐 Fazendo login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'admin@npj.com',
      senha: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Token obtido:', token ? 'Sim' : 'Não');
    
    const headers = { Authorization: `Bearer ${token}` };
    
    // 2. Testar rota de detalhes do processo
    console.log('📋 Testando GET /api/processos/1/detalhes...');
    try {
      const detalhesResponse = await axios.get(`${BASE_URL}/api/processos/1/detalhes`, { headers });
      console.log('✅ Detalhes do processo obtidos:', detalhesResponse.status);
      console.log('📄 Dados:', {
        id: detalhesResponse.data.id,
        numero: detalhesResponse.data.numero_processo || detalhesResponse.data.numero,
        descricao: detalhesResponse.data.descricao?.substring(0, 50) + '...',
        status: detalhesResponse.data.status,
        atualizacoes: detalhesResponse.data.atualizacoes?.length || 0
      });
    } catch (error) {
      console.log('❌ Erro ao obter detalhes:', error.response?.status, error.response?.data);
    }
    
    // 3. Testar rota de usuários do processo
    console.log('👥 Testando GET /api/processos/1/usuarios...');
    try {
      const usuariosResponse = await axios.get(`${BASE_URL}/api/processos/1/usuarios`, { headers });
      console.log('✅ Usuários do processo obtidos:', usuariosResponse.status);
      console.log('👤 Usuários encontrados:', usuariosResponse.data.length);
      if (usuariosResponse.data.length > 0) {
        console.log('👤 Primeiro usuário:', {
          nome: usuariosResponse.data[0].nome,
          email: usuariosResponse.data[0].email,
          role: usuariosResponse.data[0].role
        });
      }
    } catch (error) {
      console.log('❌ Erro ao obter usuários:', error.response?.status, error.response?.data);
    }
    
    console.log('🎉 Testes das novas rotas concluídos!');
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testNewRoutes();
