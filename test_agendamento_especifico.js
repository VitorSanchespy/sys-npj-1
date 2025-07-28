const axios = require('axios');

async function testeAgendamento() {
    console.log('🔍 TESTE ESPECÍFICO - AGENDAMENTO DOCKER');
    console.log('======================================');
    
    // Primeiro, fazer login
    const loginResponse = await axios.post('http://localhost:3001/auth/login', {
        email: 'teste@backend.docker',
        senha: '123456'
    });
    
    if (!loginResponse.data.success) {
        console.log('❌ Falha no login');
        return;
    }
    
    const token = loginResponse.data.token;
    console.log('✅ Login OK');
    
    // Configurar headers
    const headers = { Authorization: `Bearer ${token}` };
    
    try {
        // Tentar criar um agendamento com os campos corretos
        console.log('📝 Testando criação de agendamento...');
        const novoAgendamento = {
            processo_id: 20, // ID que existe
            tipo_evento: 'reuniao', // Campo correto
            titulo: 'Teste de Agendamento Docker',
            descricao: 'Teste automatizado',
            data_evento: '2025-08-25 10:00:00',
            local: 'NPJ - Sala de Testes'
        };
        
        const createResponse = await axios.post(
            'http://localhost:3001/api/agendamentos/novo',
            novoAgendamento,
            { headers }
        );
        
        console.log('✅ Agendamento criado:', createResponse.data.titulo);
        const agendamentoId = createResponse.data.id;
        
        // Tentar deletar
        console.log('🗑️ Testando exclusão...');
        await axios.delete(
            `http://localhost:3001/api/agendamentos/${agendamentoId}`,
            { headers }
        );
        
        console.log('✅ Agendamento deletado com sucesso!');
        
    } catch (error) {
        console.log('❌ Erro:', error.response?.data || error.message);
        console.log('🔧 Status:', error.response?.status);
        console.log('🔧 URL:', error.config?.url);
    }
}

testeAgendamento();
