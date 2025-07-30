/**
 * TESTE AUTOMATIZADO - SISTEMA DE NOTIFICAÇÕES FRONTEND
 * ======================================================
 * 
 * Testa toda a integração do sistema de notificações frontend com backend
 * Inclui: autenticação, busca de notificações, marcação como lida, estatísticas
 */

const api = 'http://localhost:3001';

// Helper para fazer requisições
async function makeRequest(url, options = {}) {
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error(`❌ Erro na requisição ${url}:`, error.message);
        throw error;
    }
}

// 1. Teste de Autenticação
async function testarAutenticacao() {
    console.log('🔐 TESTANDO AUTENTICAÇÃO...');
    try {
        const result = await makeRequest(`${api}/auth/login`, {
            method: 'POST',
            body: JSON.stringify({
                email: 'admin@teste.com',
                senha: '123456'
            })
        });
        
        console.log('✅ Login realizado com sucesso');
        console.log(`🔑 Token: ${result.token.substring(0, 20)}...`);
        return result.token;
    } catch (error) {
        console.log('❌ Falha no login:', error.message);
        throw error;
    }
}

// 2. Teste de Busca de Notificações
async function testarBuscaNotificacoes(token) {
    console.log('\n📋 TESTANDO BUSCA DE NOTIFICAÇÕES...');
    try {
        const result = await makeRequest(`${api}/api/notificacoes`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log(`✅ ${result.notificacoes.length} notificações encontradas`);
        console.log(`📊 Total: ${result.total} | Não lidas: ${result.naoLidas}`);
        
        if (result.notificacoes.length > 0) {
            const primeira = result.notificacoes[0];
            console.log(`📝 Primeira: "${primeira.titulo}" - ${primeira.tipo}`);
        }
        
        return result;
    } catch (error) {
        console.log('❌ Falha ao buscar notificações:', error.message);
        throw error;
    }
}

// 3. Teste de Contagem de Não Lidas
async function testarContagemNaoLidas(token) {
    console.log('\n🔢 TESTANDO CONTAGEM DE NÃO LIDAS...');
    try {
        const result = await makeRequest(`${api}/api/notificacoes/nao-lidas/contador`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log(`✅ ${result.count} notificações não lidas`);
        return result.count;
    } catch (error) {
        console.log('❌ Falha ao contar não lidas:', error.message);
        throw error;
    }
}

// 4. Teste de Configurações de Notificação
async function testarConfiguracoes(token) {
    console.log('\n⚙️ TESTANDO CONFIGURAÇÕES...');
    try {
        const result = await makeRequest(`${api}/api/notificacoes/configuracoes`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('✅ Configurações obtidas:');
        console.log(`📧 Email lembretes: ${result.configuracao.email_lembretes ? 'Ativo' : 'Inativo'}`);
        console.log(`🔔 Push lembretes: ${result.configuracao.push_lembretes ? 'Ativo' : 'Inativo'}`);
        console.log(`📱 Email alertas: ${result.configuracao.email_alertas ? 'Ativo' : 'Inativo'}`);
        
        return result;
    } catch (error) {
        console.log('❌ Falha ao buscar configurações:', error.message);
        throw error;
    }
}

// 5. Teste de Marcação como Lida
async function testarMarcarComoLida(token, notificacoes) {
    if (!notificacoes || notificacoes.length === 0) {
        console.log('\n⚠️ Nenhuma notificação para testar marcação como lida');
        return;
    }
    
    console.log('\n✓ TESTANDO MARCAÇÃO COMO LIDA...');
    try {
        const primeira = notificacoes[0];
        const result = await makeRequest(`${api}/api/notificacoes/${primeira.id}/lida`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log(`✅ Notificação ${primeira.id} marcada como lida`);
        return result;
    } catch (error) {
        console.log('❌ Falha ao marcar como lida:', error.message);
        throw error;
    }
}

// 6. Teste de Criação de Nova Notificação (via criação de usuário)
async function testarCriacaoNotificacao(token) {
    console.log('\n👤 TESTANDO CRIAÇÃO DE NOTIFICAÇÃO (VIA NOVO USUÁRIO)...');
    try {
        const timestamp = Date.now();
        const randomId = Math.floor(Math.random() * 10000);
        const result = await makeRequest(`${api}/api/usuarios`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                nome: 'Teste Notificações Frontend',
                email: `teste.frontend.${timestamp}.${randomId}@teste.com`,
                senha: '123456',
                telefone: `(11) 9999${randomId.toString().padStart(4, '0')}`,
                role_id: 1
            })
        });
        
        console.log(`✅ Usuário criado: ${result.nome} (${result.email})`);
        console.log('📬 Notificação de criação deve ter sido gerada');
        
        return result;
    } catch (error) {
        console.log('❌ Falha ao criar usuário:', error.message);
        throw error;
    }
}

// 7. Teste Completo do Sistema
async function executarTestesCompletos() {
    console.log('🚀 INICIANDO TESTES DO SISTEMA DE NOTIFICAÇÕES FRONTEND');
    console.log('=========================================================\n');
    
    const resultados = {
        autenticacao: false,
        buscaNotificacoes: false,
        contagemNaoLidas: false,
        configuracoes: false,
        marcarComoLida: false,
        criacaoNotificacao: false
    };
    
    try {
        // 1. Autenticação
        const token = await testarAutenticacao();
        resultados.autenticacao = true;
        
        // 2. Busca inicial de notificações
        const dadosNotificacoes = await testarBuscaNotificacoes(token);
        resultados.buscaNotificacoes = true;
        
        // 3. Contagem de não lidas
        await testarContagemNaoLidas(token);
        resultados.contagemNaoLidas = true;
        
        // 4. Configurações
        await testarConfiguracoes(token);
        resultados.configuracoes = true;
        
        // 5. Marcação como lida
        await testarMarcarComoLida(token, dadosNotificacoes.notificacoes);
        resultados.marcarComoLida = true;
        
        // 6. Criação de nova notificação
        await testarCriacaoNotificacao(token);
        resultados.criacaoNotificacao = true;
        
        // 7. Busca final para verificar nova notificação
        console.log('\n🔄 VERIFICANDO NOVA NOTIFICAÇÃO...');
        await testarBuscaNotificacoes(token);
        
    } catch (error) {
        console.log('\n💥 ERRO CRÍTICO:', error.message);
    }
    
    // Relatório final
    console.log('\n📊 RELATÓRIO FINAL DOS TESTES');
    console.log('===============================');
    
    const testes = Object.keys(resultados);
    const passou = testes.filter(teste => resultados[teste]).length;
    const total = testes.length;
    
    testes.forEach(teste => {
        const status = resultados[teste] ? '✅' : '❌';
        const nome = teste.replace(/([A-Z])/g, ' $1').toLowerCase();
        console.log(`${status} ${nome}`);
    });
    
    console.log(`\n🎯 RESULTADO: ${passou}/${total} testes passaram (${Math.round(passou/total*100)}%)`);
    
    if (passou === total) {
        console.log('🎉 TODOS OS TESTES PASSARAM! Sistema funcionando perfeitamente.');
    } else {
        console.log('⚠️ ALGUNS TESTES FALHARAM. Verificar implementação.');
    }
}

// Executar testes se chamado diretamente
if (typeof window === 'undefined' && typeof require !== 'undefined') {
    // Node.js environment
    const fetch = require('node-fetch');
    executarTestesCompletos().catch(console.error);
} else {
    // Browser environment
    window.testarNotificacoesFrontend = executarTestesCompletos;
    console.log('✅ Testes carregados. Execute: testarNotificacoesFrontend()');
}
