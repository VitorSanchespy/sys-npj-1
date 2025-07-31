const puppeteer = require('puppeteer');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function debugElements() {
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized'] 
  });
  
  const page = await browser.newPage();
  
  try {
    // Fazer login
    await page.goto('http://localhost:5174/login');
    await sleep(2000);
    
    await page.type('#email', 'admin@teste.com');
    await page.type('#password', 'admin123');
    await page.click('button[type="submit"]');
    await sleep(3000);

    // Testar página de usuários
    console.log('\n=== TESTANDO PÁGINA DE USUÁRIOS ===');
    await page.goto('http://localhost:5174/usuarios');
    await sleep(3000);

    // Listar todos os elementos que contêm "add", "criar", "novo"
    const buttons = await page.evaluate(() => {
      const allButtons = document.querySelectorAll('button');
      const found = [];
      
      allButtons.forEach((btn, index) => {
        const text = btn.textContent.toLowerCase();
        const id = btn.id;
        const classes = btn.className;
        
        if (text.includes('add') || text.includes('criar') || text.includes('novo') || 
            id.includes('add') || id.includes('criar') || id.includes('novo')) {
          found.push({
            index,
            text: btn.textContent.trim(),
            id: btn.id,
            classes: btn.className,
            visible: btn.offsetParent !== null
          });
        }
      });
      
      return found;
    });

    console.log('Botões encontrados com "add/criar/novo":', buttons);

    // Listar elementos com IDs específicos
    const specificElements = await page.evaluate(() => {
      const elements = [
        '#btn-add-user',
        '#search-processes', 
        '#btn-add-process',
        '#btn-add-appointment',
        '#appointments-calendar',
        '#appointments-list',
        '#navigation-menu'
      ];
      
      const found = [];
      elements.forEach(selector => {
        const el = document.querySelector(selector);
        found.push({
          selector,
          exists: !!el,
          visible: el ? el.offsetParent !== null : false,
          text: el ? el.textContent.trim().substring(0, 50) : null
        });
      });
      
      return found;
    });

    console.log('\nElementos específicos:', specificElements);

    await sleep(5000); // Deixar visível para debug
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await browser.close();
  }
}

debugElements();
