const axios = require('axios');

async function checkProcessos() {
  try {
    console.log('📋 Verificando processos disponíveis...');
    
    // Login
    const loginResponse = await axios.post('http://localhost:3001/auth/login', {
      email: 'admin@teste.com',
      senha: 'admin123'
    });
    
    const token = loginResponse.data.token;
    
    // Listar processos disponíveis
    const processosResponse = await axios.get('http://localhost:3001/api/agendamentos/processos-disponiveis', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('📊 Processos disponíveis:', processosResponse.data.processos?.length || 0);
    
    if (processosResponse.data.processos?.length > 0) {
      const primeiro = processosResponse.data.processos[0];
      console.log('📋 Primeiro processo disponível:', {
        id: primeiro.id,
        numero: primeiro.numero_processo,
        status: primeiro.status,
        encerramento: primeiro.data_encerramento
      });
      
      // Tentar criar agendamento com esse processo
      const agendamentoData = {
        titulo: 'Teste de Agendamento',
        descricao: 'Agendamento de teste',
        local: 'Online',
        dataInicio: '2025-08-20T14:00:00-03:00',
        dataFim: '2025-08-20T15:00:00-03:00',
        tipo_evento: 'Reunião',
        processo_id: primeiro.id
      };
      
      const createResponse = await axios.post('http://localhost:3001/api/agendamentos', agendamentoData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Agendamento criado com sucesso!');
      console.log('📊 Resposta:', {
        success: createResponse.data.success,
        message: createResponse.data.message,
        warning: createResponse.data.warning || 'Nenhum aviso'
      });
    }
    
  } catch (error) {
    if (error.response) {
      console.log('📊 Erro do servidor:', {
        status: error.response.status,
        message: error.response.data.message || error.response.data.erro,
        warning: error.response.data.warning
      });
    } else {
      console.error('❌ Erro na requisição:', error.message);
    }
  }
}

checkProcessos();
