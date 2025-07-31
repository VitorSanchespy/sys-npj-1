const axios = require('axios');

async function testarEndpointVincular() {
    try {
        // Primeiro fazer login para pegar o token
        console.log('🔐 Fazendo login...');
        const loginResponse = await axios.post('http://localhost:3001/auth/login', {
            email: 'admin@teste.com',
            senha: 'admin123'
        });

        const token = loginResponse.data.token;
        console.log('✅ Login realizado com sucesso');

        // Agora testar o endpoint vincular
        console.log('\n🔹 Testando endpoint /usuarios/vincular...');
        const vincularResponse = await axios.get('http://localhost:3001/api/usuarios/vincular?busca=&pagina=1&limite=10', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('✅ Endpoint /usuarios/vincular funcionou!');
        console.log('📋 Dados retornados:');
        console.log(JSON.stringify(vincularResponse.data, null, 2));

    } catch (error) {
        console.error('❌ Erro:', error.response?.status, error.response?.statusText);
        console.error('Detalhes:', error.response?.data);
        
        if (error.code === 'ECONNREFUSED') {
            console.error('\n🚨 Servidor não está rodando! Execute: docker-compose up');
        }
    }
}

testarEndpointVincular();
