const axios = require('axios');

async function testarAgendamento() {
  console.log('🧪 Testando criação de agendamento com notificações...\n');

  try {
    // 1. Fazer login
    console.log('1️⃣ Fazendo login...');
    const loginResponse = await axios.post('http://localhost:3001/auth/login', {
      email: 'teste@teste.com',
      senha: '123456'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login realizado com sucesso');

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 2. Criar agendamento
    console.log('\n2️⃣ Criando novo agendamento...');
    const agendamentoData = {
      tipo_evento: 'reuniao',
      titulo: 'Teste Notificações Corrigido',
      descricao: 'Agendamento para testar notificações com ENUM correto',
      data_evento: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Amanhã
      local: 'Sala de Reuniões',
      lembrete_1_dia: true
    };

    const agendamentoResponse = await axios.post(
      'http://localhost:3001/api/agendamentos',
      agendamentoData,
      { headers }
    );

    console.log('✅ Agendamento criado:', agendamentoResponse.data);

    // 3. Aguardar um pouco para processamento
    console.log('\n3️⃣ Aguardando processamento de notificações...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 4. Verificar notificações no banco
    console.log('\n4️⃣ Verificando notificações criadas no banco...');

  } catch (error) {
    if (error.response) {
      console.error('❌ Erro na resposta:', error.response.status, error.response.data);
    } else {
      console.error('❌ Erro:', error.message);
    }
  }
}

testarAgendamento();
