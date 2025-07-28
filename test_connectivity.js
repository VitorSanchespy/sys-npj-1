// Teste Simples de Conectividade do Backend Docker
const axios = require('axios');

const API_URL = 'http://localhost:3001';

async function testeConectividade() {
    console.log('🚀 TESTE SIMPLES - CONECTIVIDADE BACKEND DOCKER');
    console.log('===========================================');
    console.log(`Container: npj-backend (${API_URL})`);
    console.log('');

    // Teste 1: Verificar se o servidor está respondendo
    try {
        console.log('📡 Testando conectividade básica...');
        const response = await axios.get(`${API_URL}/`);
        console.log('✅ Servidor está respondendo:', response.status);
    } catch (error) {
        console.log('❌ Erro de conectividade:', error.code || error.message);
        return;
    }

    // Teste 2: Tentar acessar endpoint de health check (se existir)
    try {
        console.log('🔍 Verificando endpoints disponíveis...');
        const response = await axios.get(`${API_URL}/health`);
        console.log('✅ Health check:', response.data);
    } catch (error) {
        console.log('⚠️ Health check não disponível');
    }

    // Teste 3: Testar endpoint de tabelas auxiliares (não requer auth)
    try {
        console.log('📊 Testando endpoint público (tabelas auxiliares)...');
        const response = await axios.get(`${API_URL}/api/aux/materias`);
        console.log('✅ Matérias encontradas:', response.data.length || 'N/A');
    } catch (error) {
        console.log('❌ Erro ao acessar matérias:', error.response?.data?.message || error.message);
    }

    // Teste 4: Verificar se consegue acessar o banco (testando endpoint que usa DB)
    try {
        console.log('🗄️ Testando conexão com banco de dados...');
        const response = await axios.get(`${API_URL}/api/aux/fases`);
        console.log('✅ Fases encontradas:', response.data.length || 'N/A');
    } catch (error) {
        console.log('❌ Erro ao acessar fases:', error.response?.data?.message || error.message);
    }

    console.log('');
    console.log('📝 RESUMO:');
    console.log('- Servidor: Rodando ✅');
    console.log('- Banco: Status será mostrado acima');
    console.log('');
    console.log('💡 Para testes completos, execute: node test_backend_docker.js');
}

testeConectividade().catch(console.error);
