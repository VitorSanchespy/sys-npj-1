const puppeteer = require('puppeteer');

async function testeFinal() {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: { width: 1920, height: 1080 }
    });

    try {
        const page = await browser.newPage();
        
        // Capturar logs importantes
        page.on('console', (msg) => {
            const text = msg.text();
            if (text.includes('Error') || text.includes('500') || text.includes('404')) {
                console.log(`[ERROR] ${text}`);
            }
        });

        console.log('🔹 Fazendo login como admin...');
        await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });

        await page.waitForSelector('input[type="email"]');
        await page.type('input[type="email"]', 'admin@teste.com');
        await page.type('input[type="password"]', 'admin123');
        await page.click('button[type="submit"]');
        await page.waitForNavigation({ waitUntil: 'networkidle0' });

        console.log('✅ Login realizado como admin');

        // Navegar para processo 1
        console.log('\n🔹 Navegando para processo 1...');
        await page.goto('http://localhost:5173/processos/1', { waitUntil: 'networkidle0' });
        
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Verificar se a página carregou corretamente
        const pageInfo = await page.evaluate(() => {
            const info = {};
            
            // Verificar se tem título do processo
            const h1 = document.querySelector('h1');
            if (h1 && h1.textContent.includes('Processo')) {
                info.hasProcessTitle = true;
                info.processTitle = h1.textContent;
            } else {
                info.hasProcessTitle = false;
            }
            
            // Verificar botões
            const buttons = Array.from(document.querySelectorAll('button'));
            info.buttons = buttons.map(btn => btn.textContent.trim());
            info.hasEditButton = buttons.some(btn => btn.textContent.includes('Editar'));
            info.hasVincularButton = buttons.some(btn => btn.textContent.includes('Vincular'));
            
            // Verificar se há erro
            const errorElement = document.querySelector('.text-red-600, .text-red-500');
            if (errorElement) {
                info.error = errorElement.textContent;
            }
            
            return info;
        });

        console.log('\n📋 Resultado final:');
        console.log('Tem título do processo:', pageInfo.hasProcessTitle);
        console.log('Título:', pageInfo.processTitle || 'Não encontrado');
        console.log('Tem botão Editar:', pageInfo.hasEditButton);
        console.log('Tem botão Vincular:', pageInfo.hasVincularButton);
        console.log('Erro:', pageInfo.error || 'Nenhum');
        console.log('Botões encontrados:', pageInfo.buttons);

        if (pageInfo.hasProcessTitle && pageInfo.hasEditButton) {
            console.log('\n🎉 SUCESSO! A página está funcionando corretamente!');
            
            // Testar clique no botão Vincular se existir
            if (pageInfo.hasVincularButton) {
                console.log('\n🔹 Testando botão Vincular...');
                try {
                    await page.click('button:contains("Vincular")');
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    
                    const modalInfo = await page.evaluate(() => {
                        return {
                            hasModal: !!document.querySelector('[style*="position: fixed"]'),
                            modalContent: document.querySelector('[style*="position: fixed"]')?.textContent?.substring(0, 200)
                        };
                    });
                    
                    console.log('Modal aberto:', modalInfo.hasModal);
                    if (modalInfo.hasModal) {
                        console.log('Conteúdo do modal:', modalInfo.modalContent);
                    }
                } catch (e) {
                    console.log('Erro ao testar modal:', e.message);
                }
            }
        } else {
            console.log('\n❌ Ainda há problemas na página');
        }

        await page.screenshot({ 
            path: 'teste-final-processo.png', 
            fullPage: true 
        });
        console.log('\n📸 Screenshot salvo: teste-final-processo.png');

    } catch (error) {
        console.error('❌ Erro durante o teste:', error);
    } finally {
        await new Promise(resolve => setTimeout(resolve, 3000));
        await browser.close();
    }
}

testeFinal().catch(console.error);
