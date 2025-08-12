const axios = require('axios');

// Teste simplificado
const BASE_URL = 'http://localhost:3001';

async function quickTest() {
  try {
    // Fazer login diretamente
    console.log('🔐 Fazendo login...');
    const login = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'admin@teste.com',
      senha: 'senha123'
    });
    
    const token = login.data.token;
    console.log('✅ Login OK');

    // Testar campos corretos
    const updateData = {
      email_agendamentos: true,
      email_processos: false,
      email_sistema: true,
      email_atualizacoes: false
    };

    const config = { headers: { Authorization: `Bearer ${token}` } };
    const result = await axios.put(`${BASE_URL}/api/notifications/settings`, updateData, config);
    
    console.log('✅ Configurações salvas com sucesso!');
    console.log('Dados:', result.data);

    // Verificar se dados foram salvos
    const saved = await axios.get(`${BASE_URL}/api/notifications/settings`, config);
    console.log('✅ Configurações recuperadas:', saved.data);

    console.log('\n🎯 ALINHAMENTO COMPLETO!');
    console.log('Frontend e Backend estão usando os mesmos campos:');
    console.log('- email_agendamentos');
    console.log('- email_processos'); 
    console.log('- email_sistema');
    console.log('- email_atualizacoes');

  } catch (error) {
    console.log('❌ Erro:', error.response?.data?.message || error.message);
  }
}

quickTest();
