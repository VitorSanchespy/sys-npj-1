const puppeteer = require('puppeteer');

async function testeFrontend() {
  console.log('🌐 TESTE FRONTEND - SISTEMA NPJ DOCKER');
  console.log('====================================');
  
  let browser = null;
  let totalTestes = 0;
  let testesPassaram = 0;
  
  function logTeste(nome, sucesso, detalhes = '') {
    totalTestes++;
    if (sucesso) {
      testesPassaram++;
      console.log(`✅ ${nome} ${detalhes}`);
    } else {
      console.log(`❌ ${nome} ${detalhes}`);
    }
  }
  
  try {
    // Inicializar navegador
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    
    console.log('\n🔗 TESTES DE CONECTIVIDADE');
    console.log('-------------------------');
    
    // 1. Acessar página inicial
    try {
      await page.goto('http://localhost:5173', { waitUntil: 'networkidle0', timeout: 10000 });
      const title = await page.title();
      logTeste('Carregar página inicial', true, `(${title})`);
    } catch (error) {
      logTeste('Carregar página inicial', false, `Erro: ${error.message}`);
      return;
    }
    
    console.log('\n🔐 TESTES DE LOGIN');
    console.log('------------------');
    
    // 2. Verificar elementos de login
    const emailInput = await page.$('input[type="email"]');
    const passwordInput = await page.$('input[type="password"]');
    const loginButton = await page.$('button[type="submit"]');
    
    logTeste('Elementos de login presentes', emailInput && passwordInput && loginButton);
    
    if (emailInput && passwordInput && loginButton) {
      // 3. Tentar login
      await page.type('input[type="email"]', 'teste@backend.docker');
      await page.type('input[type="password"]', '123456');
      
      // Aguardar e clicar no botão de login
      await page.click('button[type="submit"]');
      
      // Aguardar redirecionamento ou resposta
      await page.waitForTimeout(3000);
      
      // Verificar se o login foi bem-sucedido (pode ser por URL ou elementos na página)
      const currentUrl = page.url();
      const hasToken = await page.evaluate(() => localStorage.getItem('token') !== null);
      
      logTeste('Login realizado', hasToken || !currentUrl.includes('login'), `URL: ${currentUrl}`);
      
      if (hasToken || !currentUrl.includes('login')) {
        console.log('\n📋 TESTES DE NAVEGAÇÃO');
        console.log('---------------------');
        
        // 4. Verificar elementos do dashboard/página principal
        await page.waitForTimeout(2000);
        
        // Verificar se há elementos típicos de um dashboard
        const navElements = await page.$$('nav, .navbar, [role="navigation"]');
        const mainContent = await page.$('main, .main-content, .container');
        
        logTeste('Elementos de navegação carregados', navElements.length > 0);
        logTeste('Conteúdo principal carregado', mainContent !== null);
        
        // 5. Tentar acessar diferentes seções (se existirem links)
        const links = await page.$$eval('a[href]', links => 
          links.map(link => ({
            text: link.textContent.trim(),
            href: link.getAttribute('href')
          })).filter(link => link.text && !link.href.startsWith('#'))
        );
        
        logTeste('Links de navegação encontrados', links.length > 0, `(${links.length} links)`);
        
        console.log('\n🎨 TESTES DE INTERFACE');
        console.log('----------------------');
        
        // 6. Verificar responsividade básica
        await page.setViewport({ width: 768, height: 1024 }); // Tablet
        await page.waitForTimeout(1000);
        
        const isMobileResponsive = await page.evaluate(() => {
          const body = document.body;
          return body.scrollWidth <= window.innerWidth * 1.1; // Permitir 10% de overflow
        });
        
        logTeste('Responsividade mobile/tablet', isMobileResponsive);
        
        await page.setViewport({ width: 1920, height: 1080 }); // Voltar ao desktop
        
        // 7. Verificar se há erros JavaScript
        const jsErrors = [];
        page.on('pageerror', error => jsErrors.push(error.message));
        
        await page.reload({ waitUntil: 'networkidle0' });
        await page.waitForTimeout(2000);
        
        logTeste('Sem erros JavaScript críticos', jsErrors.length === 0, 
          jsErrors.length > 0 ? `(${jsErrors.length} erros)` : '');
        
        console.log('\n🔌 TESTES DE API');
        console.log('----------------');
        
        // 8. Verificar se as requisições para API estão funcionando
        const apiCalls = [];
        page.on('response', response => {
          if (response.url().includes('localhost:3001')) {
            apiCalls.push({
              url: response.url(),
              status: response.status()
            });
          }
        });
        
        // Forçar algumas requisições (recarregar página)
        await page.reload({ waitUntil: 'networkidle0' });
        await page.waitForTimeout(3000);
        
        const successfulApiCalls = apiCalls.filter(call => call.status >= 200 && call.status < 400);
        logTeste('Comunicação com API funcionando', successfulApiCalls.length > 0, 
          `(${successfulApiCalls.length}/${apiCalls.length} chamadas OK)`);
        
        // 9. Teste de logout (se existir botão)
        const logoutElements = await page.$$eval('*', elements => 
          elements.filter(el => 
            el.textContent && (
              el.textContent.toLowerCase().includes('sair') ||
              el.textContent.toLowerCase().includes('logout') ||
              el.textContent.toLowerCase().includes('desconectar')
            )
          ).length
        );
        
        logTeste('Opção de logout presente', logoutElements > 0);
      }
    }
    
  } catch (error) {
    console.log('❌ Erro durante os testes:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
  
  // === RESULTADO FINAL ===
  console.log('\n🎯 RESULTADO FINAL DO TESTE FRONTEND');
  console.log('===================================');
  console.log(`✅ Testes que passaram: ${testesPassaram}`);
  console.log(`❌ Testes que falharam: ${totalTestes - testesPassaram}`);
  console.log(`📊 Taxa de sucesso: ${Math.round((testesPassaram / totalTestes) * 100)}%`);
  console.log(`🎲 Total de testes: ${totalTestes}`);
  
  if (testesPassaram === totalTestes) {
    console.log('\n🎉 TODOS OS TESTES DE FRONTEND PASSARAM! INTERFACE 100% FUNCIONAL! 🎉');
  } else if (testesPassaram / totalTestes > 0.8) {
    console.log('\n🟢 FRONTEND PRATICAMENTE COMPLETO! Apenas pequenos ajustes necessários.');
  } else if (testesPassaram / totalTestes > 0.6) {
    console.log('\n🟡 FRONTEND FUNCIONAL, mas precisa de algumas correções.');
  } else {
    console.log('\n🔴 FRONTEND PRECISA DE CORREÇÕES SIGNIFICATIVAS.');
  }
  
  console.log('\n💡 DICA: Para testes mais detalhados, considere usar ferramentas como Cypress ou Playwright.');
}

testeFrontend();
