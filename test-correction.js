const puppeteer = require('puppeteer');

async function testarCorrecaoEndpoint() {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: { width: 1920, height: 1080 }
    });

    try {
        const page = await browser.newPage();
        
        // Capturar logs do console
        page.on('console', (msg) => {
            const type = msg.type();
            const text = msg.text();
            if (type === 'error' || text.includes('500') || text.includes('Error')) {
                console.log(`[${type.toUpperCase()}] ${text}`);
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

        // Navegar para o processo 4
        console.log('\n🔹 Navegando para /processos/4...');
        await page.goto('http://localhost:5173/processos/4', { waitUntil: 'networkidle0' });

        // Aguardar carregamento
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Verificar se houve erro
        const pageStatus = await page.evaluate(() => {
            const info = {};
            
            info.currentUrl = window.location.href;
            
            // Verificar se tem erro 500
            const errorElement = document.querySelector('.text-red-600, .text-red-500');
            if (errorElement) {
                info.error = errorElement.textContent;
                info.hasError = true;
            } else {
                info.hasError = false;
            }
            
            // Verificar se tem conteúdo do processo
            const processTitle = document.querySelector('h1');
            if (processTitle && processTitle.textContent.includes('Processo')) {
                info.processTitle = processTitle.textContent;
                info.hasProcess = true;
            } else {
                info.hasProcess = false;
            }
            
            // Verificar se está carregando
            info.isLoading = !!document.querySelector('.animate-spin');
            
            // Verificar se tem cards de informação
            info.hasInfoCards = document.querySelectorAll('.bg-gray-50').length > 0;
            
            return info;
        });

        console.log('\n📋 Status da página:');
        console.log('URL:', pageStatus.currentUrl);
        console.log('Tem erro:', pageStatus.hasError);
        console.log('Erro:', pageStatus.error || 'Nenhum');
        console.log('Título do processo:', pageStatus.processTitle || 'Não encontrado');
        console.log('Tem processo:', pageStatus.hasProcess);
        console.log('Está carregando:', pageStatus.isLoading);
        console.log('Tem cards:', pageStatus.hasInfoCards);

        if (pageStatus.hasProcess && !pageStatus.hasError) {
            console.log('\n🎉 SUCESSO! O erro 500 foi corrigido!');
        } else if (pageStatus.hasError) {
            console.log('\n❌ Ainda há erro:', pageStatus.error);
        } else {
            console.log('\n⚠️ Página sem conteúdo do processo');
        }

        // Screenshot para verificação
        await page.screenshot({ 
            path: 'processo-4-corrigido.png', 
            fullPage: true 
        });
        console.log('\n📸 Screenshot salvo: processo-4-corrigido.png');

    } catch (error) {
        console.error('❌ Erro durante o teste:', error);
    } finally {
        await new Promise(resolve => setTimeout(resolve, 3000));
        await browser.close();
    }
}

testarCorrecaoEndpoint().catch(console.error);
