const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testarFluxoCompleto() {
    try {
        console.log('🔐 1. Fazendo login...');
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'teste@agendamento.com',
            senha: 'teste123'
        });
        
        const token = loginResponse.data.token;
        console.log('✅ Login realizado com sucesso\n');
        
        console.log('📋 2. Testando listagem de processos...');
        const processosResponse = await axios.get(
            `${BASE_URL}/api/processos`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log(`✅ ${processosResponse.data.length} processos encontrados:`);
        processosResponse.data.slice(0, 3).forEach(p => {
            console.log(`   - ID: ${p.id}, Número: ${p.numero_processo}`);
        });
        console.log('');
        
        console.log('📅 3. Testando listagem de agendamentos...');
        const agendamentosResponse = await axios.get(
            `${BASE_URL}/api/agendamentos`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log(`✅ ${agendamentosResponse.data.length} agendamentos encontrados`);
        
        console.log('\n🎯 CONCLUSÃO:');
        console.log('✅ Login: Funcionando');
        console.log('✅ Processos: Funcionando');  
        console.log('✅ Agendamentos: Funcionando');
        console.log('\n🔧 O problema estava na forma como o componente React estava');
        console.log('   acessando os dados de autenticação (userData.token vs token)');
        
    } catch (error) {
        console.error('❌ Erro:', error.response?.data || error.message);
    }
}

testarFluxoCompleto();
