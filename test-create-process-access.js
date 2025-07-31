const puppeteer = require('puppeteer');

async function testarECriarAcessoProcesso() {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: { width: 1920, height: 1080 }
    });

    try {
        const page = await browser.newPage();
        
        console.log('🔹 Fazendo login como professor...');
        await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });

        await page.waitForSelector('input[type="email"]');
        await page.type('input[type="email"]', 'admin@test.com');  // Usando admin
        await page.type('input[type="password"]', 'senha123');
        await page.click('button[type="submit"]');
        await page.waitForNavigation({ waitUntil: 'networkidle0' });

        console.log('✅ Login realizado como admin');

        // Verificar processos existentes
        const processosResponse = await page.evaluate(async () => {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:3001/api/processos', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (res.ok) {
                return await res.json();
            } else {
                return { error: `Status: ${res.status}`, message: await res.text() };
            }
        });

        console.log('📋 Processos encontrados:');
        console.log(JSON.stringify(processosResponse, null, 2));

        // Tentar acessar processo 4 como admin
        const processo4Response = await page.evaluate(async () => {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:3001/api/processos/4', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            return {
                status: res.status,
                statusText: res.statusText,
                body: res.ok ? await res.json() : await res.text()
            };
        });

        console.log('📋 Processo 4 como admin:');
        console.log(JSON.stringify(processo4Response, null, 2));

        // Se não encontrou processo 4, criar um
        if (processo4Response.status === 404) {
            console.log('🔹 Criando processo de teste...');
            
            const novoProcesso = await page.evaluate(async () => {
                const token = localStorage.getItem('token');
                const res = await fetch('http://localhost:3001/api/processos', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        numero_processo: '2025-001-TESTE',
                        parte_contraria: 'Parte Teste',
                        comarca: 'São Paulo',
                        vara: '1ª Vara Civil',
                        valor_causa: '5000.00',
                        tipo_acao: 'Civil',
                        assunto: 'Teste de Sistema',
                        status: 'Em Andamento',
                        prioridade: 'Normal',
                        descricao: 'Processo criado para testes de acesso'
                    })
                });
                
                return {
                    status: res.status,
                    body: res.ok ? await res.json() : await res.text()
                };
            });

            console.log('📝 Novo processo criado:');
            console.log(JSON.stringify(novoProcesso, null, 2));
        }

        // Agora testar login como aluno novamente
        console.log('\n🔹 Fazendo logout e login como aluno...');
        
        await page.evaluate(() => {
            localStorage.clear();
        });

        await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
        await page.waitForSelector('input[type="email"]');
        await page.type('input[type="email"]', 'professor@test.com');
        await page.type('input[type="password"]', 'senha123');
        await page.click('button[type="submit"]');
        await page.waitForNavigation({ waitUntil: 'networkidle0' });

        console.log('✅ Login realizado como aluno');

        // Verificar token do aluno
        const alunoInfo = await page.evaluate(() => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    return payload;
                } catch (e) {
                    return { error: 'Token inválido' };
                }
            }
            return { error: 'Token não encontrado' };
        });

        console.log('👤 Aluno logado:', alunoInfo);

        // Listar processos como aluno
        const processosAluno = await page.evaluate(async () => {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:3001/api/processos', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            return {
                status: res.status,
                body: res.ok ? await res.json() : await res.text()
            };
        });

        console.log('📋 Processos do aluno:');
        console.log(JSON.stringify(processosAluno, null, 2));

        // Navegar para processo 4 na interface
        console.log('\n🔹 Navegando para /processos/4...');
        await page.goto('http://localhost:5173/processos/4', { waitUntil: 'networkidle0' });
        
        await new Promise(resolve => setTimeout(resolve, 3000));

        const pageStatus = await page.evaluate(() => {
            return {
                url: window.location.href,
                title: document.title,
                hasError: !!document.querySelector('.text-red-600'),
                errorText: document.querySelector('.text-red-600')?.textContent,
                pageContent: document.body.textContent.substring(0, 200)
            };
        });

        console.log('📋 Status da página:');
        console.log(JSON.stringify(pageStatus, null, 2));

    } catch (error) {
        console.error('❌ Erro:', error);
    } finally {
        await browser.close();
    }
}

testarECriarAcessoProcesso().catch(console.error);
