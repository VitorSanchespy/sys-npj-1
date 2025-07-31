const axios = require('axios');

async function createProfessorUser() {
    console.log('🔧 Criando usuário Professor...');
    
    try {
        // Criar usuário via endpoint
        const response = await axios.post('http://localhost:3001/auth/registro', {
            nome: 'Professor Teste',
            email: 'professor@teste.com',
            senha: '123456',
            role_id: 2 // Professor
        });
        
        console.log('✅ Professor criado com sucesso!');
        console.log('Dados:', response.data);
        
        // Agora tentar fazer login
        console.log('🔑 Tentando fazer login com o professor...');
        const loginResponse = await axios.post('http://localhost:3001/auth/login', {
            email: 'professor@teste.com',
            senha: '123456'
        });
        
        console.log('✅ Login bem-sucedido!');
        console.log('Token:', loginResponse.data.token ? 'Recebido' : 'Não recebido');
        console.log('Usuário:', loginResponse.data.usuario?.nome || 'Não identificado');
        
        // Testar acesso ao processo
        const token = loginResponse.data.token;
        if (token) {
            console.log('🔍 Testando acesso ao processo 1...');
            try {
                const processResponse = await axios.get('http://localhost:3001/api/processos/1', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                console.log('✅ Acesso ao processo 1 bem-sucedido para Professor!');
                console.log('Processo:', processResponse.data.numero_processo || 'Dados não disponíveis');
                
            } catch (processError) {
                console.log('❌ Erro ao acessar processo:', processError.response?.status, processError.response?.data?.message || processError.message);
            }
        }
        
        return loginResponse.data;
        
    } catch (error) {
        if (error.response?.status === 409) {
            console.log('ℹ️ Professor já existe, tentando fazer login...');
            try {
                const loginResponse = await axios.post('http://localhost:3001/auth/login', {
                    email: 'professor@teste.com',
                    senha: '123456'
                });
                console.log('✅ Login bem-sucedido com professor existente!');
                return loginResponse.data;
            } catch (loginError) {
                console.log('❌ Erro no login:', loginError.response?.status, loginError.response?.data?.message || loginError.message);
            }
        } else {
            console.log('❌ Erro ao criar professor:', error.response?.status, error.response?.data?.message || error.message);
        }
    }
}

createProfessorUser().catch(console.error);
