const puppeteer = require('puppeteer');

async function testarEndpointVincular() {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: { width: 1920, height: 1080 }
    });

    try {
        const page = await browser.newPage();
        
        console.log('🔹 Fazendo login como admin...');
        await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });

        await page.waitForSelector('input[type="email"]');
        await page.type('input[type="email"]', 'admin@teste.com');
        await page.type('input[type="password"]', 'admin123');
        await page.click('button[type="submit"]');
        await page.waitForNavigation({ waitUntil: 'networkidle0' });

        console.log('✅ Login realizado como admin');

        // Testar endpoint de vinculação
        const teste = await page.evaluate(async () => {
            const token = localStorage.getItem('token');
            
            try {
                const response = await fetch('http://localhost:3001/api/usuarios/vincular?search=admin&page=1', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                return {
                    status: response.status,
                    statusText: response.statusText,
                    data: response.ok ? await response.json() : await response.text()
                };
            } catch (error) {
                return { error: error.message };
            }
        });

        console.log('\n📡 Resultado do teste endpoint /api/usuarios/vincular:');
        console.log(JSON.stringify(teste, null, 2));

        // Testar navegação para página de processo
        console.log('\n🔹 Navegando para processo 1...');
        await page.goto('http://localhost:5173/processos/1', { waitUntil: 'networkidle0' });
        
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Verificar se botões estão visíveis
        const pageInfo = await page.evaluate(() => {
            return {
                hasEditButton: !!document.querySelector('button:contains("Editar")'),
                hasVincularButton: !!document.querySelector('button:contains("Vincular")'),
                buttonTexts: Array.from(document.querySelectorAll('button')).map(btn => btn.textContent),
                userRole: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).role : null
            };
        });

        console.log('\n📋 Informações da página:');
        console.log('Tem botão Editar:', pageInfo.hasEditButton);
        console.log('Tem botão Vincular:', pageInfo.hasVincularButton);
        console.log('Role do usuário:', pageInfo.userRole);
        console.log('Textos dos botões:', pageInfo.buttonTexts);

    } catch (error) {
        console.error('❌ Erro:', error);
    } finally {
        await browser.close();
    }
}

testarEndpointVincular().catch(console.error);
