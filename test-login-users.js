const axios = require('axios');

// Configurações
const backendUrl = 'http://localhost:3001';

// Dados de teste para diferentes tipos de usuários
const usuarios = [
  { email: 'admin2@test.com', senha: 'senha123' },
  { email: 'professor2@test.com', senha: 'senha123' },
  { email: 'aluno2@test.com', senha: 'senha123' }
];

async function testLogin() {
  console.log('🔍 TESTANDO LOGIN COM DIFERENTES USUÁRIOS...\n');

  for (const usuario of usuarios) {
    try {
      console.log(`📝 Testando login: ${usuario.email}...`);
      const response = await axios.post(`${backendUrl}/auth/login`, usuario);
      
      if (response.status === 200) {
        console.log('✅ Login realizado com sucesso');
        console.log('👤 Usuário:', response.data.usuario?.nome);
        console.log('🔑 Role:', response.data.usuario?.role);
        console.log('🎫 Token:', response.data.token ? 'Presente' : 'Ausente');
        console.log('---');
        return { success: true, data: response.data };
      }
    } catch (error) {
      console.log(`❌ Erro no login para ${usuario.email}:`, error.response?.data?.erro || error.message);
      console.log('---');
    }
  }
  
  return { success: false };
}

// Executar o teste
testLogin().then(result => {
  if (!result.success) {
    console.log('\n❌ Nenhum usuário encontrado. Pode ser necessário criar usuários de teste.');
  }
});
