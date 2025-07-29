const http = require('http');

// Configuração do servidor
const BACKEND_HOST = 'localhost';
const BACKEND_PORT = 3001;

// Função para fazer requisições HTTP
function makeRequest(method, path, data = null, headers = {}) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: BACKEND_HOST,
            port: BACKEND_PORT,
            path: path,
            method: method,
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
                    const parsedBody = body ? JSON.parse(body) : null;
                    resolve({ status: res.statusCode, data: parsedBody });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });

        req.on('error', reject);
        
        if (data) {
            req.write(JSON.stringify(data));
        }
        
        req.end();
    });
}

async function testarProcessoSimples() {
    console.log('🧪 TESTE SIMPLES DE CRIAÇÃO DE PROCESSO');
    console.log('======================================');
    
    try {
        // 1. Login
        console.log('🔐 Fazendo login...');
        const loginResponse = await makeRequest('POST', '/auth/login', {
            email: 'teste.api@test.com',
            senha: '123456'
        });
        
        if (loginResponse.status !== 200) {
            console.log('❌ Falha no login:', loginResponse.data);
            return;
        }
        
        const token = loginResponse.data.token;
        console.log('✅ Login realizado com sucesso');
        
        const authHeaders = { 'Authorization': `Bearer ${token}` };
        
        // 2. Teste com campos mínimos
        console.log('\n📝 Testando com campos mínimos...');
        let processoData = {
            numero_processo: `TESTE-MIN-${Date.now()}`,
            descricao: 'Teste simples'
        };
        
        let response = await makeRequest('POST', '/api/processos', processoData, authHeaders);
        console.log(`Status: ${response.status}`);
        console.log('Resposta:', response.data);
        
        // 3. Teste com sistema explícito
        console.log('\n📝 Testando com sistema explícito...');
        processoData = {
            numero_processo: `TESTE-SIS-${Date.now()}`,
            descricao: 'Teste com sistema',
            sistema: 'Fisico'  // Sem acento
        };
        
        response = await makeRequest('POST', '/api/processos', processoData, authHeaders);
        console.log(`Status: ${response.status}`);
        console.log('Resposta:', response.data);
        
        // 4. Teste com sistema PEA
        console.log('\n📝 Testando com sistema PEA...');
        processoData = {
            numero_processo: `TESTE-PEA-${Date.now()}`,
            descricao: 'Teste com PEA',
            sistema: 'PEA'
        };
        
        response = await makeRequest('POST', '/api/processos', processoData, authHeaders);
        console.log(`Status: ${response.status}`);
        console.log('Resposta:', response.data);
        
    } catch (error) {
        console.error('❌ Erro durante o teste:', error.message);
    }
}

testarProcessoSimples();
