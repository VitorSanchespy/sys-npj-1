const axios = require('axios');

const BASE_URL = 'http://localhost:3001';
let authToken = '';

// Configurar cores para o console
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

const log = {
    success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
    error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
    warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
    info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`)
};

async function testEndpoint(method, url, data = null, headers = {}) {
    try {
        const config = {
            method,
            url: `${BASE_URL}${url}`,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };
        
        if (data) {
            config.data = data;
        }
        
        const response = await axios(config);
        return { success: true, data: response.data, status: response.status };
    } catch (error) {
        return { 
            success: false, 
            error: error.response ? error.response.data : error.message,
            status: error.response ? error.response.status : 500
        };
    }
}

async function runTests() {
    console.log(`${colors.blue}🚀 Iniciando testes do backend...${colors.reset}\n`);
    
    // 1. Teste de autenticação - Login
    log.info('Testando autenticação...');
    
    // Primeiro, vamos tentar registrar um usuário para teste (pode já existir)
    const registerResult = await testEndpoint('POST', '/auth/registro', {
        nome: 'Usuario Teste',
        email: 'teste@teste.com',
        senha: '123456',
        role_id: 1  // Admin
    });
    
    if (registerResult.success) {
        log.success('Usuário registrado com sucesso');
    } else {
        log.warning('Registro falhou (usuário pode já existir): ' + JSON.stringify(registerResult.error));
    }
    
    // Tentar fazer login com o usuário existente primeiro
    let loginResult = await testEndpoint('POST', '/auth/login', {
        email: 'teste@teste.com',
        senha: '123456'
    });
    
    if (loginResult.success) {
        log.success('Login realizado com sucesso');
        authToken = loginResult.data.token;
        log.info('Token obtido: ' + authToken.substring(0, 20) + '...');
    } else {
        log.error('Falha no login: ' + JSON.stringify(loginResult.error));
        return;
    }
    
    // 2. Teste de usuários
    log.info('\nTestando endpoints de usuários...');
    
    const usersResult = await testEndpoint('GET', '/api/usuarios', null, {
        'Authorization': `Bearer ${authToken}`
    });
    
    if (usersResult.success) {
        log.success(`Listagem de usuários funcionando (${usersResult.data.length || 'N/A'} usuários)`);
    } else {
        log.error('Falha na listagem de usuários: ' + JSON.stringify(usersResult.error));
    }
    
    // 3. Teste de perfil do usuário
    const profileResult = await testEndpoint('GET', '/api/usuarios/me', null, {
        'Authorization': `Bearer ${authToken}`
    });
    
    if (profileResult.success) {
        log.success('Obtenção de perfil funcionando');
    } else {
        log.error('Falha ao obter perfil: ' + JSON.stringify(profileResult.error));
    }
    
    // 4. Teste de processos
    log.info('\nTestando endpoints de processos...');
    
    const processosResult = await testEndpoint('GET', '/api/processos', null, {
        'Authorization': `Bearer ${authToken}`
    });
    
    if (processosResult.success) {
        log.success(`Listagem de processos funcionando (${processosResult.data.length || 'N/A'} processos)`);
    } else {
        log.error('Falha na listagem de processos: ' + JSON.stringify(processosResult.error));
    }
    
    // 5. Teste de criação de processo
    const novoProcesso = {
        numero_processo: '1234567-89.2025.1.00.0001',
        descricao: 'Processo de teste criado automaticamente',
        assistido: 'João da Silva',
        contato_assistido: 'joao@email.com',
        sistema: 'PEA'
    };
    
    const criarProcessoResult = await testEndpoint('POST', '/api/processos/novo', novoProcesso, {
        'Authorization': `Bearer ${authToken}`
    });
    
    if (criarProcessoResult.success) {
        log.success('Criação de processo funcionando');
    } else {
        log.error('Falha na criação de processo: ' + JSON.stringify(criarProcessoResult.error));
    }
    
    // 6. Teste de agendamentos
    log.info('\nTestando endpoints de agendamentos...');
    
    const agendamentosResult = await testEndpoint('GET', '/api/agendamentos', null, {
        'Authorization': `Bearer ${authToken}`
    });
    
    if (agendamentosResult.success) {
        log.success(`Listagem de agendamentos funcionando (${agendamentosResult.data.length || 'N/A'} agendamentos)`);
    } else {
        log.error('Falha na listagem de agendamentos: ' + JSON.stringify(agendamentosResult.error));
    }
    
    // 7. Teste de tabelas auxiliares
    log.info('\nTestando endpoints de tabelas auxiliares...');
    
    const materiasResult = await testEndpoint('GET', '/api/aux/materias', null, {
        'Authorization': `Bearer ${authToken}`
    });
    
    if (materiasResult.success) {
        log.success('Listagem de matérias funcionando');
    } else {
        log.error('Falha na listagem de matérias: ' + JSON.stringify(materiasResult.error));
    }
    
    // 8. Teste de refresh token
    log.info('\nTestando refresh token...');
    
    const refreshResult = await testEndpoint('POST', '/auth/refresh-token');
    
    if (refreshResult.success) {
        log.success('Refresh token funcionando');
    } else {
        log.warning('Refresh token falhou (normal se não há refresh token válido): ' + JSON.stringify(refreshResult.error));
    }
    
    console.log(`\n${colors.blue}🏁 Testes concluídos!${colors.reset}`);
}

// Executar os testes
runTests().catch(console.error);
