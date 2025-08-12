// 🚀 TESTE DE DEBUG DO LOGIN - SISTEMA NPJ
// Teste específico para identificar problemas no login do frontend

const puppeteer = require('puppeteer');

const FRONTEND_URL = 'http://localhost:5173';
const BACKEND_URL = 'http://localhost:3001';

const testUser = {
  email: 'admin@teste.com',
  senha: 'admin123'
};

async function debugLogin() {
  console.log('🔍 INICIANDO DEBUG DO LOGIN');
  console.log('================================');
  
  let browser;
  
  try {
    // Inicializar browser
    browser = await puppeteer.launch({
      headless: false, // Mostrar o browser para debug
      defaultViewport: { width: 1920, height: 1080 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Capturar erros do console
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      console.log(`🔍 Console ${type.toUpperCase()}: ${text}`);
    });

    // Capturar erros de página
    page.on('pageerror', error => {
      console.log(`❌ Page Error: ${error.message}`);
    });

    // Capturar falhas de rede
    page.on('requestfailed', request => {
      console.log(`🌐 Network Error: ${request.url()} - ${request.failure()?.errorText}`);
    });

    // Capturar todas as requisições
    page.on('request', request => {
      if (request.url().includes('auth/login')) {
        console.log(`📡 LOGIN REQUEST:`, {
          url: request.url(),
          method: request.method(),
          headers: request.headers(),
          postData: request.postData()
        });
      }
    });

    // Capturar todas as respostas
    page.on('response', response => {
      if (response.url().includes('auth/login')) {
        console.log(`📡 LOGIN RESPONSE:`, {
          url: response.url(),
          status: response.status(),
          statusText: response.statusText()
        });
      }
    });

    console.log('🔐 Navegando para página de login...');
    await page.goto(`${FRONTEND_URL}/login`, { waitUntil: 'networkidle0' });
    
    // Aguardar um pouco para a página carregar
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Verificar se elementos de login existem
    console.log('🔍 Verificando elementos de login...');
    
    const emailInput = await page.$('input[type="email"], input[name="email"], #email');
    const passwordInput = await page.$('input[type="password"], input[name="senha"], #senha');
    const loginButton = await page.$('button[type="submit"], .login-btn, .btn-login');

    console.log('📋 Elementos encontrados:', {
      emailInput: !!emailInput,
      passwordInput: !!passwordInput,
      loginButton: !!loginButton
    });

    if (!emailInput || !passwordInput || !loginButton) {
      console.log('❌ Elementos de login não encontrados');
      
      // Buscar elementos alternativos
      const allInputs = await page.$$eval('input', inputs => 
        inputs.map(input => ({
          type: input.type,
          name: input.name,
          id: input.id,
          placeholder: input.placeholder,
          className: input.className
        }))
      );
      
      const allButtons = await page.$$eval('button', buttons => 
        buttons.map(button => ({
          type: button.type,
          textContent: button.textContent,
          className: button.className,
          id: button.id
        }))
      );
      
      console.log('🔍 Todos os inputs na página:', allInputs);
      console.log('🔍 Todos os buttons na página:', allButtons);
      
      return;
    }

    console.log('✅ Elementos de login encontrados, preenchendo formulário...');

    // Preencher formulário
    await emailInput.click();
    await emailInput.type(testUser.email, { delay: 100 });
    
    await passwordInput.click();
    await passwordInput.type(testUser.senha, { delay: 100 });
    
    console.log('📝 Formulário preenchido, clicando no botão de login...');
    
    // Aguardar resposta do login
    const loginPromise = page.waitForResponse(response => 
      response.url().includes('auth/login') && response.request().method() === 'POST'
    );
    
    // Clicar no botão de login
    await loginButton.click();
    
    console.log('🔄 Aguardando resposta do servidor...');
    
    try {
      const response = await loginPromise;
      const responseBody = await response.text();
      
      console.log('📡 Resposta do login:', {
        status: response.status(),
        statusText: response.statusText(),
        body: responseBody
      });
      
      if (response.status() === 200) {
        console.log('✅ Login realizado com sucesso no backend');
        
        // Aguardar redirecionamento
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const currentUrl = page.url();
        console.log('📍 URL atual após login:', currentUrl);
        
        if (currentUrl.includes('/login')) {
          console.log('❌ Ainda na página de login - problema no frontend');
        } else {
          console.log('✅ Redirecionamento realizado com sucesso');
        }
        
      } else {
        console.log('❌ Erro no login:', response.status(), response.statusText());
      }
      
    } catch (timeoutError) {
      console.log('⏰ Timeout aguardando resposta do login');
    }

  } catch (error) {
    console.log(`❌ Erro geral no teste: ${error.message}`);
  } finally {
    if (browser) {
      console.log('🔄 Mantendo browser aberto para debug. Pressione Ctrl+C para finalizar.');
      // Não fechar o browser para permitir debug manual
      // await browser.close();
    }
  }
}

// Executar debug
debugLogin().catch(console.error);
