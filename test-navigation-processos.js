const puppeteer = require('puppeteer');

async function testNavigationToProcessos() {
    console.log('🔍 Iniciando teste de navegação para /processos/1...');
    
    const browser = await puppeteer.launch({ 
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized']
    });
    
    try {
        const page = await browser.newPage();
        
        // Interceptar requests para debug
        page.on('request', request => {
            console.log('📤 Request:', request.url());
        });
        
        page.on('response', response => {
            if (response.status() >= 400) {
                console.log('❌ Response Error:', response.status(), response.url());
            }
        });
        
        page.on('console', msg => {
            console.log('🖥️ Browser Console:', msg.text());
        });
        
        // Ir para a página inicial
        console.log('📍 Navegando para página inicial...');
        await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
        
        // Aguardar e fazer login se necessário
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const currentUrl = page.url();
        console.log('📍 URL atual:', currentUrl);
        
        // Verificar se tem formulário de login
        const loginForm = await page.$('#loginForm, form[action*="login"], input[type="email"]');
        if (loginForm) {
            console.log('🔐 Fazendo login...');
            
            // Tentar fazer login
            await page.type('input[type="email"], input[name="email"]', 'admin@admin.com');
            await page.type('input[type="password"], input[name="password"]', '123456');
            
            await page.click('button[type="submit"], input[type="submit"]');
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
        
        // Agora tentar navegar para /processos/1
        console.log('📍 Tentando navegar para /processos/1...');
        
        await page.goto('http://localhost:5173/processos/1', { 
            waitUntil: 'networkidle2',
            timeout: 10000 
        });
        
        // Aguardar um pouco para ver o que acontece
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const finalUrl = page.url();
        console.log('📍 URL final:', finalUrl);
        
        // Verificar se foi redirecionado
        if (finalUrl.includes('/dashboard') || finalUrl.includes('/login')) {
            console.log('⚠️ PROBLEMA DETECTADO: Redirecionamento indevido!');
            console.log('   - URL esperada: http://localhost:5173/processos/1');
            console.log('   - URL atual:', finalUrl);
            
            // Verificar se existe erro na página
            const errorElement = await page.$('.error, .alert-error, [class*="error"]');
            if (errorElement) {
                const errorText = await page.evaluate(el => el.textContent, errorElement);
                console.log('❌ Erro encontrado:', errorText);
            }
            
            // Verificar console do browser para erros
            const consoleLogs = await page.evaluate(() => {
                return console.log.toString();
            });
            
        } else if (finalUrl.includes('/processos/1')) {
            console.log('✅ Navegação bem-sucedida para /processos/1');
            
            // Verificar se a página carregou corretamente
            const pageTitle = await page.title();
            console.log('📄 Título da página:', pageTitle);
            
            const pageContent = await page.$('main, .container, .content, #root');
            if (pageContent) {
                console.log('✅ Conteúdo da página carregado');
            } else {
                console.log('⚠️ Conteúdo da página não encontrado');
            }
        }
        
        // Aguardar mais um pouco para observar
        console.log('⏳ Aguardando 5 segundos para observação...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
    } catch (error) {
        console.error('❌ Erro durante o teste:', error.message);
    } finally {
        await browser.close();
    }
}

// Executar o teste
testNavigationToProcessos().catch(console.error);
