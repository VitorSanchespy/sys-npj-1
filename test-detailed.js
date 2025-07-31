const puppeteer = require('puppeteer');

async function testeDetalhado() {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: { width: 1920, height: 1080 }
    });

    try {
        const page = await browser.newPage();
        
        // Capturar todos os logs
        page.on('console', (msg) => {
            console.log(`[CONSOLE] ${msg.text()}`);
        });

        // Capturar requests de rede
        page.on('request', (request) => {
            if (request.url().includes('/api/processos')) {
                console.log(`[REQUEST] ${request.method()} ${request.url()}`);
            }
        });

        page.on('response', (response) => {
            if (response.url().includes('/api/processos')) {
                console.log(`[RESPONSE] ${response.status()} ${response.url()}`);
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

        // Aguardar um pouco e verificar token
        await new Promise(resolve => setTimeout(resolve, 2000));

        const tokenCheck = await page.evaluate(() => {
            return {
                token: localStorage.getItem('token'),
                user: localStorage.getItem('user')
            };
        });

        console.log('🔑 Token após login:', tokenCheck.token ? 'EXISTE' : 'NÃO EXISTE');
        console.log('👤 User após login:', tokenCheck.user ? 'EXISTE' : 'NÃO EXISTE');

        // Navegar para o processo 4
        console.log('\n🔹 Navegando para /processos/4...');
        await page.goto('http://localhost:5173/processos/4', { waitUntil: 'networkidle0' });

        // Aguardar carregamento
        await new Promise(resolve => setTimeout(resolve, 10000));

        // Verificar estado final
        const finalState = await page.evaluate(() => {
            return {
                url: window.location.href,
                hasH1: !!document.querySelector('h1'),
                h1Text: document.querySelector('h1')?.textContent,
                tokenInStorage: !!localStorage.getItem('token'),
                userInStorage: !!localStorage.getItem('user'),
                bodyText: document.body.textContent.substring(0, 1000)
            };
        });

        console.log('\n📋 Estado final:');
        console.log('URL:', finalState.url);
        console.log('Tem H1:', finalState.hasH1);
        console.log('Texto H1:', finalState.h1Text);
        console.log('Token no storage:', finalState.tokenInStorage);
        console.log('User no storage:', finalState.userInStorage);
        console.log('\nConteúdo da página (1000 chars):');
        console.log(finalState.bodyText);

    } catch (error) {
        console.error('❌ Erro:', error);
    } finally {
        await new Promise(resolve => setTimeout(resolve, 5000));
        await browser.close();
    }
}

testeDetalhado().catch(console.error);
