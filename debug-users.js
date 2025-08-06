const axios = require('axios');

async function listUsers() {
  try {
    // Primeiro fazer login com algum token válido para listar usuários
    const response = await axios.get('http://localhost:3001/api/usuarios', {
      headers: { 'Authorization': 'Bearer test' }
    });
    console.log('Usuários no sistema:', response.data);
  } catch (error) {
    console.log('Erro ao listar usuários:', error.response?.data || error.message);
    
    // Criar usuário de teste
    console.log('\n🔄 Criando usuário admin...');
    const createResponse = await axios.post('http://localhost:3001/api/auth/registro', {
      nome: 'Admin Sistema',
      email: 'admin@test.com',
      senha: '123456'
    });
    console.log('✅ Usuário criado:', createResponse.data);
  }
}

listUsers();
