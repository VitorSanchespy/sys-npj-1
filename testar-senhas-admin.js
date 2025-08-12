const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

const senhasTeste = [
  'admin123',
  'admin',
  'npj123',
  'password',
  '123456',
  'admin@npj',
  'teste123',
  'npj2025',
  '1234'
];

async function testarSenhasAdmin() {
  console.log('🔐 TESTANDO SENHAS PARA admin@npj.com');
  console.log('=====================================');
  
  for (const senha of senhasTeste) {
    try {
      const response = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'admin@npj.com',
        senha: senha
      });
      
      console.log(`✅ SENHA CORRETA: "${senha}"`);
      console.log('🎯 Token obtido:', response.data.token.substring(0, 50) + '...');
      console.log('👤 Usuário:', response.data.usuario?.nome);
      console.log('🔑 Role:', response.data.usuario?.role?.nome);
      return senha;
      
    } catch (error) {
      console.log(`❌ Falhou: "${senha}"`);
    }
  }
  
  console.log('\n🚫 Nenhuma senha funcionou. Vamos tentar resetar a senha...');
  return null;
}

testarSenhasAdmin();
