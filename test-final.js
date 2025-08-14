const axios = require('axios');

async function testSimpleAgendamento() {
  try {
    console.log('📅 Testando funcionalidade com usuário sem Google Calendar...');
    
    // Login com usuário de teste
    const loginResponse = await axios.post('http://localhost:3001/auth/login', {
      email: 'admin@teste.com',
      senha: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login realizado com Admin');
    
    // Primeiro, vamos listar os processos
    const processosResponse = await axios.get('http://localhost:3001/api/processos', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('📋 Total de processos no sistema:', processosResponse.data.data?.length || 0);
    
    if (processosResponse.data.data?.length > 0) {
      const processo = processosResponse.data.data[0];
      console.log('📋 Usando processo:', {
        id: processo.id,
        numero: processo.numero_processo,
        status: processo.status
      });
      
      // Tentar criar agendamento
      const agendamentoData = {
        titulo: 'Reunião de Orientação',
        descricao: 'Reunião para discutir o andamento do processo',
        local: 'NPJ - Sala 1',
        dataInicio: '2025-08-20T14:00:00-03:00',
        dataFim: '2025-08-20T15:00:00-03:00',
        tipo_evento: 'Reunião',
        processo_id: processo.id
      };
      
      const createResponse = await axios.post('http://localhost:3001/api/agendamentos', agendamentoData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Agendamento criado!');
      console.log('📊 Resposta:', {
        success: createResponse.data.success,
        message: createResponse.data.message,
        warning: createResponse.data.warning || 'Nenhum aviso'
      });
      
      // Agora testar a busca
      console.log('\n🔍 Testando busca...');
      const searchResponse = await axios.get('http://localhost:3001/api/agendamentos-global?search=reunião', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('📊 Resultado da busca:', {
        encontrados: searchResponse.data.data?.agendamentos?.length || 0,
        total: searchResponse.data.data?.pagination?.total || 0
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

testSimpleAgendamento();
