const puppeteer = require('puppeteer');

async function testProcessPermissions() {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: { width: 1920, height: 1080 }
    });

    try {
        const page = await browser.newPage();
        
        // Interceptar requests de rede
        await page.setRequestInterception(true);
        
        page.on('request', (request) => {
            console.log(`📡 Request: ${request.method()} ${request.url()}`);
            if (request.url().includes('/api/processos')) {
                console.log(`📡 Headers: ${JSON.stringify(request.headers(), null, 2)}`);
            }
            request.continue();
        });

        page.on('response', (response) => {
            if (response.url().includes('/api/processos')) {
                console.log(`📡 Response: ${response.status()} ${response.url()}`);
            }
        });

        console.log('🔹 Fazendo login...');
        await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });

        await page.waitForSelector('input[type="email"]');
        await page.type('input[type="email"]', 'professor@test.com');
        await page.type('input[type="password"]', 'senha123');
        await page.click('button[type="submit"]');
        await page.waitForNavigation({ waitUntil: 'networkidle0' });

        console.log('✅ Login realizado');

        // Primeiro verificar quais processos existem
        console.log('\n🔹 Verificando processos disponíveis...');
        const response = await page.evaluate(async () => {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:3001/api/processos', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (res.ok) {
                const data = await res.json();
                return { status: res.status, data };
            } else {
                return { status: res.status, error: await res.text() };
            }
        });

        console.log('📋 Processos disponíveis:');
        console.log(JSON.stringify(response, null, 2));

        // Agora tentar acessar o processo 4 diretamente via API
        console.log('\n🔹 Testando acesso direto ao processo 4...');
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
                headers: Object.fromEntries(res.headers.entries()),
                body: res.ok ? await res.json() : await res.text()
            };
        });

        console.log('📋 Resposta para processo 4:');
        console.log(JSON.stringify(processo4Response, null, 2));

        // Verificar informações do usuário logado
        console.log('\n🔹 Verificando usuário logado...');
        const userInfo = await page.evaluate(() => {
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

        console.log('👤 Usuário logado:');
        console.log(JSON.stringify(userInfo, null, 2));

    } catch (error) {
        console.error('❌ Erro:', error);
    } finally {
        await browser.close();
    }
}

testProcessPermissions().catch(console.error);
