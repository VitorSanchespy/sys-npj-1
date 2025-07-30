// TESTE COMPLETO - ROTAS DE PROCESSOS NPJ
console.log('🧪 TESTE MASSIVO - ROTAS DE PROCESSOS');
console.log('====================================');

const http = require('http');
const querystring = require('querystring');

// Configurações
const API_BASE = 'http://localhost:3001';
const TIMEOUT = 10000;

// Função para fazer requisições HTTP
function makeRequest(method, path, data = null, headers = {}) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, API_BASE);
        
        const options = {
            method,
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const response = {
                        status: res.statusCode,
                        headers: res.headers,
                        data: body ? JSON.parse(body) : null
                    };
                    resolve(response);
                } catch (error) {
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        data: body
                    });
                }
            });
        });

        req.on('error', reject);
        req.setTimeout(TIMEOUT, () => {
            req.destroy();
            reject(new Error('Timeout'));
        });

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

// Função para fazer login e obter token
async function obterToken() {
    console.log('🔐 Fazendo login para obter token...');
    
    // Lista de credenciais para testar
    const credenciais = [
        { email: 'teste.api@test.com', senha: '123456' },
        { email: 'teste@backend.docker', senha: 'senha123' },
        { email: 'admin@admin.com', senha: 'admin123' }
    ];
    
    for (const cred of credenciais) {
        try {
            console.log(`   🔑 Tentando: ${cred.email}`);
            const response = await makeRequest('POST', '/auth/login', cred);
            
            if (response.status === 200 && response.data.token) {
                console.log(`✅ Login realizado com sucesso: ${cred.email}`);
                return response.data.token;
            } else {
                console.log(`   ❌ Falha com ${cred.email}:`, response.data?.erro || 'Erro desconhecido');
            }
        } catch (error) {
            console.log(`   ❌ Erro com ${cred.email}:`, error.message);
        }
    }
    
    console.log('❌ Nenhuma credencial funcionou');
    return null;
}

// Testes das rotas de processos
async function testarProcessos() {
    console.log('\n⚖️ INICIANDO TESTES DE PROCESSOS');
    console.log('=================================');
    
    const token = await obterToken();
    if (!token) {
        console.log('❌ Não foi possível obter token. Abortando testes.');
        return;
    }
    
    const authHeaders = { 'Authorization': `Bearer ${token}` };
    
    let resultados = {
        listar: false,
        criar: false,
        buscarPorId: false,
        atualizar: false,
        deletar: false,
        usuarios: false,
        atualizacoes: false
    };
    
    let processoTestId = null;
    
    try {
        // 1. TESTE: Listar processos
        console.log('\n📋 1. LISTANDO PROCESSOS:');
        try {
            const response = await makeRequest('GET', '/api/processos', null, authHeaders);
            
            if (response.status === 200) {
                const processos = response.data;
                console.log(`✅ Processos listados: ${processos.length} encontrados`);
                
                if (processos.length > 0) {
                    console.log(`   📁 Primeiro processo: ${processos[0].numero_processo}`);
                    processoTestId = processos[0].id; // Usaremos para outros testes
                }
                
                resultados.listar = true;
            } else {
                console.log(`❌ Erro ao listar processos: Status ${response.status}`);
                console.log('   Resposta:', response.data);
            }
        } catch (error) {
            console.log('❌ Erro ao listar processos:', error.message);
        }
        
        // 2. TESTE: Criar processo
        console.log('\n📝 2. CRIANDO NOVO PROCESSO:');
        try {
            const novoProcesso = {
                numero_processo: `TESTE-${Date.now()}`,
                descricao: 'Processo de teste criado automaticamente',
                tipo_processo: 'Cível',
                status: 'Em andamento',
                sistema: 'PEA',
                assistido: 'João Teste Silva',
                contato_assistido: 'joao.teste@email.com',
                observacoes: 'Processo criado para teste automático',
                materia_assunto_id: 1,
                fase_id: 1,
                local_tramitacao_id: 1
            };
            
            const response = await makeRequest('POST', '/api/processos', novoProcesso, authHeaders);
            
            if (response.status === 201) {
                console.log('✅ Processo criado com sucesso');
                console.log(`   📋 ID: ${response.data.id}`);
                console.log(`   📋 Número: ${response.data.numero_processo}`);
                processoTestId = response.data.id;
                resultados.criar = true;
            } else {
                console.log(`❌ Erro ao criar processo: Status ${response.status}`);
                console.log('   Resposta:', response.data);
            }
        } catch (error) {
            console.log('❌ Erro ao criar processo:', error.message);
        }
        
        // 3. TESTE: Buscar processo por ID
        if (processoTestId) {
            console.log(`\n🔍 3. BUSCANDO PROCESSO POR ID (${processoTestId}):`);
            try {
                const response = await makeRequest('GET', `/api/processos/${processoTestId}`, null, authHeaders);
                
                if (response.status === 200) {
                    console.log('✅ Processo encontrado');
                    console.log(`   📋 Número: ${response.data.numero_processo}`);
                    console.log(`   📋 Tipo: ${response.data.tipo_processo}`);
                    console.log(`   📋 Status: ${response.data.status}`);
                    resultados.buscarPorId = true;
                } else {
                    console.log(`❌ Erro ao buscar processo: Status ${response.status}`);
                    console.log('   Resposta:', response.data);
                }
            } catch (error) {
                console.log('❌ Erro ao buscar processo:', error.message);
            }
        }
        
        // 4. TESTE: Atualizar processo
        if (processoTestId) {
            console.log(`\n✏️ 4. ATUALIZANDO PROCESSO (${processoTestId}):`);
            try {
                const atualizacao = {
                    observacoes: 'Processo atualizado via teste automático'
                };
                
                const response = await makeRequest('PUT', `/api/processos/${processoTestId}`, atualizacao, authHeaders);
                
                if (response.status === 200) {
                    console.log('✅ Processo atualizado com sucesso');
                    resultados.atualizar = true;
                } else {
                    console.log(`❌ Erro ao atualizar processo: Status ${response.status}`);
                    console.log('   Resposta:', response.data);
                }
            } catch (error) {
                console.log('❌ Erro ao atualizar processo:', error.message);
            }
        }
        
        // 5. TESTE: Buscar usuários do processo
        if (processoTestId) {
            console.log(`\n👥 5. BUSCANDO USUÁRIOS DO PROCESSO (${processoTestId}):`);
            try {
                const response = await makeRequest('GET', `/api/processos/${processoTestId}/usuarios`, null, authHeaders);
                
                if (response.status === 200) {
                    console.log(`✅ Usuários do processo: ${response.data.length} encontrados`);
                    resultados.usuarios = true;
                } else {
                    console.log(`❌ Erro ao buscar usuários: Status ${response.status}`);
                    console.log('   Resposta:', response.data);
                }
            } catch (error) {
                console.log('❌ Erro ao buscar usuários:', error.message);
            }
        }
        
        // 6. TESTE: Buscar atualizações do processo
        if (processoTestId) {
            console.log(`\n📝 6. BUSCANDO ATUALIZAÇÕES DO PROCESSO (${processoTestId}):`);
            try {
                const response = await makeRequest('GET', `/api/atualizacoes/${processoTestId}`, null, authHeaders);
                
                if (response.status === 200) {
                    console.log(`✅ Atualizações do processo: ${response.data.length} encontradas`);
                    resultados.atualizacoes = true;
                } else {
                    console.log(`❌ Erro ao buscar atualizações: Status ${response.status}`);
                    console.log('   Resposta:', response.data);
                }
            } catch (error) {
                console.log('❌ Erro ao buscar atualizações:', error.message);
            }
        }
        
        // 7. TESTE: Deletar processo (se foi criado no teste)
        if (processoTestId && resultados.criar) {
            console.log(`\n🗑️ 7. DELETANDO PROCESSO DE TESTE (${processoTestId}):`);
            try {
                const response = await makeRequest('DELETE', `/api/processos/${processoTestId}`, null, authHeaders);
                
                if (response.status === 200) {
                    console.log('✅ Processo deletado com sucesso');
                    resultados.deletar = true;
                } else {
                    console.log(`❌ Erro ao deletar processo: Status ${response.status}`);
                    console.log('   Resposta:', response.data);
                }
            } catch (error) {
                console.log('❌ Erro ao deletar processo:', error.message);
            }
        }
        
    } catch (error) {
        console.log('❌ Erro geral nos testes:', error.message);
    }
    
    // Resumo dos resultados
    console.log('\n📊 RESUMO DOS TESTES DE PROCESSOS:');
    console.log('==================================');
    
    const testes = [
        { nome: 'Listar Processos', resultado: resultados.listar },
        { nome: 'Criar Processo', resultado: resultados.criar },
        { nome: 'Buscar por ID', resultado: resultados.buscarPorId },
        { nome: 'Atualizar Processo', resultado: resultados.atualizar },
        { nome: 'Usuários do Processo', resultado: resultados.usuarios },
        { nome: 'Atualizações do Processo', resultado: resultados.atualizacoes },
        { nome: 'Deletar Processo', resultado: resultados.deletar }
    ];
    
    testes.forEach(teste => {
        const status = teste.resultado ? '✅ PASSOU' : '❌ FALHOU';
        console.log(`${status} - ${teste.nome}`);
    });
    
    const totalTestes = testes.length;
    const testesPassaram = testes.filter(t => t.resultado).length;
    const porcentagem = Math.round((testesPassaram / totalTestes) * 100);
    
    console.log(`\n🎯 RESULTADO FINAL: ${testesPassaram}/${totalTestes} testes passaram (${porcentagem}%)`);
    
    if (porcentagem === 100) {
        console.log('\n🎉 TODOS OS TESTES DE PROCESSOS PASSARAM!');
        console.log('✅ API de processos funcionando perfeitamente');
    } else if (porcentagem >= 80) {
        console.log('\n⚠️ MAIORIA DOS TESTES PASSOU');
        console.log('✅ API de processos funcionando bem');
        console.log('🔧 Alguns endpoints podem precisar de ajustes');
    } else {
        console.log('\n❌ VÁRIOS TESTES FALHARAM');
        console.log('🚨 API de processos precisa de correções');
    }
}

// Executar os testes
testarProcessos().catch(console.error);
