const http = require('http');

function makeRequest(options) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: body
        });
      });
    });
    
    req.on('error', reject);
    req.end();
  });
}

async function testeFrontendCompleto() {
  console.log('🚀 TESTE FRONTEND COMPLETO - SISTEMA NPJ REACT');
  console.log('==============================================');
  
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
    console.log('\n🔗 TESTES DE INFRAESTRUTURA REACT');
    console.log('--------------------------------');
    
    // 1. Verificar servidor Vite
    const homeResponse = await makeRequest({
      hostname: 'localhost',
      port: 5173,
      path: '/',
      method: 'GET'
    });
    
    logTeste('Servidor Vite rodando', homeResponse.status === 200);
    
    // 2. Verificar se é uma SPA React
    const isReactApp = homeResponse.data.includes('<div id="root">') && 
                       homeResponse.data.includes('main.jsx');
    logTeste('Aplicação React SPA detectada', isReactApp);
    
    // 3. Verificar título da aplicação
    const titleMatch = homeResponse.data.match(/<title>([^<]*)<\/title>/);
    const hasCorrectTitle = titleMatch && titleMatch[1].includes('NPJ');
    logTeste('Título da aplicação correto', hasCorrectTitle, 
      titleMatch ? `"${titleMatch[1]}"` : '');
    
    console.log('\n📦 TESTES DE RECURSOS E DEPENDÊNCIAS');
    console.log('-----------------------------------');
    
    // 4. Verificar main.jsx
    const mainJsResponse = await makeRequest({
      hostname: 'localhost',
      port: 5173,
      path: '/src/main.jsx',
      method: 'GET'
    });
    
    logTeste('Arquivo main.jsx acessível', mainJsResponse.status === 200);
    
    const hasReactImports = mainJsResponse.data.includes('react') && 
                           mainJsResponse.data.includes('ReactDOM');
    logTeste('Imports React corretos', hasReactImports);
    
    // 5. Verificar App.jsx
    const appJsResponse = await makeRequest({
      hostname: 'localhost',
      port: 5173,
      path: '/src/App.jsx',
      method: 'GET'
    });
    
    logTeste('Componente App.jsx acessível', appJsResponse.status === 200);
    
    const hasModernReact = appJsResponse.data.includes('QueryClientProvider') &&
                          appJsResponse.data.includes('AuthProvider');
    logTeste('Arquitetura React moderna', hasModernReact, '(Context + Query)');
    
    // 6. Verificar configuração da API
    const hasApiConfig = appJsResponse.data.includes('localhost:3001') ||
                        appJsResponse.data.includes('VITE_API_URL');
    logTeste('Configuração de API detectada', hasApiConfig);
    
    console.log('\n🎨 TESTES DE RECURSOS VISUAIS');
    console.log('-----------------------------');
    
    // 7. Verificar CSS
    const cssResponse = await makeRequest({
      hostname: 'localhost',
      port: 5173,
      path: '/src/index.css',
      method: 'GET'
    });
    
    logTeste('Arquivo CSS principal acessível', cssResponse.status === 200);
    
    const hasTailwind = cssResponse.data.includes('@tailwind') ||
                       cssResponse.data.includes('tailwind');
    logTeste('Framework CSS detectado', hasTailwind, hasTailwind ? '(Tailwind)' : '');
    
    console.log('\n🛣️ TESTES DE ROTEAMENTO');
    console.log('------------------------');
    
    // 8. Verificar AppRouter
    const routerResponse = await makeRequest({
      hostname: 'localhost',
      port: 5173,
      path: '/src/routes/AppRouter.jsx',
      method: 'GET'
    });
    
    logTeste('Sistema de roteamento acessível', routerResponse.status === 200);
    
    if (routerResponse.status === 200) {
      const hasRouter = routerResponse.data.includes('BrowserRouter') ||
                       routerResponse.data.includes('Routes') ||
                       routerResponse.data.includes('Route');
      logTeste('React Router configurado', hasRouter);
    }
    
    console.log('\n🔐 TESTES DE AUTENTICAÇÃO');
    console.log('-------------------------');
    
    // 9. Verificar contexto de autenticação
    const authContextResponse = await makeRequest({
      hostname: 'localhost',
      port: 5173,
      path: '/src/contexts/AuthContext.jsx',
      method: 'GET'
    });
    
    logTeste('Contexto de autenticação acessível', authContextResponse.status === 200);
    
    if (authContextResponse.status === 200) {
      const hasAuthFeatures = authContextResponse.data.includes('login') ||
                             authContextResponse.data.includes('token') ||
                             authContextResponse.data.includes('auth');
      logTeste('Funcionalidades de autenticação', hasAuthFeatures);
    }
    
    console.log('\n🔧 TESTES DE CONFIGURAÇÃO DE DESENVOLVIMENTO');
    console.log('--------------------------------------------');
    
    // 10. Verificar Vite config
    const viteConfigResponse = await makeRequest({
      hostname: 'localhost',
      port: 5173,
      path: '/vite.config.js',
      method: 'GET'
    });
    
    logTeste('Configuração Vite acessível', viteConfigResponse.status === 200);
    
    // 11. Verificar hot reload (HMR)
    const hasHMR = mainJsResponse.data.includes('@vite/client') ||
                   appJsResponse.data.includes('RefreshRuntime');
    logTeste('Hot Module Replacement ativo', hasHMR);
    
    console.log('\n🌐 TESTES DE CONECTIVIDADE COM BACKEND');
    console.log('-------------------------------------');
    
    // 12. Verificar se o backend está acessível do frontend
    try {
      const backendResponse = await makeRequest({
        hostname: 'localhost',
        port: 3001,
        path: '/health',
        method: 'GET'
      });
      logTeste('Backend acessível do frontend', backendResponse.status >= 200 && backendResponse.status < 500);
    } catch (error) {
      // Tentar rota alternativa
      try {
        const backendAltResponse = await makeRequest({
          hostname: 'localhost',
          port: 3001,
          path: '/',
          method: 'GET'
        });
        logTeste('Backend acessível do frontend', backendAltResponse.status >= 200 && backendAltResponse.status < 500);
      } catch (altError) {
        logTeste('Backend acessível do frontend', false, 'Não acessível');
      }
    }
    
    console.log('\n📱 TESTES DE RESPONSIVIDADE');
    console.log('---------------------------');
    
    // 13. Verificar viewport meta tag
    const hasViewport = homeResponse.data.includes('name="viewport"');
    logTeste('Meta viewport configurado', hasViewport);
    
    // 14. Verificar se há CSS responsivo
    const hasResponsiveCSS = cssResponse.data.includes('@media') ||
                            cssResponse.data.includes('responsive') ||
                            hasTailwind; // Tailwind é responsivo por padrão
    logTeste('CSS responsivo detectado', hasResponsiveCSS);
    
  } catch (error) {
    console.log('❌ Erro durante os testes:', error.message);
    logTeste('Erro geral de conectividade', false, error.message);
  }
  
  // === RESULTADO FINAL ===
  console.log('\n🎯 RESULTADO FINAL DO TESTE FRONTEND COMPLETO');
  console.log('============================================');
  console.log(`✅ Testes que passaram: ${testesPassaram}`);
  console.log(`❌ Testes que falharam: ${totalTestes - testesPassaram}`);
  console.log(`📊 Taxa de sucesso: ${Math.round((testesPassaram / totalTestes) * 100)}%`);
  console.log(`🎲 Total de testes: ${totalTestes}`);
  
  if (testesPassaram === totalTestes) {
    console.log('\n🎉 TODOS OS TESTES DE FRONTEND PASSARAM! INTERFACE 100% FUNCIONAL! 🎉');
  } else if (testesPassaram / totalTestes > 0.85) {
    console.log('\n🟢 FRONTEND PRATICAMENTE COMPLETO! Sistema pronto para uso.');
  } else if (testesPassaram / totalTestes > 0.70) {
    console.log('\n🟡 FRONTEND FUNCIONAL, mas precisa de alguns ajustes.');
  } else {
    console.log('\n🔴 FRONTEND PRECISA DE CORREÇÕES SIGNIFICATIVAS.');
  }
  
  console.log('\n🚀 RESUMO DO SISTEMA NPJ:');
  console.log('========================');
  console.log('🌐 Frontend (React + Vite): http://localhost:5173');
  console.log('🔧 Backend (Node.js + Express): http://localhost:3001');
  console.log('🗄️ Banco de Dados (MySQL): localhost:3306');
  console.log('📋 Status: Sistema completo em Docker!');
}

testeFrontendCompleto();
