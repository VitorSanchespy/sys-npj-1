const axios = require('axios');

async function testProcessAPI() {
    console.log('🔍 Testando API de processo detalhado...');
    
    try {
        // Login primeiro
        const loginResponse = await axios.post('http://localhost:3001/auth/login', {
            email: 'professor@teste.com',
            senha: '123456'
        });
        
        const token = loginResponse.data.token;
        console.log('✅ Login realizado');
        
        // Buscar processo específico
        const processResponse = await axios.get('http://localhost:3001/api/processos/1', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('✅ Processo obtido!');
        console.log('📄 Estrutura completa do processo:');
        console.log(JSON.stringify(processResponse.data, null, 2));
        
        // Buscar detalhes completos
        console.log('\n🔍 Buscando detalhes completos...');
        const detailsResponse = await axios.get('http://localhost:3001/api/processos/1/detalhes', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('✅ Detalhes completos obtidos!');
        console.log('📄 Estrutura detalhada:');
        console.log(JSON.stringify(detailsResponse.data, null, 2));
        
        return {
            basic: processResponse.data,
            detailed: detailsResponse.data
        };
        
    } catch (error) {
        console.log('❌ Erro:', error.response?.status, error.response?.data?.message || error.message);
        return null;
    }
}

testProcessAPI().catch(console.error);
