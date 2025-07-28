// Teste Direto da API de Login
const axios = require('axios');

async function testeLoginDireto() {
    console.log('🚀 TESTE DIRETO - LOGIN BACKEND DOCKER');
    console.log('=====================================');
    
    const usuario = { email: 'teste@docker.final', senha: '123456' };
    
    try {
        console.log('🔑 Testando login:', usuario.email);
        const response = await axios.post('http://localhost:3001/auth/login', usuario);
        console.log('✅ SUCESSO! Resposta:', JSON.stringify(response.data, null, 2));
        
        if (response.data.token) {
            console.log('🎯 TOKEN RECEBIDO:', response.data.token.substring(0, 20) + '...');
            return response.data.token;
        }
    } catch (error) {
        console.log('❌ ERRO:', error.response?.data || error.message);
        console.log('📊 Status:', error.response?.status);
        console.log('🔧 Config URL:', error.config?.url);
    }
    
    return null;
}

testeLoginDireto();
