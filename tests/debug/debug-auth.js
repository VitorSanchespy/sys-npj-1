const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function debugAuth() {
    try {
        // Fazer login
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'admin@teste.com',
            senha: '123456'
        });
        
        const token = loginResponse.data.token;
        const usuario = loginResponse.data.usuario;
        
        console.log('✅ Login bem-sucedido');
        console.log('Dados do usuário:', JSON.stringify(usuario, null, 2));
        
        // Decodificar o token JWT para ver o conteúdo
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        console.log('Token payload:', JSON.stringify(payload, null, 2));
        
        // Testar endpoint de processos
        try {
            const processosResponse = await axios.get(`${BASE_URL}/api/processos`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log('✅ Acesso aos processos permitido');
        } catch (error) {
            console.log('❌ Acesso aos processos negado:', error.response.data);
        }
        
    } catch (error) {
        console.error('Erro:', error.response ? error.response.data : error.message);
    }
}

debugAuth();
