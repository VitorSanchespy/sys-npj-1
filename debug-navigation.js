const puppeteer = require('puppeteer');

async function debugNavigation() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  // Capturar todos os logs do console
  page.on('console', msg => {
    console.log('CONSOLE:', msg.type(), msg.text());
  });
  
  // Capturar erros
  page.on('pageerror', error => {
    console.log('PAGE ERROR:', error.message);
  });
  
  try {
    console.log('Navegando para localhost:5173...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0', timeout: 10000 });
    
    console.log('Aguardando 2 segundos...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Verificar se há elementos de navegação
    const navigationExists = await page.$('#navigation-menu');
    console.log('Navigation menu exists:', !!navigationExists);
    
    // Verificar quantos itens de menu existem
    const menuItems = await page.$$('[data-testid^="menu-item-"]');
    console.log('Menu items count:', menuItems.length);
    
    // Verificar se há um usuário logado
    const userInfo = await page.$('[data-testid="user-info-section"]');
    console.log('User info section exists:', !!userInfo);
    
    // Tentar fazer login se não houver usuário
    const isLoginPage = await page.$('input[type="email"]');
    if (isLoginPage) {
      console.log('Detectada página de login, fazendo login...');
      await page.type('input[type="email"]', 'admin@teste.com');
      await page.type('input[type="password"]', '123456');
      await page.click('button[type="submit"]');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Verificar novamente após login
      const navigationAfterLogin = await page.$('#navigation-menu');
      console.log('Navigation menu after login:', !!navigationAfterLogin);
      
      const menuItemsAfterLogin = await page.$$('[data-testid^="menu-item-"]');
      console.log('Menu items after login:', menuItemsAfterLogin.length);
    }
    
    // Verificar localStorage
    const localStorage = await page.evaluate(() => {
      return {
        user: localStorage.getItem('user'),
        token: localStorage.getItem('token')
      };
    });
    console.log('LocalStorage user:', !!localStorage.user);
    console.log('LocalStorage token:', !!localStorage.token);
    
    if (localStorage.user) {
      const user = JSON.parse(localStorage.user);
      console.log('User role_id:', user.role_id);
      console.log('User role:', user.role);
    }
    
  } catch (error) {
    console.error('Erro:', error.message);
  }
  
  await browser.close();
}

debugNavigation().catch(console.error);
