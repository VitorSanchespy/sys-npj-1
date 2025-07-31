const axios = require('axios');

async function testarEndpointDetalhes() {
    try {
        // Primeiro fazer login para pegar o token
        console.log('🔐 Fazendo login...');
        const loginResponse = await axios.post('http://localhost:3001/auth/login', {
            email: 'admin@teste.com',
            senha: 'admin123'
        });

        const token = loginResponse.data.token;
        console.log('✅ Login realizado com sucesso');
        console.log('🎫 Token obtido:', token.substring(0, 50) + '...');

        // Agora testar o endpoint detalhes
        console.log('\n🔹 Testando endpoint /detalhes...');
        const detalhesResponse = await axios.get('http://localhost:3001/api/processos/1/detalhes', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('✅ Endpoint /detalhes funcionou!');
        console.log('📋 Dados retornados:');
        console.log(JSON.stringify(detalhesResponse.data, null, 2));

    } catch (error) {
        console.error('❌ Erro:', error.response?.status, error.response?.statusText);
        console.error('Detalhes:', error.response?.data);
        
        if (error.code === 'ECONNREFUSED') {
            console.error('\n🚨 Servidor não está rodando! Execute: docker-compose up');
        }
    }
}

testarEndpointDetalhes();
