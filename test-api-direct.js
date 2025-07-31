const axios = require('axios');

async function testDirectAPIAccess() {
    console.log('🔍 Testando acesso direto à API...');
    
    try {
        // 1. Fazer login primeiro
        const loginResponse = await axios.post('http://localhost:3001/auth/login', {
            email: 'teste@teste.com',
            senha: '123456'
        });
        
        const token = loginResponse.data.token;
        console.log('✅ Login realizado, token obtido');
        
        // 2. Testar acesso ao processo específico
        console.log('🔍 Testando acesso ao processo 1...');
        const processResponse = await axios.get('http://localhost:3001/api/processos/1', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('✅ Processo obtido com sucesso!');
        console.log('📄 Dados do processo:', {
            id: processResponse.data.id,
            numero: processResponse.data.numero_processo,
            descricao: processResponse.data.descricao?.substring(0, 50) + '...'
        });
        
        // 3. Testar listagem de processos
        console.log('🔍 Testando listagem de processos...');
        const listResponse = await axios.get('http://localhost:3001/api/processos', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('✅ Lista de processos obtida!');
        console.log('📊 Total de processos:', listResponse.data.length);
        
        return true;
        
    } catch (error) {
        console.log('❌ Erro:', error.response?.status, error.response?.data?.message || error.message);
        return false;
    }
}

testDirectAPIAccess().catch(console.error);
