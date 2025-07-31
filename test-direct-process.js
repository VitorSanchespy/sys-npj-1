const puppeteer = require('puppeteer');

async function testProcessDetailPageDirect() {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: { width: 1920, height: 1080 }
    });

    try {
        const page = await browser.newPage();
        
        console.log('🔹 Navegando diretamente para página de detalhes...');
        await page.goto('http://localhost:5173/processos/1', { waitUntil: 'networkidle0' });
        
        // Aguardar um momento para ver o que acontece
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Verificar URL atual (se foi redirecionado)
        const currentUrl = page.url();
        console.log(`📍 URL atual: ${currentUrl}`);
        
        // Verificar se está na página de login
        if (currentUrl.includes('/login')) {
            console.log('🔹 Redirecionado para login - fazendo login...');
            
            // Aguardar campos aparecerem
            await page.waitForSelector('input[type="email"], input[name="email"], #email', { timeout: 5000 });
            
            // Tentar diferentes seletores para email
            const emailSelectors = ['#email', 'input[type="email"]', 'input[name="email"]', '[data-testid="email"]'];
            let emailField = null;
            
            for (const selector of emailSelectors) {
                try {
                    emailField = await page.$(selector);
                    if (emailField) {
                        console.log(`✅ Campo email encontrado com seletor: ${selector}`);
                        break;
                    }
                } catch (e) {
                    continue;
                }
            }
            
            if (emailField) {
                await page.type(emailSelectors[emailSelectors.findIndex(s => emailField)], 'professor@test.com');
                
                // Encontrar campo de senha
                const passwordSelectors = ['#password', 'input[type="password"]', 'input[name="password"]'];
                for (const selector of passwordSelectors) {
                    try {
                        const passwordField = await page.$(selector);
                        if (passwordField) {
                            await page.type(selector, 'senha123');
                            console.log(`✅ Senha digitada com seletor: ${selector}`);
                            break;
                        }
                    } catch (e) {
                        continue;
                    }
                }
                
                // Clicar em submit
                await page.click('button[type="submit"]');
                await page.waitForNavigation({ waitUntil: 'networkidle0' });
                
                // Tentar novamente acessar a página de processo
                await page.goto('http://localhost:5173/processos/1', { waitUntil: 'networkidle0' });
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
        
        // Verificar estado atual da página
        const finalUrl = page.url();
        console.log(`📍 URL final: ${finalUrl}`);
        
        const pageContent = await page.evaluate(() => {
            const info = [];
            
            // Verificar título da página
            const title = document.title;
            info.push(`Título: ${title}`);
            
            // Verificar se há elementos de processo
            const processTitle = document.querySelector('h1');
            if (processTitle) {
                info.push(`H1: ${processTitle.textContent.trim()}`);
            }
            
            // Verificar estado da página
            const loading = document.querySelector('.animate-spin');
            const error = document.querySelector('.bg-red-50');
            const success = document.querySelector('.max-w-6xl');
            
            if (loading) {
                info.push('Estado: Carregando...');
            } else if (error) {
                const errorText = error.querySelector('h2')?.textContent || 'Erro desconhecido';
                info.push(`Estado: Erro - ${errorText}`);
                const errorDetails = error.querySelector('p')?.textContent || '';
                if (errorDetails) info.push(`Detalhes: ${errorDetails}`);
            } else if (success) {
                info.push('Estado: Página carregada com sucesso!');
                
                // Contar elementos
                const cards = document.querySelectorAll('.bg-white.border');
                const buttons = document.querySelectorAll('button');
                info.push(`Cards: ${cards.length}`);
                info.push(`Botões: ${buttons.length}`);
            } else {
                info.push('Estado: Desconhecido');
                info.push(`Body content: ${document.body.textContent.substring(0, 100)}...`);
            }
            
            return info;
        });
        
        console.log('\n📋 Informações da página:');
        pageContent.forEach(info => console.log(`   ${info}`));
        
        // Screenshot
        await page.screenshot({ 
            path: 'process-detail-direct-test.png', 
            fullPage: true 
        });
        console.log('\n📸 Screenshot salvo como: process-detail-direct-test.png');
        
        console.log('\n✅ Teste direto concluído!');
        
    } catch (error) {
        console.error('❌ Erro durante o teste:', error);
    } finally {
        // Manter aberto por 5 segundos para visualização
        await new Promise(resolve => setTimeout(resolve, 5000));
        await browser.close();
    }
}

// Executar o teste
testProcessDetailPageDirect();
