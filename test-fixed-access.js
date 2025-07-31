const puppeteer = require('puppeteer');

async function testarAcessoCorrigido() {
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
            if (type === 'log' || type === 'error' || type === 'warn') {
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

        // Verificar o que aconteceu
        const pageStatus = await page.evaluate(() => {
            const info = {};
            
            info.currentUrl = window.location.href;
            info.title = document.title;
            
            // Verificar se tem erro
            const errorElement = document.querySelector('.text-red-600, .text-red-500');
            if (errorElement) {
                info.error = errorElement.textContent;
                info.hasError = true;
            } else {
                info.hasError = false;
            }
            
            // Verificar se tem conteúdo do processo
            const processTitle = document.querySelector('h1, h2');
            if (processTitle) {
                info.processTitle = processTitle.textContent;
            }
            
            // Verificar se tem carregamento
            info.isLoading = !!document.querySelector('.animate-spin');
            
            // Verificar estrutura da página
            info.hasContent = document.querySelectorAll('.bg-white, .bg-gray-50').length > 0;
            info.elementCount = document.querySelectorAll('*').length;
            
            // Capturar uma amostra do conteúdo
            info.bodyContent = document.body.textContent.substring(0, 500);
            
            return info;
        });

        console.log('\n📋 Status da página:');
        console.log('URL:', pageStatus.currentUrl);
        console.log('Título:', pageStatus.title);
        console.log('Tem erro:', pageStatus.hasError);
        console.log('Erro:', pageStatus.error || 'Nenhum');
        console.log('Título do processo:', pageStatus.processTitle || 'Não encontrado');
        console.log('Está carregando:', pageStatus.isLoading);
        console.log('Tem conteúdo:', pageStatus.hasContent);
        console.log('Número de elementos:', pageStatus.elementCount);
        console.log('\nPrimeiros 500 caracteres do conteúdo:');
        console.log(pageStatus.bodyContent);

        // Fazer screenshot
        await page.screenshot({ 
            path: 'processo-4-funcionando.png', 
            fullPage: true 
        });
        console.log('\n📸 Screenshot salvo: processo-4-funcionando.png');

        if (!pageStatus.hasError && pageStatus.hasContent) {
            console.log('\n🎉 SUCESSO! O processo 4 está carregando corretamente!');
        } else if (pageStatus.hasError) {
            console.log('\n❌ Ainda há erro:', pageStatus.error);
        } else {
            console.log('\n⚠️ Página carregou mas pode estar sem conteúdo');
        }

    } catch (error) {
        console.error('❌ Erro durante o teste:', error);
    } finally {
        // Aguardar 5 segundos para visualização
        await new Promise(resolve => setTimeout(resolve, 5000));
        await browser.close();
    }
}

testarAcessoCorrigido().catch(console.error);
