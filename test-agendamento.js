const axios = require('axios');

async function testAgendamentoCreation() {
  try {
    console.log('📅 Testando criação de agendamento...');
    
    // Login
    const loginResponse = await axios.post('http://localhost:3001/auth/login', {
      email: 'admin@teste.com',
      senha: 'admin123'
    });
    
    if (!loginResponse.data.token) {
      console.log('❌ Falha no login');
      return;
    }
    
    const token = loginResponse.data.token;
    console.log('✅ Login realizado com sucesso');
    
    // Testar criação de agendamento sem processo específico
    const agendamentoData = {
      titulo: 'Teste de Agendamento',
      descricao: 'Agendamento de teste para verificar tratamento de erro',
      local: 'Online',
      dataInicio: '2025-08-20T14:00:00-03:00',
      dataFim: '2025-08-20T15:00:00-03:00',
      tipo_evento: 'Reunião'
      // processo_id: 1 // Removido para testar agendamento geral
    };
    
    const response = await axios.post('http://localhost:3001/api/agendamentos', agendamentoData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('📊 Resultado da criação:', {
      success: response.data.success,
      message: response.data.message,
      warning: response.data.warning || 'Nenhum aviso'
    });
    
    if (response.data.success) {
      console.log('✅ Agendamento criado com sucesso!');
      if (response.data.warning) {
        console.log(`⚠️ Aviso: ${response.data.warning}`);
      }
    }
    
  } catch (error) {
    if (error.response) {
      console.log('📊 Resposta do servidor:', {
        status: error.response.status,
        message: error.response.data.message || error.response.data.erro,
        warning: error.response.data.warning || 'Nenhum aviso'
      });
    } else {
      console.error('❌ Erro na requisição:', error.message);
    }
  }
}

testAgendamentoCreation();
