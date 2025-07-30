const axios = require('axios');

async function testeDirecto() {
    try {
        // Login primeiro
        console.log('🔐 Fazendo login...');
        const loginResponse = await axios.post('http://localhost:3001/auth/login', {
            email: 'admin@teste.com',
            senha: '123456'
        });
        
        const token = loginResponse.data.token;
        
        // Testar endpoint direto sem role middleware
        console.log('\n🎯 Testando endpoint direto sem role middleware...');
        const testeResponse = await axios.get('http://localhost:3001/api/processos/teste-direto', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Teste direto funcionou! Status:', testeResponse.status);
        console.log('📄 Dados:', testeResponse.data);
        
    } catch (error) {
        if (error.response) {
            console.log('❌ Erro:', error.response.status, error.response.statusText);
            console.log('📄 Dados da resposta:', error.response.data);
        } else {
            console.log('❌ Erro de rede:', error.message);
        }
    }
}

testeDirecto();
