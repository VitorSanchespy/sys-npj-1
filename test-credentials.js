/**
 * Script para testar credenciais dos usuários existentes
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testarCredenciais() {
  const credenciais = [
    { email: 'admin@teste.com', senha: '123456' },
    { email: 'prof@teste.com', senha: '123456' },
    { email: 'aluno@teste.com', senha: '123456' },
    { email: 'maria@teste.com', senha: '123456' },
    { email: 'joao@teste.com', senha: '123456' }
  ];

  console.log('🔑 Testando credenciais de usuários...\n');

  for (const cred of credenciais) {
    try {
      const response = await axios.post(`${BASE_URL}/auth/login`, cred);
      console.log(`✅ ${cred.email} - Login sucesso`);
      console.log(`   Token: ${response.data.token.substring(0, 20)}...`);
      console.log(`   Role: ${response.data.usuario?.role || 'N/A'}\n`);
    } catch (error) {
      console.log(`❌ ${cred.email} - Login falhou`);
      console.log(`   Erro: ${error.response?.data?.erro || error.message}\n`);
    }
  }
}

testarCredenciais().catch(console.error);
