const axios = require('axios');

async function debugAgendamento() {
  try {
    // Login como admin
    const loginResponse = await axios.post('http://localhost:3001/auth/login', {
      email: 'admin@teste.com',
      senha: '123456'
    });

    const token = loginResponse.data.token;
    
    // Dados do agendamento conforme o teste
    const agendamentoData = new Date();
    agendamentoData.setDate(agendamentoData.getDate() + 1); // Amanhã
    agendamentoData.setHours(14, 0, 0, 0); // 14:00
    
    const novoAgendamento = {
      titulo: 'Agendamento de Teste - admin',
      descricao: 'Descrição do agendamento',
      data_hora: agendamentoData.toISOString(), // Testando com data_hora primeiro
      dataEvento: agendamentoData.toISOString(), // E também dataEvento
      local: 'Sala de Reuniões',
      tipo: 'Reunião'
    };

    console.log('Dados enviados:', JSON.stringify(novoAgendamento, null, 2));

    const response = await axios.post('http://localhost:3001/agendamentos', novoAgendamento, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'x-test-mode': 'true'
      }
    });

    console.log('Sucesso:', response.data);

  } catch (error) {
    console.log('Error details:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
  }
}

debugAgendamento();
