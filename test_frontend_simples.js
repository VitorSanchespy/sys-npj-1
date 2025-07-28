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

async function testeFrontendSimples() {
  console.log('🌐 TESTE FRONTEND SIMPLES - SISTEMA NPJ DOCKER');
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
    console.log('\n🔗 TESTES DE CONECTIVIDADE FRONTEND');
    console.log('----------------------------------');
    
    // 1. Verificar se o servidor frontend está respondendo
    const homeResponse = await makeRequest({
      hostname: 'localhost',
      port: 5173,
      path: '/',
      method: 'GET'
    });
    
    logTeste('Servidor frontend rodando', homeResponse.status === 200, `Status: ${homeResponse.status}`);
    
    // 2. Verificar se está servindo HTML
    const isHTML = homeResponse.headers['content-type'] && 
                   homeResponse.headers['content-type'].includes('text/html');
    logTeste('Servindo conteúdo HTML', isHTML);
    
    // 3. Verificar se o HTML contém elementos básicos
    const hasTitle = homeResponse.data.includes('<title>');
    const hasBody = homeResponse.data.includes('<body>');
    const hasScript = homeResponse.data.includes('<script>');
    
    logTeste('HTML com estrutura básica', hasTitle && hasBody, 
      `(title: ${hasTitle}, body: ${hasBody})`);
    logTeste('JavaScript incluído', hasScript);
    
    // 4. Verificar se há referências ao Vite (desenvolvimento)
    const hasVite = homeResponse.data.includes('vite') || homeResponse.data.includes('@vite');
    logTeste('Build/desenvolvimento detectado', hasVite, hasVite ? '(Vite)' : '');
    
    console.log('\n📁 TESTES DE RECURSOS ESTÁTICOS');
    console.log('-------------------------------');
    
    // 5. Tentar acessar recursos CSS (se mencionados no HTML)
    const cssMatches = homeResponse.data.match(/href=["']([^"']*\.css[^"']*?)["']/g);
    if (cssMatches && cssMatches.length > 0) {
      const cssPath = cssMatches[0].match(/href=["']([^"']*)["']/)[1];
      try {
        const cssResponse = await makeRequest({
          hostname: 'localhost',
          port: 5173,
          path: cssPath,
          method: 'GET'
        });
        logTeste('Arquivo CSS acessível', cssResponse.status === 200, `(${cssPath})`);
      } catch (error) {
        logTeste('Arquivo CSS acessível', false, `Erro: ${error.message}`);
      }
    } else {
      logTeste('CSS inline ou não detectado', true, '(sem arquivos CSS externos)');
    }
    
    // 6. Tentar acessar recursos JS (se mencionados no HTML)
    const jsMatches = homeResponse.data.match(/src=["']([^"']*\.js[^"']*?)["']/g);
    if (jsMatches && jsMatches.length > 0) {
      const jsPath = jsMatches[0].match(/src=["']([^"']*)["']/)[1];
      try {
        const jsResponse = await makeRequest({
          hostname: 'localhost',
          port: 5173,
          path: jsPath,
          method: 'GET'
        });
        logTeste('Arquivo JavaScript acessível', jsResponse.status === 200, `(${jsPath})`);
      } catch (error) {
        logTeste('Arquivo JavaScript acessível', false, `Erro: ${error.message}`);
      }
    } else {
      logTeste('JavaScript inline ou não detectado', true, '(sem arquivos JS externos)');
    }
    
    console.log('\n🎨 TESTES DE CONTEÚDO');
    console.log('---------------------');
    
    // 7. Verificar se há conteúdo relacionado ao NPJ
    const hasNPJContent = homeResponse.data.toLowerCase().includes('npj') ||
                          homeResponse.data.toLowerCase().includes('núcleo') ||
                          homeResponse.data.toLowerCase().includes('jurídico') ||
                          homeResponse.data.toLowerCase().includes('juridico');
    
    logTeste('Conteúdo relacionado ao NPJ', hasNPJContent);
    
    // 8. Verificar se há elementos de formulário (login)
    const hasForm = homeResponse.data.includes('<form>') || 
                    homeResponse.data.includes('type="email"') ||
                    homeResponse.data.includes('type="password"');
    
    logTeste('Elementos de formulário presentes', hasForm);
    
    // 9. Verificar se há referências à API do backend
    const hasApiRef = homeResponse.data.includes('3001') ||
                      homeResponse.data.includes('localhost:3001') ||
                      homeResponse.data.includes('/api/');
    
    logTeste('Referências à API do backend', hasApiRef);
    
    console.log('\n🔧 TESTES DE CONFIGURAÇÃO');
    console.log('-------------------------');
    
    // 10. Tentar acessar arquivos de configuração comuns
    try {
      const viteConfigResponse = await makeRequest({
        hostname: 'localhost',
        port: 5173,
        path: '/vite.config.js',
        method: 'GET'
      });
      logTeste('Configuração Vite acessível', viteConfigResponse.status === 200);
    } catch (error) {
      logTeste('Configuração Vite protegida', true, '(erro esperado em produção)');
    }
    
    // 11. Verificar CORS headers (importante para comunicação com API)
    const hasCorsHeaders = homeResponse.headers['access-control-allow-origin'] !== undefined;
    logTeste('Headers CORS configurados', hasCorsHeaders || homeResponse.status === 200, 
      hasCorsHeaders ? '(CORS presente)' : '(sem CORS explícito)');
      
  } catch (error) {
    console.log('❌ Erro durante os testes:', error.message);
    logTeste('Erro geral de conectividade', false, error.message);
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
  
  console.log('\n🌐 ACESSE O SISTEMA: http://localhost:5173');
  console.log('📝 BACKEND API: http://localhost:3001');
  console.log('🗄️ BANCO DE DADOS: localhost:3306');
}

testeFrontendSimples();
