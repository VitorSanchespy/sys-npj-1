const puppeteer = require('puppeteer');

async function debugToken() {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: { width: 1920, height: 1080 }
    });

    try {
        const page = await browser.newPage();
        
        console.log('🔹 Fazendo login...');
        await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });

        await page.waitForSelector('input[type="email"]');
        await page.type('input[type="email"]', 'professor@test.com');
        await page.type('input[type="password"]', 'senha123');
        await page.click('button[type="submit"]');
        await page.waitForNavigation({ waitUntil: 'networkidle0' });

        console.log('✅ Login realizado');

        // Verificar token detalhadamente
        const tokenInfo = await page.evaluate(() => {
            const token = localStorage.getItem('token');
            
            if (!token) {
                return { error: 'Token não encontrado' };
            }
            
            try {
                // Decodificar payload do JWT
                const payload = JSON.parse(atob(token.split('.')[1]));
                
                return {
                    token: token.substring(0, 50) + '...', // Primeiros 50 caracteres
                    payload: payload,
                    isExpired: payload.exp < (Date.now() / 1000),
                    expiresAt: new Date(payload.exp * 1000).toISOString()
                };
            } catch (e) {
                return { error: 'Token inválido', token: token.substring(0, 50) + '...' };
            }
        });

        console.log('\n🔑 Informações do token:');
        console.log(JSON.stringify(tokenInfo, null, 2));

        // Testar API diretamente com curl via node
        console.log('\n🔹 Testando API com fetch...');
        
        const apiTest = await page.evaluate(async () => {
            const token = localStorage.getItem('token');
            
            try {
                const response = await fetch('http://localhost:3001/api/processos/4', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                const responseText = await response.text();
                
                return {
                    status: response.status,
                    statusText: response.statusText,
                    headers: Object.fromEntries(response.headers.entries()),
                    body: responseText
                };
            } catch (error) {
                return { error: error.message };
            }
        });

        console.log('\n📡 Resultado da API:');
        console.log(JSON.stringify(apiTest, null, 2));

    } catch (error) {
        console.error('❌ Erro:', error);
    } finally {
        await browser.close();
    }
}

debugToken().catch(console.error);
