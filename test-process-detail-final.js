const puppeteer = require('puppeteer');

async function testProcessDetailPage() {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: { width: 1920, height: 1080 }
    });

    try {
        const page = await browser.newPage();
        
        console.log('🔹 Navegando para página de login...');
        await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
        
        console.log('🔹 Fazendo login como professor...');
        await page.type('#email', 'professor@test.com');
        await page.type('#password', 'senha123');
        await page.click('button[type="submit"]');
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
        
        console.log('🔹 Navegando para página de detalhes do processo...');
        await page.goto('http://localhost:5173/processos/1', { waitUntil: 'networkidle0' });
        
        // Aguardar carregar
        await page.waitForTimeout(2000);
        
        // Verificar se a página carregou corretamente
        const pageTitle = await page.title();
        console.log(`✅ Título da página: ${pageTitle}`);
        
        // Verificar se há elementos esperados da nova página
        const headerElements = await page.evaluate(() => {
            const elements = [];
            
            // Verificar se há título de processo
            const processTitle = document.querySelector('h1');
            if (processTitle) {
                elements.push(`Título encontrado: ${processTitle.textContent.trim()}`);
            }
            
            // Verificar se há botões de ação
            const actionButtons = document.querySelectorAll('button');
            elements.push(`Botões encontrados: ${actionButtons.length}`);
            
            // Verificar se há cards de informação
            const infoCards = document.querySelectorAll('.bg-white.border');
            elements.push(`Cards de informação: ${infoCards.length}`);
            
            // Verificar se há loading ou erro
            const loadingElement = document.querySelector('.animate-spin');
            const errorElement = document.querySelector('.bg-red-50');
            
            if (loadingElement) {
                elements.push('⏳ Estado: Carregando');
            } else if (errorElement) {
                const errorText = errorElement.textContent;
                elements.push(`❌ Estado: Erro - ${errorText}`);
            } else {
                elements.push('✅ Estado: Página carregada com sucesso');
            }
            
            return elements;
        });
        
        console.log('\n📋 Elementos da página:');
        headerElements.forEach(element => console.log(`   ${element}`));
        
        // Tirar screenshot para verificação visual
        await page.screenshot({ 
            path: 'process-detail-page-test.png', 
            fullPage: true 
        });
        console.log('\n📸 Screenshot salvo como: process-detail-page-test.png');
        
        // Testar botões de navegação
        console.log('\n🔹 Testando botões de navegação...');
        
        const buttonTests = await page.evaluate(() => {
            const buttons = [];
            const allButtons = document.querySelectorAll('button');
            
            allButtons.forEach((btn, index) => {
                const text = btn.textContent.trim();
                const classes = btn.className;
                buttons.push({
                    index: index + 1,
                    text: text,
                    disabled: btn.disabled,
                    visible: btn.offsetParent !== null
                });
            });
            
            return buttons;
        });
        
        buttonTests.forEach(btn => {
            console.log(`   Botão ${btn.index}: "${btn.text}" - ${btn.disabled ? 'Desabilitado' : 'Habilitado'} - ${btn.visible ? 'Visível' : 'Oculto'}`);
        });
        
        console.log('\n✅ Teste da página de detalhes do processo concluído!');
        
    } catch (error) {
        console.error('❌ Erro durante o teste:', error);
    } finally {
        await browser.close();
    }
}

// Executar o teste
testProcessDetailPage();
