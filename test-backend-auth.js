const axios = require('axios');

async function testBackendAuth() {
    console.log('🔍 Testando autenticação do backend...');
    
    try {
        // 1. Tentar fazer login
        console.log('🔑 Tentando fazer login...');
        const loginResponse = await axios.post('http://localhost:3001/auth/login', {
            email: 'admin@teste.com',
            senha: '123456'
        });
        
        console.log('✅ Login bem-sucedido!');
        console.log('Token:', loginResponse.data.token ? 'Recebido' : 'Não recebido');
        console.log('Usuário:', loginResponse.data.usuario?.nome || 'Não identificado');
        
        // 2. Tentar acessar endpoint protegido
        const token = loginResponse.data.token;
        if (token) {
            console.log('🔍 Testando acesso a endpoint protegido...');
            try {
                const processResponse = await axios.get('http://localhost:3001/api/processos/1', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                console.log('✅ Acesso ao processo 1 bem-sucedido!');
                console.log('Processo:', processResponse.data.numero_processo || 'Dados não disponíveis');
                
            } catch (processError) {
                console.log('❌ Erro ao acessar processo:', processError.response?.status, processError.response?.data?.message || processError.message);
            }
        }
        
    } catch (loginError) {
        console.log('❌ Erro no login:', loginError.response?.status, loginError.response?.data?.message || loginError.message);
        
        // Tentar com outras credenciais
        console.log('🔄 Tentando com outras credenciais...');
        try {
            const users = [
                { email: 'maria@teste.com', senha: '123456' },
                { email: 'joao@teste.com', senha: '123456' },
                { email: 'admin@test.com', senha: '123456' }
            ];
            
            for (const user of users) {
                try {
                    console.log(`🔑 Tentando login com ${user.email}...`);
                    const response = await axios.post('http://localhost:3001/auth/login', user);
                    console.log(`✅ Login bem-sucedido com ${user.email}!`);
                    console.log('Usuário:', response.data.usuario?.nome);
                    return;
                } catch (err) {
                    console.log(`❌ Falha com ${user.email}:`, err.response?.status);
                }
            }
        } catch (err) {
            console.log('❌ Erro geral:', err.message);
        }
    }
}

// Verificar se o axios está disponível
try {
    testBackendAuth().catch(console.error);
} catch (err) {
    console.log('❌ Axios não encontrado. Instalando...');
    console.log('Execute: npm install axios');
}
