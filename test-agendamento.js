const axios = require('axios');

async function testAgendamentoDebug() {
  try {
    // Login
    const loginResponse = await axios.post('http://localhost:3001/auth/login', {
      email: 'admin@teste.com',
      senha: 'admin123'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login realizado com sucesso');

    // Dados do agendamento
    const agendamentoData = {
      titulo: 'Teste Debug',
      descricao: 'Teste de debug do erro 400',
      data_inicio: '2025-08-15T14:00',
      data_fim: '2025-08-15T15:00',
      tipo: 'reuniao',
      local: 'Sala 101',
      observacoes: '',
      convidados: []
      // Não inclua email_lembrete se não houver valor!
    };

    // Requisição de criação
    const response = await axios.post('http://localhost:3001/api/agendamentos', agendamentoData, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log('📥 Resposta:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    if (error.response) {
      console.log('❌ Erro:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('❌ Erro na requisição:', error.message);
    }
  }
}

testAgendamentoDebug();
