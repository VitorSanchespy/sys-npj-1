const axios = require('axios');

async function testarMiddleware() {
    try {
        // Login
        const login = await axios.post('http://localhost:3001/auth/login', {
            email: 'admin@teste.com',
            senha: '123456'
        });
        
        const token = login.data.token;
        console.log('✅ Login OK');
        
        const dataFutura = new Date();
        dataFutura.setDate(dataFutura.getDate() + 10); // 10 dias no futuro
        
        // Teste criação agendamento
        const response = await axios.post('http://localhost:3001/api/agendamentos', {
            usuario_id: 351,
            titulo: 'Teste Middleware Agendamento',
            descricao: 'Agendamento para teste de middleware',
            data_evento: dataFutura.toISOString(),
            tipo_evento: 'reuniao'
        }, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log('Resposta:', response.status, response.data);
        
    } catch (error) {
        console.log('Erro:', error.response?.status, error.response?.data);
    }
}

testarMiddleware();
