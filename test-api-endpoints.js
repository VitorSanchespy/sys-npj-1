const puppeteer = require('puppeteer');

async function testarAPIBackend() {
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

        // Testar endpoints diretos
        const testes = await page.evaluate(async () => {
            const token = localStorage.getItem('token');
            const resultados = {};
            
            console.log('🔑 Token:', token);
            
            // Teste 1: Endpoint normal /api/processos/4
            try {
                const res1 = await fetch('http://localhost:3001/api/processos/4', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                resultados.processos4 = {
                    status: res1.status,
                    statusText: res1.statusText,
                    data: res1.ok ? await res1.json() : await res1.text()
                };
            } catch (error) {
                resultados.processos4 = { error: error.message };
            }
            
            // Teste 2: Endpoint detalhes /api/processos/4/detalhes
            try {
                const res2 = await fetch('http://localhost:3001/api/processos/4/detalhes', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                resultados.detalhes = {
                    status: res2.status,
                    statusText: res2.statusText,
                    data: res2.ok ? await res2.json() : await res2.text()
                };
            } catch (error) {
                resultados.detalhes = { error: error.message };
            }
            
            // Teste 3: Endpoint usuarios /api/processos/4/usuarios
            try {
                const res3 = await fetch('http://localhost:3001/api/processos/4/usuarios', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                resultados.usuarios = {
                    status: res3.status,
                    statusText: res3.statusText,
                    data: res3.ok ? await res3.json() : await res3.text()
                };
            } catch (error) {
                resultados.usuarios = { error: error.message };
            }
            
            return resultados;
        });

        console.log('\n📋 Resultados dos testes:');
        console.log('\n1️⃣ GET /api/processos/4:');
        console.log(JSON.stringify(testes.processos4, null, 2));
        
        console.log('\n2️⃣ GET /api/processos/4/detalhes:');
        console.log(JSON.stringify(testes.detalhes, null, 2));
        
        console.log('\n3️⃣ GET /api/processos/4/usuarios:');
        console.log(JSON.stringify(testes.usuarios, null, 2));

    } catch (error) {
        console.error('❌ Erro:', error);
    } finally {
        await browser.close();
    }
}

testarAPIBackend().catch(console.error);
