/**
 * Teste de validações anti-duplicação
 * Verifica se o sistema impede criação de registros duplicados
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

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

let authToken;

async function testEndpoint(method, url, data = null, headers = {}) {
    try {
        const config = {
            method,
            url: `${BASE_URL}${url}`,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            },
            ...(data && { data })
        };

        const response = await axios(config);
        return { success: true, data: response.data, status: response.status };
    } catch (error) {
        return { 
            success: false, 
            error: error.response?.data || error.message,
            status: error.response?.status || 500 
        };
    }
}

async function testarValidacaoAntiDuplicacao() {
    console.log('🚀 Iniciando testes de validação anti-duplicação...\n');

    // 1. Fazer login para obter token
    log.info('Fazendo login...');
    const loginResult = await testEndpoint('POST', '/auth/login', {
        email: 'admin@teste.com',
        senha: '123456'
    });

    if (!loginResult.success) {
        log.error('Falha no login: ' + JSON.stringify(loginResult.error));
        return;
    }

    authToken = loginResult.data.token;
    log.success('Login realizado com sucesso');

    const headers = { 'Authorization': `Bearer ${authToken}` };

    // 2. Teste de duplicação de usuário
    log.info('\n📝 Testando validação anti-duplicação de usuários...');
    
    const novoUsuario = {
        nome: 'Usuário Teste Duplicação',
        email: 'teste.duplicacao@test.com',
        senha: '123456',
        role_id: 1
    };

    // Primeira tentativa - deve funcionar
    const criarUsuarioResult1 = await testEndpoint('POST', '/api/usuarios', novoUsuario, headers);
    
    if (criarUsuarioResult1.success) {
        log.success('Primeiro usuário criado com sucesso');
        
        // Segunda tentativa - deve falhar (email duplicado)
        const criarUsuarioResult2 = await testEndpoint('POST', '/api/usuarios', novoUsuario, headers);
        
        if (!criarUsuarioResult2.success && criarUsuarioResult2.status === 409) {
            log.success('Validação anti-duplicação de usuário funcionando - Email duplicado rejeitado');
            log.info('Detalhes: ' + JSON.stringify(criarUsuarioResult2.error.detalhes));
        } else {
            log.error('Validação anti-duplicação de usuário falhou - Email duplicado foi aceito');
        }
    } else {
        log.warning('Primeira criação de usuário falhou: ' + JSON.stringify(criarUsuarioResult1.error));
    }

    // 3. Teste de duplicação de processo
    log.info('\n📋 Testando validação anti-duplicação de processos...');
    
    const novoProcesso = {
        numero_processo: 'TESTE-DUPLICACAO-001-2025',
        descricao: 'Processo de teste para validação anti-duplicação',
        contato_assistido: 'assistido.duplicacao@test.com',
        sistema: 'PEA'
    };

    // Primeira tentativa - deve funcionar
    const criarProcessoResult1 = await testEndpoint('POST', '/api/processos/novo', novoProcesso, headers);
    
    if (criarProcessoResult1.success) {
        log.success('Primeiro processo criado com sucesso');
        
        // Segunda tentativa - deve falhar (número duplicado)
        const criarProcessoResult2 = await testEndpoint('POST', '/api/processos/novo', novoProcesso, headers);
        
        if (!criarProcessoResult2.success && criarProcessoResult2.status === 409) {
            log.success('Validação anti-duplicação de processo funcionando - Número duplicado rejeitado');
            log.info('Detalhes: ' + JSON.stringify(criarProcessoResult2.error.detalhes));
        } else {
            log.error('Validação anti-duplicação de processo falhou - Número duplicado foi aceito');
        }
    } else {
        log.warning('Primeira criação de processo falhou: ' + JSON.stringify(criarProcessoResult1.error));
    }

    // 4. Teste de duplicação de agendamento
    log.info('\n📅 Testando validação anti-duplicação de agendamentos...');
    
    const dataFutura = new Date();
    dataFutura.setDate(dataFutura.getDate() + 7); // 7 dias no futuro
    
    const novoAgendamento = {
        usuario_id: 351, // ID do admin
        titulo: 'Teste Duplicação Agendamento',
        descricao: 'Agendamento para teste de duplicação',
        data_evento: dataFutura.toISOString(),
        tipo_evento: 'reuniao'
    };

    // Primeira tentativa - deve funcionar
    const criarAgendamentoResult1 = await testEndpoint('POST', '/api/agendamentos', novoAgendamento, headers);
    
    if (criarAgendamentoResult1.success) {
        log.success('Primeiro agendamento criado com sucesso');
        
        // Segunda tentativa - deve falhar (agendamento duplicado)
        const criarAgendamentoResult2 = await testEndpoint('POST', '/api/agendamentos', novoAgendamento, headers);
        
        if (!criarAgendamentoResult2.success && criarAgendamentoResult2.status === 409) {
            log.success('Validação anti-duplicação de agendamento funcionando - Agendamento duplicado rejeitado');
            log.info('Detalhes: ' + JSON.stringify(criarAgendamentoResult2.error.detalhes));
        } else {
            log.error('Validação anti-duplicação de agendamento falhou - Agendamento duplicado foi aceito');
        }
        
        // Teste de conflito de horário (mesma data, 15 minutos depois)
        const dataConflito = new Date(dataFutura.getTime() + (15 * 60000)); // 15 minutos depois
        const agendamentoConflito = {
            ...novoAgendamento,
            titulo: 'Teste Conflito de Horário',
            data_evento: dataConflito.toISOString()
        };
        
        const criarAgendamentoConflito = await testEndpoint('POST', '/api/agendamentos', agendamentoConflito, headers);
        
        if (!criarAgendamentoConflito.success && criarAgendamentoConflito.status === 409) {
            log.success('Validação de conflito de horário funcionando - Agendamento conflitante rejeitado');
            log.info('Detalhes: ' + JSON.stringify(criarAgendamentoConflito.error.detalhes));
        } else {
            log.warning('Validação de conflito de horário pode não estar funcionando');
        }
        
    } else {
        log.warning('Primeira criação de agendamento falhou: ' + JSON.stringify(criarAgendamentoResult1.error));
    }

    // 5. Limpeza - remover dados de teste
    log.info('\n🧹 Limpando dados de teste...');
    
    // Tentar limpar usuário criado
    if (criarUsuarioResult1.success) {
        const userId = criarUsuarioResult1.data.usuario?.id;
        if (userId) {
            await testEndpoint('DELETE', `/api/usuarios/${userId}`, null, headers);
            log.info('Usuário de teste removido');
        }
    }

    log.info('\n🏁 Testes de validação anti-duplicação concluídos!');
}

// Executar os testes
testarValidacaoAntiDuplicacao().catch(console.error);
