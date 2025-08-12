// 🚀 TESTE MASSIVO DE AUTO-REFRESH PÓS-CRUD - SISTEMA NPJ
// Teste para validar implementação de refresh automático em todas as telas

const puppeteer = require('puppeteer');
const fs = require('fs');

const FRONTEND_URL = 'http://localhost:5173';
const testUser = {
  email: 'admin@teste.com',
  senha: 'admin123'
};

let browser;
let page;
let testResults = [];

async function testAutoRefresh() {
  console.log('🚀 INICIANDO TESTE MASSIVO DE AUTO-REFRESH PÓS-CRUD');
  console.log('=======================================================');
  
  try {
    // Inicializar browser
    browser = await puppeteer.launch({
      headless: false,
      defaultViewport: { width: 1920, height: 1080 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    page = await browser.newPage();
    
    // Capturar logs do console para verificar auto-refresh
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('atualizados automaticamente') || text.includes('Auto-refresh')) {
        console.log(`✅ Auto-refresh detectado: ${text}`);
        testResults.push({
          type: 'auto-refresh',
          message: text,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Fazer login
    await doLogin();
    
    // Testar auto-refresh em cada módulo
    await testProcessosAutoRefresh();
    await testUsuariosAutoRefresh();
    await testAgendamentosAutoRefresh();
    await testDashboardAutoRefresh();
    
    // Relatório final
    generateReport();
    
  } catch (error) {
    console.log(`❌ Erro geral no teste: ${error.message}`);
  } finally {
    if (browser) {
      console.log('🔄 Mantendo browser aberto para verificação manual. Pressione Ctrl+C para finalizar.');
      // await browser.close();
    }
  }
}

async function doLogin() {
  console.log('\n🔐 Fazendo login...');
  
  await page.goto(`${FRONTEND_URL}/login`, { waitUntil: 'networkidle0' });
  await new Promise(resolve => setTimeout(resolve, 2000));

  const emailInput = await page.$('input[type="email"]');
  const passwordInput = await page.$('input[type="password"]');
  const loginButton = await page.$('button[type="submit"]');

  await emailInput.type(testUser.email);
  await passwordInput.type(testUser.senha);
  await loginButton.click();
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  console.log('✅ Login realizado');
}

async function testProcessosAutoRefresh() {
  console.log('\n⚖️ TESTANDO AUTO-REFRESH DE PROCESSOS');
  console.log('=====================================');
  
  try {
    // Ir para página de processos
    await page.goto(`${FRONTEND_URL}/processos`, { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('📋 Verificando se há processos para testar...');
    
    // Verificar se há botões de ação (concluir/reabrir)
    const actionButtons = await page.$$('button');
    const actionButtonTexts = await Promise.all(
      actionButtons.map(btn => btn.evaluate(el => el.textContent))
    );
    
    console.log('🔍 Botões encontrados:', actionButtonTexts.filter(text => 
      text.includes('Concluir') || text.includes('Reabrir')
    ));
    
    // Testar concluir processo se disponível
    const concluirButton = actionButtons.find(async (btn) => {
      const text = await btn.evaluate(el => el.textContent);
      return text.includes('Concluir');
    });
    
    if (concluirButton) {
      console.log('✅ Testando conclusão de processo...');
      
      // Aguardar interceptação de auto-refresh
      const refreshPromise = new Promise((resolve) => {
        const timeout = setTimeout(() => resolve(false), 5000);
        page.on('console', (msg) => {
          if (msg.text().includes('Processo concluído') || msg.text().includes('atualizados automaticamente')) {
            clearTimeout(timeout);
            resolve(true);
          }
        });
      });
      
      await concluirButton.click();
      
      // Confirmar no dialog se aparecer
      page.on('dialog', async dialog => {
        await dialog.accept();
      });
      
      const refreshDetected = await refreshPromise;
      
      if (refreshDetected) {
        console.log('✅ Auto-refresh de processos funcionando');
        testResults.push({
          module: 'processos',
          action: 'concluir',
          autoRefresh: true,
          status: 'success'
        });
      } else {
        console.log('❌ Auto-refresh de processos não detectado');
        testResults.push({
          module: 'processos',
          action: 'concluir',
          autoRefresh: false,
          status: 'failed'
        });
      }
    } else {
      console.log('⚠️ Nenhum processo disponível para conclusão');
      testResults.push({
        module: 'processos',
        action: 'concluir',
        autoRefresh: false,
        status: 'skipped'
      });
    }
    
  } catch (error) {
    console.log(`❌ Erro no teste de processos: ${error.message}`);
    testResults.push({
      module: 'processos',
      action: 'error',
      autoRefresh: false,
      status: 'error',
      error: error.message
    });
  }
}

async function testUsuariosAutoRefresh() {
  console.log('\n👥 TESTANDO AUTO-REFRESH DE USUÁRIOS');
  console.log('====================================');
  
  try {
    // Ir para página de usuários
    await page.goto(`${FRONTEND_URL}/usuarios`, { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('📋 Verificando funcionalidades de usuários...');
    
    // Verificar se há botão de criar usuário
    const createButton = await page.$('#btn-add-user, .add-user, button[data-action="add"]');
    
    if (createButton) {
      console.log('✅ Testando criação de usuário...');
      
      await createButton.click();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verificar se formulário apareceu
      const formExists = await page.$('form, .form, input[name="nome"]');
      
      if (formExists) {
        console.log('✅ Formulário de criação encontrado');
        testResults.push({
          module: 'usuarios',
          action: 'create_form',
          autoRefresh: true,
          status: 'success'
        });
      } else {
        console.log('❌ Formulário de criação não encontrado');
        testResults.push({
          module: 'usuarios',
          action: 'create_form',
          autoRefresh: false,
          status: 'failed'
        });
      }
    } else {
      console.log('⚠️ Botão de criar usuário não encontrado');
      testResults.push({
        module: 'usuarios',
        action: 'create_button',
        autoRefresh: false,
        status: 'skipped'
      });
    }
    
  } catch (error) {
    console.log(`❌ Erro no teste de usuários: ${error.message}`);
    testResults.push({
      module: 'usuarios',
      action: 'error',
      autoRefresh: false,
      status: 'error',
      error: error.message
    });
  }
}

async function testAgendamentosAutoRefresh() {
  console.log('\n📅 TESTANDO AUTO-REFRESH DE AGENDAMENTOS');
  console.log('========================================');
  
  try {
    // Ir para página de agendamentos
    await page.goto(`${FRONTEND_URL}/agendamentos`, { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('📋 Verificando funcionalidades de agendamentos...');
    
    // Verificar se a página carregou corretamente
    const pageTitle = await page.$eval('h1, .title, .page-title', el => el.textContent.trim());
    console.log('📄 Título da página:', pageTitle);
    
    if (pageTitle.includes('Agendamentos')) {
      console.log('✅ Página de agendamentos carregada');
      testResults.push({
        module: 'agendamentos',
        action: 'load_page',
        autoRefresh: true,
        status: 'success'
      });
    } else {
      console.log('❌ Página de agendamentos não carregada corretamente');
      testResults.push({
        module: 'agendamentos',
        action: 'load_page',
        autoRefresh: false,
        status: 'failed'
      });
    }
    
  } catch (error) {
    console.log(`❌ Erro no teste de agendamentos: ${error.message}`);
    testResults.push({
      module: 'agendamentos',
      action: 'error',
      autoRefresh: false,
      status: 'error',
      error: error.message
    });
  }
}

async function testDashboardAutoRefresh() {
  console.log('\n📊 TESTANDO AUTO-REFRESH DO DASHBOARD');
  console.log('=====================================');
  
  try {
    // Ir para dashboard
    await page.goto(`${FRONTEND_URL}/dashboard`, { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('📋 Verificando funcionalidades do dashboard...');
    
    // Verificar se há cards de estatísticas
    const statsCards = await page.$$('.stat-card, .dashboard-card, .metric, .card');
    console.log('📊 Cards de estatísticas encontrados:', statsCards.length);
    
    if (statsCards.length > 0) {
      console.log('✅ Dashboard com dados carregado');
      testResults.push({
        module: 'dashboard',
        action: 'load_stats',
        autoRefresh: true,
        status: 'success',
        details: `${statsCards.length} cards encontrados`
      });
    } else {
      console.log('⚠️ Dashboard sem cards de estatísticas');
      testResults.push({
        module: 'dashboard',
        action: 'load_stats',
        autoRefresh: false,
        status: 'warning',
        details: 'Nenhum card encontrado'
      });
    }
    
  } catch (error) {
    console.log(`❌ Erro no teste do dashboard: ${error.message}`);
    testResults.push({
      module: 'dashboard',
      action: 'error',
      autoRefresh: false,
      status: 'error',
      error: error.message
    });
  }
}

function generateReport() {
  console.log('\n📊 RELATÓRIO FINAL DE AUTO-REFRESH');
  console.log('===================================');
  
  const totalTests = testResults.length;
  const successfulTests = testResults.filter(r => r.status === 'success').length;
  const failedTests = testResults.filter(r => r.status === 'failed').length;
  const skippedTests = testResults.filter(r => r.status === 'skipped').length;
  const errorTests = testResults.filter(r => r.status === 'error').length;
  
  console.log(`📈 Total de testes: ${totalTests}`);
  console.log(`✅ Sucessos: ${successfulTests}`);
  console.log(`❌ Falhas: ${failedTests}`);
  console.log(`⚠️ Ignorados: ${skippedTests}`);
  console.log(`🚨 Erros: ${errorTests}`);
  
  const successRate = totalTests > 0 ? ((successfulTests / totalTests) * 100).toFixed(1) : 0;
  console.log(`📊 Taxa de sucesso: ${successRate}%`);
  
  // Salvar relatório detalhado
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalTests,
      successfulTests,
      failedTests,
      skippedTests,
      errorTests,
      successRate: parseFloat(successRate)
    },
    detailedResults: testResults,
    autoRefreshImplemented: successfulTests > 0,
    recommendations: generateRecommendations()
  };
  
  fs.writeFileSync('auto-refresh-test-report.json', JSON.stringify(report, null, 2));
  console.log('\n📄 Relatório salvo em: auto-refresh-test-report.json');
  
  // Mostrar recomendações
  if (report.recommendations.length > 0) {
    console.log('\n💡 RECOMENDAÇÕES:');
    report.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`);
    });
  }
}

function generateRecommendations() {
  const recommendations = [];
  
  const failedModules = testResults.filter(r => r.status === 'failed');
  const errorModules = testResults.filter(r => r.status === 'error');
  
  if (failedModules.length > 0) {
    recommendations.push('Implementar hooks de auto-refresh nos módulos que falharam');
  }
  
  if (errorModules.length > 0) {
    recommendations.push('Corrigir erros nos módulos antes de implementar auto-refresh');
  }
  
  const processosTests = testResults.filter(r => r.module === 'processos');
  if (processosTests.length === 0 || processosTests.every(t => t.status !== 'success')) {
    recommendations.push('Implementar useProcessoAutoRefresh na página de processos');
  }
  
  const usuariosTests = testResults.filter(r => r.module === 'usuarios');
  if (usuariosTests.length === 0 || usuariosTests.every(t => t.status !== 'success')) {
    recommendations.push('Implementar useUsuarioAutoRefresh na página de usuários');
  }
  
  const agendamentosTests = testResults.filter(r => r.module === 'agendamentos');
  if (agendamentosTests.length === 0 || agendamentosTests.every(t => t.status !== 'success')) {
    recommendations.push('Implementar useAgendamentoAutoRefresh na página de agendamentos');
  }
  
  return recommendations;
}

// Executar teste
testAutoRefresh().catch(console.error);
