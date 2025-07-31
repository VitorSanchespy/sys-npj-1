const puppeteer = require('puppeteer');

async function testProcessDetailFix() {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: { width: 1920, height: 1080 },
        devtools: true
    });

    try {
        const page = await browser.newPage();
        
        // Capturar logs do console
        page.on('console', (msg) => {
            const type = msg.type();
            const text = msg.text();
            if (type === 'log' || type === 'error' || type === 'warn') {
                console.log(`[${type.toUpperCase()}] ${text}`);
            }
        });

        console.log('🔹 Acessando página de login...');
        await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });

        // Fazer login
        await page.waitForSelector('input[type="email"], #email', { timeout: 10000 });
        
        const emailField = await page.$('input[type="email"]') || await page.$('#email');
        if (emailField) {
            await page.type('input[type="email"], #email', 'professor@test.com');
        }

        const passwordField = await page.$('input[type="password"]') || await page.$('#password');
        if (passwordField) {
            await page.type('input[type="password"], #password', 'senha123');
        }

        await page.click('button[type="submit"]');
        await page.waitForNavigation({ waitUntil: 'networkidle0' });

        console.log('✅ Login realizado com sucesso');

        // Navegar para o processo 4
        console.log('🔹 Navegando para processo ID 4...');
        await page.goto('http://localhost:5173/processos/4', { waitUntil: 'networkidle0' });

        // Aguardar um momento para carregamento
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Verificar estado da página
        const pageInfo = await page.evaluate(() => {
            const info = {};
            
            // Verificar URL atual
            info.currentUrl = window.location.href;
            
            // Verificar se há elementos de loading
            info.hasLoader = !!document.querySelector('.animate-spin');
            
            // Verificar se há erro
            const errorElement = document.querySelector('.text-red-600');
            if (errorElement) {
                info.error = errorElement.textContent;
            }
            
            // Verificar se há conteúdo do processo
            const processTitle = document.querySelector('h1');
            if (processTitle) {
                info.processTitle = processTitle.textContent;
            }
            
            // Verificar se há cards de informação
            info.hasInfoCards = document.querySelectorAll('.bg-gray-50').length > 0;
            
            // Contar elementos na página
            info.elementCounts = {
                buttons: document.querySelectorAll('button').length,
                divs: document.querySelectorAll('div').length,
                paragraphs: document.querySelectorAll('p').length
            };
            
            return info;
        });

        console.log('\n📋 Informações da página:');
        console.log('URL atual:', pageInfo.currentUrl);
        console.log('Carregando:', pageInfo.hasLoader ? 'Sim' : 'Não');
        console.log('Erro:', pageInfo.error || 'Nenhum');
        console.log('Título do processo:', pageInfo.processTitle || 'Não encontrado');
        console.log('Cards de informação:', pageInfo.hasInfoCards ? 'Sim' : 'Não');
        console.log('Elementos na página:', pageInfo.elementCounts);

        // Fazer screenshot
        await page.screenshot({ 
            path: 'process-detail-fix-test.png', 
            fullPage: true 
        });
        console.log('\n📸 Screenshot salvo como: process-detail-fix-test.png');

        // Se não há erro, testar interações
        if (!pageInfo.error) {
            console.log('\n🔹 Testando botões de navegação...');
            
            // Tentar clicar no botão voltar
            const backButton = await page.$('button:contains("Voltar")');
            if (backButton) {
                console.log('✅ Botão voltar encontrado');
            }
            
            // Verificar botão editar (se existir)
            const editButton = await page.$('button:contains("Editar")');
            if (editButton) {
                console.log('✅ Botão editar encontrado');
            }
        }

        console.log('\n✅ Teste concluído!');
        
    } catch (error) {
        console.error('❌ Erro durante o teste:', error);
    } finally {
        // Manter aberto por 10 segundos para visualização
        await new Promise(resolve => setTimeout(resolve, 10000));
        await browser.close();
    }
}

// Executar o teste
testProcessDetailFix().catch(console.error);
