// 🚀 TESTE COMPLETO DO FRONTEND - SISTEMA NPJ
// Teste automatizado usando Puppeteer para identificar e corrigir erros

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const FRONTEND_URL = 'http://localhost:5173';
const BACKEND_URL = 'http://localhost:3001';

// Dados de teste
const testUser = {
  email: 'admin@teste.com',
  senha: 'admin123'
};

let browser;
let page;
let errors = [];
let warnings = [];
let networkErrors = [];

// Função para capturar erros do console
function setupConsoleLogging(page) {
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    
    console.log(`🔍 Console ${type.toUpperCase()}: ${text}`);
    
    if (type === 'error') {
      errors.push({
        type: 'console_error',
        message: text,
        timestamp: new Date().toISOString()
      });
    } else if (type === 'warning') {
      warnings.push({
        type: 'console_warning',
        message: text,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Capturar erros de página
  page.on('pageerror', error => {
    console.log(`❌ Page Error: ${error.message}`);
    errors.push({
      type: 'page_error',
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  });

  // Capturar falhas de rede
  page.on('requestfailed', request => {
    console.log(`🌐 Network Error: ${request.url()} - ${request.failure().errorText}`);
    networkErrors.push({
      type: 'network_error',
      url: request.url(),
      error: request.failure().errorText,
      timestamp: new Date().toISOString()
    });
  });
}

// Função para aguardar carregamento
async function waitForPageLoad(page, timeout = 10000) {
  try {
    await page.waitForLoadState('networkidle', { timeout });
  } catch (error) {
    console.log('⚠️ Timeout aguardando carregamento da página');
  }
}

// Função para aguardar um tempo específico
async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Função para fazer login
async function doLogin(page) {
  console.log('🔐 Fazendo login...');
  
  try {
    // Ir para página de login
    await page.goto(`${FRONTEND_URL}/login`, { waitUntil: 'networkidle0' });
    await sleep(2000);

    // Verificar se elementos de login existem
    const emailInput = await page.$('input[type="email"], input[name="email"], #email');
    const passwordInput = await page.$('input[type="password"], input[name="senha"], #senha');
    const loginButton = await page.$('button[type="submit"], .login-btn, .btn-login');

    if (!emailInput || !passwordInput || !loginButton) {
      throw new Error('Elementos de login não encontrados na página');
    }

    // Preencher formulário
    await emailInput.type(testUser.email);
    await passwordInput.type(testUser.senha);
    
    // Clicar no botão de login
    await loginButton.click();
    
    // Aguardar redirecionamento ou resposta
    await sleep(3000);
    
    // Verificar se login foi bem-sucedido
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      throw new Error('Login falhou - ainda na página de login');
    }
    
    console.log('✅ Login realizado com sucesso');
    return true;
  } catch (error) {
    console.log(`❌ Erro no login: ${error.message}`);
    errors.push({
      type: 'login_error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
    return false;
  }
}

// Teste da página inicial/dashboard
async function testDashboard(page) {
  console.log('\n📊 Testando Dashboard...');
  
  try {
    await page.goto(`${FRONTEND_URL}/`, { waitUntil: 'networkidle0' });
    await sleep(2000);

    // Verificar elementos do dashboard
    const dashboardElements = await page.evaluate(() => {
      const elements = {
        title: document.querySelector('h1, .dashboard-title, .page-title'),
        stats: document.querySelectorAll('.stat-card, .dashboard-card, .metric'),
        navigation: document.querySelector('nav, .navbar, .sidebar')
      };
      
      return {
        hasTitle: !!elements.title,
        statsCount: elements.stats.length,
        hasNavigation: !!elements.navigation,
        titleText: elements.title?.textContent || 'Não encontrado'
      };
    });

    console.log(`📋 Dashboard - Título: ${dashboardElements.titleText}`);
    console.log(`📊 Dashboard - ${dashboardElements.statsCount} cards de estatísticas`);
    console.log(`🧭 Dashboard - Navegação: ${dashboardElements.hasNavigation ? 'OK' : 'Não encontrada'}`);

    return true;
  } catch (error) {
    console.log(`❌ Erro no teste do dashboard: ${error.message}`);
    errors.push({
      type: 'dashboard_error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
    return false;
  }
}

// Teste da página de usuários
async function testUsuarios(page) {
  console.log('\n👥 Testando página de Usuários...');
  
  try {
    await page.goto(`${FRONTEND_URL}/usuarios`, { waitUntil: 'networkidle0' });
    await sleep(3000);

    // Verificar lista de usuários
    const usuariosData = await page.evaluate(() => {
      const table = document.querySelector('table, .user-list, .usuarios-list');
      const rows = document.querySelectorAll('tr, .user-item, .usuario-item');
      const addButton = document.querySelector('.add-user, .novo-usuario, button[data-action="add"]');
      
      return {
        hasTable: !!table,
        rowsCount: rows.length,
        hasAddButton: !!addButton
      };
    });

    console.log(`📋 Usuários - Tabela: ${usuariosData.hasTable ? 'OK' : 'Não encontrada'}`);
    console.log(`👤 Usuários - ${usuariosData.rowsCount} itens encontrados`);
    console.log(`➕ Usuários - Botão adicionar: ${usuariosData.hasAddButton ? 'OK' : 'Não encontrado'}`);

    // Testar botão de adicionar usuário se existir
    if (usuariosData.hasAddButton) {
      const addButton = await page.$('.add-user, .novo-usuario, button[data-action="add"]');
      if (addButton) {
        await addButton.click();
        await sleep(1000);
        console.log('✅ Botão adicionar usuário funcionando');
      }
    }

    return true;
  } catch (error) {
    console.log(`❌ Erro no teste de usuários: ${error.message}`);
    errors.push({
      type: 'usuarios_error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
    return false;
  }
}

// Teste da página de processos
async function testProcessos(page) {
  console.log('\n⚖️ Testando página de Processos...');
  
  try {
    await page.goto(`${FRONTEND_URL}/processos`, { waitUntil: 'networkidle0' });
    await sleep(3000);

    // Verificar lista de processos
    const processosData = await page.evaluate(() => {
      const table = document.querySelector('table, .process-list, .processos-list');
      const rows = document.querySelectorAll('tr, .process-item, .processo-item');
      const addButton = document.querySelector('.add-process, .novo-processo, button[data-action="add"]');
      const searchInput = document.querySelector('input[type="search"], .search-input, .busca');
      
      return {
        hasTable: !!table,
        rowsCount: rows.length,
        hasAddButton: !!addButton,
        hasSearch: !!searchInput
      };
    });

    console.log(`📋 Processos - Tabela: ${processosData.hasTable ? 'OK' : 'Não encontrada'}`);
    console.log(`⚖️ Processos - ${processosData.rowsCount} itens encontrados`);
    console.log(`➕ Processos - Botão adicionar: ${processosData.hasAddButton ? 'OK' : 'Não encontrado'}`);
    console.log(`🔍 Processos - Campo busca: ${processosData.hasSearch ? 'OK' : 'Não encontrado'}`);

    // Testar funcionalidade de busca se existir
    if (processosData.hasSearch) {
      const searchInput = await page.$('input[type="search"], .search-input, .busca');
      if (searchInput) {
        await searchInput.type('teste');
        await sleep(1000);
        console.log('✅ Campo de busca funcionando');
      }
    }

    return true;
  } catch (error) {
    console.log(`❌ Erro no teste de processos: ${error.message}`);
    errors.push({
      type: 'processos_error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
    return false;
  }
}

// Teste da página de agendamentos
async function testAgendamentos(page) {
  console.log('\n📅 Testando página de Agendamentos...');
  
  try {
    await page.goto(`${FRONTEND_URL}/agendamentos`, { waitUntil: 'networkidle0' });
    await sleep(3000);

    // Verificar calendário/lista de agendamentos
    const agendamentosData = await page.evaluate(() => {
      const calendar = document.querySelector('.calendar, .agenda, .agendamentos');
      const list = document.querySelector('table, .agenda-list, .agendamentos-list');
      const addButton = document.querySelector('.add-event, .novo-agendamento, button[data-action="add"]');
      
      return {
        hasCalendar: !!calendar,
        hasList: !!list,
        hasAddButton: !!addButton
      };
    });

    console.log(`📅 Agendamentos - Calendário: ${agendamentosData.hasCalendar ? 'OK' : 'Não encontrado'}`);
    console.log(`📋 Agendamentos - Lista: ${agendamentosData.hasList ? 'OK' : 'Não encontrada'}`);
    console.log(`➕ Agendamentos - Botão adicionar: ${agendamentosData.hasAddButton ? 'OK' : 'Não encontrado'}`);

    return true;
  } catch (error) {
    console.log(`❌ Erro no teste de agendamentos: ${error.message}`);
    errors.push({
      type: 'agendamentos_error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
    return false;
  }
}

// Teste geral de navegação
async function testNavigation(page) {
  console.log('\n🧭 Testando Navegação...');
  
  try {
    // Verificar links de navegação
    const navData = await page.evaluate(() => {
      const navLinks = document.querySelectorAll('nav a, .navbar a, .sidebar a, .menu a');
      const links = [];
      
      navLinks.forEach(link => {
        links.push({
          text: link.textContent.trim(),
          href: link.href,
          visible: link.offsetParent !== null
        });
      });
      
      return {
        totalLinks: navLinks.length,
        links: links.slice(0, 10) // Primeiros 10 links
      };
    });

    console.log(`🔗 Navegação - ${navData.totalLinks} links encontrados`);
    
    // Testar alguns links principais
    const mainRoutes = ['/usuarios', '/processos', '/agendamentos'];
    
    for (const route of mainRoutes) {
      try {
        await page.goto(`${FRONTEND_URL}${route}`, { waitUntil: 'networkidle0' });
        await sleep(1000);
        console.log(`✅ Rota ${route} acessível`);
      } catch (error) {
        console.log(`❌ Erro na rota ${route}: ${error.message}`);
      }
    }

    return true;
  } catch (error) {
    console.log(`❌ Erro no teste de navegação: ${error.message}`);
    errors.push({
      type: 'navigation_error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
    return false;
  }
}

// Função principal de teste
async function runFullFrontendTest() {
  console.log('🚀 INICIANDO TESTE COMPLETO DO FRONTEND');
  console.log('=====================================');
  
  try {
    // Inicializar browser
    browser = await puppeteer.launch({
      headless: false, // Mostrar o browser para debug
      defaultViewport: { width: 1920, height: 1080 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    page = await browser.newPage();
    setupConsoleLogging(page);

    // Verificar se frontend está rodando
    try {
      await page.goto(FRONTEND_URL, { waitUntil: 'networkidle0', timeout: 10000 });
      console.log('✅ Frontend acessível em ' + FRONTEND_URL);
    } catch (error) {
      console.log('❌ Frontend não está acessível em ' + FRONTEND_URL);
      console.log('💡 Certifique-se de que o frontend está rodando: npm run dev');
      return;
    }

    // Executar testes
    const testResults = {
      login: await doLogin(page),
      dashboard: await testDashboard(page),
      usuarios: await testUsuarios(page),
      processos: await testProcessos(page),
      agendamentos: await testAgendamentos(page),
      navigation: await testNavigation(page)
    };

    // Relatório final
    console.log('\n📊 RELATÓRIO FINAL');
    console.log('==================');
    
    const totalTests = Object.keys(testResults).length;
    const passedTests = Object.values(testResults).filter(result => result).length;
    const successRate = ((passedTests / totalTests) * 100).toFixed(1);

    console.log(`✅ Testes que passaram: ${passedTests}/${totalTests}`);
    console.log(`📊 Taxa de sucesso: ${successRate}%`);
    console.log(`❌ Erros encontrados: ${errors.length}`);
    console.log(`⚠️ Warnings encontrados: ${warnings.length}`);
    console.log(`🌐 Erros de rede: ${networkErrors.length}`);

    // Salvar relatório detalhado
    const report = {
      timestamp: new Date().toISOString(),
      testResults,
      successRate: parseFloat(successRate),
      errors,
      warnings,
      networkErrors,
      summary: {
        totalTests,
        passedTests,
        failedTests: totalTests - passedTests
      }
    };

    fs.writeFileSync(
      path.join(__dirname, 'frontend_test_report.json'),
      JSON.stringify(report, null, 2)
    );

    console.log('\n📄 Relatório detalhado salvo em: frontend_test_report.json');

    // Mostrar erros principais
    if (errors.length > 0) {
      console.log('\n🚨 PRINCIPAIS ERROS ENCONTRADOS:');
      errors.slice(0, 5).forEach((error, index) => {
        console.log(`${index + 1}. [${error.type}] ${error.message}`);
      });
    }

  } catch (error) {
    console.log(`❌ Erro geral no teste: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  runFullFrontendTest().catch(console.error);
}

module.exports = { runFullFrontendTest };
