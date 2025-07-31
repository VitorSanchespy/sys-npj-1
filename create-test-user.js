const axios = require('axios');

async function createTestUser() {
    console.log('🔧 Criando usuário de teste...');
    
    try {
        // Criar usuário via endpoint
        const response = await axios.post('http://localhost:3001/auth/registro', {
            nome: 'Teste User',
            email: 'teste@teste.com',
            senha: '123456',
            role_id: 1 // Admin
        });
        
        console.log('✅ Usuário criado com sucesso!');
        console.log('Dados:', response.data);
        
        // Agora tentar fazer login
        console.log('🔑 Tentando fazer login com o usuário criado...');
        const loginResponse = await axios.post('http://localhost:3001/auth/login', {
            email: 'teste@teste.com',
            senha: '123456'
        });
        
        console.log('✅ Login bem-sucedido!');
        console.log('Token:', loginResponse.data.token ? 'Recebido' : 'Não recebido');
        console.log('Usuário:', loginResponse.data.usuario?.nome || 'Não identificado');
        
        return loginResponse.data;
        
    } catch (error) {
        if (error.response?.status === 409) {
            console.log('ℹ️ Usuário já existe, tentando fazer login...');
            try {
                const loginResponse = await axios.post('http://localhost:3001/auth/login', {
                    email: 'teste@teste.com',
                    senha: '123456'
                });
                console.log('✅ Login bem-sucedido com usuário existente!');
                return loginResponse.data;
            } catch (loginError) {
                console.log('❌ Erro no login:', loginError.response?.status, loginError.response?.data?.message || loginError.message);
            }
        } else {
            console.log('❌ Erro ao criar usuário:', error.response?.status, error.response?.data?.message || error.message);
        }
    }
}

createTestUser().catch(console.error);
