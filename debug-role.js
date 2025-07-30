const axios = require('axios');

async function debugRole() {
    try {
        // Login primeiro
        console.log('🔐 Fazendo login...');
        const loginResponse = await axios.post('http://localhost:3001/auth/login', {
            email: 'admin@teste.com',
            senha: '123456'
        });
        
        const token = loginResponse.data.token;
        console.log('✅ Token obtido:', token.substring(0, 50) + '...');
        
        // Criar endpoint temporário para debug
        console.log('\n📍 Vamos testar um endpoint simples...');
        
        // Tentar acessar endpoint de usuários que sabemos que funciona
        const usuariosResponse = await axios.get('http://localhost:3001/api/usuarios', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Usuários endpoint funcionou! Status:', usuariosResponse.status);
        
        // Agora tentar processos
        console.log('\n📋 Testando endpoint de processos...');
        const processosResponse = await axios.get('http://localhost:3001/api/processos', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Processos endpoint funcionou! Status:', processosResponse.status);
        
    } catch (error) {
        if (error.response) {
            console.log('❌ Erro:', error.response.status, error.response.statusText);
            console.log('📝 Headers de resposta:', error.response.headers);
            console.log('📄 Dados da resposta:', error.response.data);
        } else {
            console.log('❌ Erro de rede:', error.message);
        }
    }
}

debugRole();
