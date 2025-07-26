const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testarProcessos() {
    try {
        console.log('🔐 Fazendo login...');
        // Login
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'teste@agendamento.com',
            senha: 'teste123'
        });
        
        const token = loginResponse.data.token;
        console.log('✅ Login realizado com sucesso');
        
        // Listar processos
        console.log('📋 Carregando processos...');
        const processosResponse = await axios.get(
            `${BASE_URL}/api/processos`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Processos carregados:', processosResponse.data.length, 'processos encontrados');
        processosResponse.data.slice(0, 3).forEach(p => {
            console.log(`- ID: ${p.id}, Número: ${p.numero_processo}, Descrição: ${p.descricao}`);
        });
        
    } catch (error) {
        console.error('❌ Erro:', error.response?.data || error.message);
    }
}

testarProcessos();
