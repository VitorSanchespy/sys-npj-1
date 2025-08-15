const axios = require('axios');

async function testLembrete() {
  try {
    // Login
    console.log('🔑 Fazendo login...');
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin@teste.com',
      senha: 'admin123'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login realizado com sucesso');
    console.log('👤 Dados do usuário:', loginResponse.data.user);

    // Buscar agendamentos primeiro
    console.log('🔍 Buscando agendamentos...');
    const agendamentosResponse = await axios.get('http://localhost:3001/api/agendamentos', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('📅 Agendamentos encontrados:', agendamentosResponse.data.agendamentos?.length || 0);
    
    if (!agendamentosResponse.data.agendamentos || agendamentosResponse.data.agendamentos.length === 0) {
      console.log('❌ Nenhum agendamento encontrado para testar');
      return;
    }

    const agendamento = agendamentosResponse.data.agendamentos[0];
    console.log('📅 Testando com agendamento:', {
      id: agendamento.id,
      titulo: agendamento.titulo,
      criado_por: agendamento.criado_por
    });

    // Testar lembrete
    console.log('📧 Enviando lembrete...');
    const lembreteResponse = await axios.post(`http://localhost:3001/api/agendamentos/${agendamento.id}/lembrete`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Lembrete enviado com sucesso!');
    console.log('📊 Resposta:', lembreteResponse.data);

  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
    if (error.response) {
      console.log('📊 Status code:', error.response.status);
    }
  }
}

testLembrete();
