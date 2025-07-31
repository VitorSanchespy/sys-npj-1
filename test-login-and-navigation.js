const puppeteer = require('puppeteer')        await page.type('input[type="email"], input[name="email"]', 'teste@teste.com');
        await page.type('input[type="password"], input[name="password"]', '123456');

async function testLoginAndNavigation() {
    console.log('🔍 Testando login e navegação para /processos/1...');
    
    const browser = await puppeteer.launch({ 
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized'],
        slowMo: 100 // Adicionar delay para visualizar melhor
    });
    
    try {
        const page = await browser.newPage();
        
        // Interceptar requests para debug
        page.on('console', msg => {
            console.log('🖥️ Browser Console:', msg.text());
        });
        
        page.on('response', response => {
            if (response.status() >= 400) {
                console.log('❌ Response Error:', response.status(), response.url());
            }
        });
        
        // 1. Ir para a página de login
        console.log('📍 Navegando para página de login...');
        await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 2. Preencher formulário de login
        console.log('🔐 Preenchendo formulário de login...');
        
        // Aguardar campos aparecerem
        await page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 10000 });
        
        await page.type('input[type="email"], input[name="email"]', 'admin@teste.com');
        await page.type('input[type="password"], input[name="password"]', '123456');
        
        // 3. Fazer login
        console.log('🔑 Fazendo login...');
        await page.click('button[type="submit"], input[type="submit"]');
        
        // Aguardar redirecionamento após login
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const currentUrl = page.url();
        console.log('📍 URL após login:', currentUrl);
        
        // 4. Verificar se logou com sucesso
        if (currentUrl.includes('/dashboard') || currentUrl.includes('/')) {
            console.log('✅ Login realizado com sucesso!');
        } else {
            console.log('❌ Falha no login');
            return;
        }
        
        // 5. Agora tentar navegar para /processos/1
        console.log('📍 Navegando para /processos/1...');
        await page.goto('http://localhost:5173/processos/1', { 
            waitUntil: 'networkidle2',
            timeout: 10000 
        });
        
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const finalUrl = page.url();
        console.log('📍 URL final:', finalUrl);
        
        // 6. Verificar resultado
        if (finalUrl.includes('/processos/1')) {
            console.log('✅ Navegação para /processos/1 bem-sucedida!');
            
            // Verificar se a página carregou corretamente
            const pageTitle = await page.title();
            console.log('📄 Título da página:', pageTitle);
            
            // Procurar por elementos indicativos de que a página carregou
            const processContent = await page.$('h1, .process-title, .processo-detalhes, main');
            if (processContent) {
                const content = await page.evaluate(el => el.textContent, processContent);
                console.log('📄 Conteúdo encontrado:', content.substring(0, 100) + '...');
            }
            
        } else if (finalUrl.includes('/dashboard')) {
            console.log('⚠️ Redirecionado para dashboard - possível problema de permissão');
        } else if (finalUrl.includes('/login') || finalUrl === 'http://localhost:5173/') {
            console.log('❌ Redirecionado para login/home - usuário não autenticado');
        } else {
            console.log('⚠️ Redirecionado para:', finalUrl);
        }
        
        // 7. Aguardar para observação
        console.log('⏳ Aguardando 10 segundos para observação...');
        await new Promise(resolve => setTimeout(resolve, 10000));
        
    } catch (error) {
        console.error('❌ Erro durante o teste:', error.message);
    } finally {
        await browser.close();
    }
}

// Executar o teste
testLoginAndNavigation().catch(console.error);
