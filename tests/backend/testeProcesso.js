// Teste específico para criação de processo
const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testarCriacaoProcesso() {
  try {
    console.log('🔑 Fazendo login...');
    
    // Login
    const loginResponse = await axios.post(`http://localhost:3001/auth/login`, {
      email: 'admin@teste.com',
      senha: '123456'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login realizado com sucesso');
    
    // Teste básico - verificar se a API está respondendo
    console.log('🔍 Testando conectividade básica...');
    try {
      const healthCheck = await axios.get(`${BASE_URL}/usuarios`, { headers: { 'Authorization': `Bearer ${token}` }});
      console.log('✅ Conectividade OK - usuários:', healthCheck.data.length);
    } catch (healthError) {
      console.log('❌ Erro de conectividade:', healthError.message);
    }
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    console.log('📝 Testando criação de processo...');
    
    // Teste com dados mínimos
    const dadosProcesso = {
      numero_processo: 'TEST-002-2025',
      descricao: 'Processo de Teste',
      contato_assistido: 'assistido@teste.com',
      sistema: 'PEA'
    };
    
    console.log('Dados enviados:', JSON.stringify(dadosProcesso, null, 2));
    
    const response = await axios.post(`${BASE_URL}/processos/novo`, dadosProcesso, { headers });
    
    console.log('✅ Processo criado com sucesso!');
    console.log('Resposta:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ Erro na execução:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Dados:', error.response.data);
      if (error.response.status === 404) {
        console.log('URL tentada:', error.config?.url);
      }
    } else {
      console.log('Erro:', error.message);
    }
  }
}

testarCriacaoProcesso();
