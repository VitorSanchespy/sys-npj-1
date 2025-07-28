const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testAgendamento() {
    try {
        console.log('🔐 Fazendo login...');
        // Login
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'teste@agendamento.com',
            senha: 'teste123'
        });
        
        console.log('📋 Resposta completa do login:', JSON.stringify(loginResponse.data, null, 2));
        const token = loginResponse.data.token;
        console.log('✅ Login realizado com sucesso');
        console.log('🔑 Token recebido:', token);
        
        // Criar agendamento
        console.log('📅 Criando agendamento...');
        const agendamentoData = {
            titulo: 'Teste Agendamento',
            descricao: 'Teste de criação após correção do banco',
            data_evento: '2024-01-30T10:00:00.000Z',
            tipo: 'evento',
            processo_id: 13
        };
        
        const agendamentoResponse = await axios.post(
            `${BASE_URL}/api/agendamentos`,
            agendamentoData,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Agendamento criado com sucesso:', agendamentoResponse.data);
        
    } catch (error) {
        console.error('❌ Erro:', error.response?.data || error.message);
        if (error.response?.data) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testAgendamento();
