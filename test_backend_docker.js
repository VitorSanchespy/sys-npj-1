// 🚀 TESTE COMPLETO - BACKEND DOCKER
const axios = require('axios');

// URLs para containers Docker
const API_URL = 'http://localhost:3001';
let token = null;

// Usuários de teste para tentar
const testUsers = [
    { email: 'teste@backend.docker', senha: '123456' },
    { email: 'admin@teste.com', senha: '123456' },
    { email: 'admin@admin.com', senha: 'admin' },
    { email: 'admin@admin.com', senha: '123456' },
    { email: 'teste@agendamento.com', senha: 'teste123' },
    { email: 'admin@sistema.com', senha: 'admin123' }
];

async function login() {
    console.log('🔐 TENTANDO LOGIN COM DIFERENTES USUÁRIOS...');
    
    for (let i = 0; i < testUsers.length; i++) {
        const user = testUsers[i];
        try {
            console.log(`  🔑 Tentativa ${i+1}: ${user.email}`);
            const response = await axios.post(`${API_URL}/auth/login`, user);
            
            console.log(`  📋 Resposta:`, JSON.stringify(response.data, null, 2));
            
            if (response.data.success !== false && (response.data.token || response.data.accessToken)) {
                token = response.data.token || response.data.accessToken;
                console.log('✅ Login realizado com sucesso!');
                console.log(`👤 Usuário: ${user.email}`);
                console.log('🔑 Token recebido:', token.substring(0, 20) + '...');
                return true;
            }
        } catch (error) {
            console.log(`  ❌ Falhou:`, error.response?.data || error.message);
        }
    }
    
    console.error('❌ NENHUM USUÁRIO FUNCIONOU - VERIFICAR BANCO DE DADOS');
    return false;
}

async function testUsuarios() {
    try {
        console.log('\\n👥 TESTANDO USUÁRIOS...');
        const response = await axios.get(`${API_URL}/api/usuarios`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ ${response.data.length} usuários encontrados`);
        
        // Mostrar alguns usuários
        response.data.slice(0, 3).forEach(user => {
            console.log(`  - ${user.nome} (${user.email}) - Role: ${user.role_id}`);
        });
        return true;
    } catch (error) {
        console.error('❌ ERRO AO LISTAR USUÁRIOS:', error.response?.data || error.message);
        return false;
    }
}

async function testProcessos() {
    try {
        console.log('\\n⚖️ TESTANDO PROCESSOS...');
        const response = await axios.get(`${API_URL}/api/processos`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ ${response.data.length} processos encontrados`);
        
        // Mostrar alguns processos
        response.data.slice(0, 3).forEach(processo => {
            console.log(`  - ${processo.numero_processo || processo.numero} - ${processo.descricao?.substring(0, 50)}...`);
        });
        return true;
    } catch (error) {
        console.error('❌ ERRO AO LISTAR PROCESSOS:', error.response?.data || error.message);
        return false;
    }
}

async function testAgendamentos() {
    try {
        console.log('\\n📅 TESTANDO AGENDAMENTOS...');
        const response = await axios.get(`${API_URL}/api/agendamentos`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ ${response.data.length} agendamentos encontrados`);
        
        // Mostrar alguns agendamentos
        response.data.slice(0, 3).forEach(agendamento => {
            console.log(`  - ${agendamento.titulo} - ${new Date(agendamento.data_evento).toLocaleDateString()}`);
        });
        return true;
    } catch (error) {
        console.error('❌ ERRO AO LISTAR AGENDAMENTOS:', error.response?.data || error.message);
        return false;
    }
}

async function testPerfil() {
    try {
        console.log('\\n👤 TESTANDO PERFIL...');
        const response = await axios.get(`${API_URL}/auth/perfil`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ Perfil obtido: ${response.data.nome} (${response.data.email})`);
        return true;
    } catch (error) {
        console.error('❌ ERRO AO OBTER PERFIL:', error.response?.data || error.message);
        return false;
    }
}

async function testTabelasAuxiliares() {
    try {
        console.log('\\n📊 TESTANDO TABELAS AUXILIARES...');
        
        const materias = await axios.get(`${API_URL}/api/aux/materia-assunto`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ ${materias.data.length} matérias/assuntos encontradas`);
        
        const fases = await axios.get(`${API_URL}/api/aux/fase`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ ${fases.data.length} fases encontradas`);
        
        return true;
    } catch (error) {
        console.error('❌ ERRO AO TESTAR TABELAS AUXILIARES:', error.response?.data || error.message);
        return false;
    }
}

async function testCriarAgendamento() {
    try {
        console.log('\\n📝 TESTANDO CRIAÇÃO DE AGENDAMENTO...');
        
        // Primeiro, buscar um processo para vincular
        const processos = await axios.get(`${API_URL}/api/processos`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (processos.data.length === 0) {
            console.log('⚠️ Nenhum processo encontrado para vincular agendamento');
            return true;
        }
        
        const novoAgendamento = {
            titulo: 'Teste Automatizado Docker',
            descricao: 'Agendamento criado por teste automatizado',
            data_evento: new Date(Date.now() + 86400000).toISOString(), // amanhã
            tipo: 'evento',
            local_evento: 'Container Docker',
            status: 'agendado',
            processo_id: processos.data[0].id
        };
        
        const response = await axios.post(`${API_URL}/api/agendamentos`, novoAgendamento, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log(`✅ Agendamento criado: ${response.data.titulo}`);
        
        // Deletar agendamento de teste
        await axios.delete(`${API_URL}/api/agendamentos/${response.data.id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Agendamento de teste removido');
        
        return true;
    } catch (error) {
        console.error('❌ ERRO AO CRIAR/DELETAR AGENDAMENTO:', error.response?.data || error.message);
        return false;
    }
}

async function runAllTests() {
    console.log('🚀 TESTE MASSIVO - BACKEND DOCKER');
    console.log('=================================');
    console.log('Container: npj-backend (localhost:3001)');
    console.log('');

    const results = {};
    
    // Executar todos os testes
    results.login = await login();
    if (!results.login) {
        console.log('\\n❌ FALHA NO LOGIN - PARANDO TESTES');
        return;
    }
    
    results.usuarios = await testUsuarios();
    results.processos = await testProcessos();
    results.agendamentos = await testAgendamentos();
    results.perfil = await testPerfil();
    results.auxiliares = await testTabelasAuxiliares();
    results.criarAgendamento = await testCriarAgendamento();
    
    // Resumo final
    console.log('\\n📊 RESUMO DOS TESTES:');
    console.log('=====================');
    console.log(`🔐 Login: ${results.login ? '✅ PASSOU' : '❌ FALHOU'}`);
    console.log(`👥 Usuários: ${results.usuarios ? '✅ PASSOU' : '❌ FALHOU'}`);
    console.log(`⚖️ Processos: ${results.processos ? '✅ PASSOU' : '❌ FALHOU'}`);
    console.log(`📅 Agendamentos: ${results.agendamentos ? '✅ PASSOU' : '❌ FALHOU'}`);
    console.log(`👤 Perfil: ${results.perfil ? '✅ PASSOU' : '❌ FALHOU'}`);
    console.log(`📊 Auxiliares: ${results.auxiliares ? '✅ PASSOU' : '❌ FALHOU'}`);
    console.log(`📝 CRUD Agendamento: ${results.criarAgendamento ? '✅ PASSOU' : '❌ FALHOU'}`);
    
    const passedTests = Object.values(results).filter(Boolean).length;
    const totalTests = Object.keys(results).length;
    
    console.log('\\n🎯 RESULTADO FINAL:');
    console.log(`📊 ${passedTests}/${totalTests} testes passaram (${Math.round(passedTests/totalTests*100)}%)`);
    
    if (passedTests === totalTests) {
        console.log('\\n🎉 TODOS OS TESTES PASSARAM!');
        console.log('✅ Backend Docker funcionando perfeitamente');
        console.log('✅ Todas as APIs respondem corretamente');
        console.log('✅ Sistema pronto para uso');
    } else {
        console.log('\\n⚠️ ALGUNS TESTES FALHARAM');
        console.log('❌ Verificar erros acima para correção');
    }
}

// Executar testes
runAllTests().catch(console.error);
