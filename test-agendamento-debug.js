const axios = require('axios');

async function testAgendamento() {
  try {
    // Login
    console.log('🔑 Fazendo login...');
    const loginResponse = await axios.post('http://localhost:3001/auth/login', {
      email: 'admin@teste.com',
      senha: 'admin123'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login realizado com sucesso');

    // Dados do agendamento (EXATAMENTE como o frontend está enviando)
    const agendamentoData = {
      processo_id: 65,
      titulo: "testeFinal",
      data_inicio: "2025-08-15T19:28:00.000Z",
      data_fim: "2025-08-15T21:28:00.000Z",
      local: "7777777777",
      tipo: "prazo",
      email_lembrete: "reidosotakos@gmail.com",
      convidados: [
        {
          email: "vitorhugosanchesyt@gmail.com",
          nome: "vitor hugo braga sanches",
          status: "pendente"
        }
      ]
    };

    console.log('📦 Dados enviados:', JSON.stringify(agendamentoData, null, 2));

    // Requisição de criação
    const response = await axios.post('http://localhost:3001/api/agendamentos', agendamentoData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Agendamento criado com sucesso!');
    console.log('📊 Resposta:', response.data);

  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
    if (error.response?.data?.errors) {
      console.error('🔍 Erros de validação:', error.response.data.errors);
    }
  }
}

testAgendamento();
