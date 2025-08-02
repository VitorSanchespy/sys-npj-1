#!/usr/bin/env node

const axios = require('axios');
const fs = require('fs');
const path = require('path');

console.log('🚀 TESTE COMPLETO DO SISTEMA NPJ');
console.log('================================\n');

const BACKEND_URL = 'http://localhost:3001';
const FRONTEND_URL = 'http://localhost:5173';

const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  errors: []
};

function logTest(name, passed, error = null) {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    console.log(`✅ ${name}`);
  } else {
    testResults.failed++;
    console.log(`❌ ${name}`);
    if (error) {
      console.log(`   Erro: ${error.message}`);
      testResults.errors.push({ test: name, error: error.message });
    }
  }
}

async function testBackendHealth() {
  try {
    const response = await axios.get(`${BACKEND_URL}/auth/perfil`, {
      timeout: 5000
    });
    return true;
  } catch (error) {
    // Se retorna erro 401, significa que o backend está rodando
    if (error.response && error.response.status === 401) {
      return true;
    }
    throw error;
  }
}

async function testLogin() {
  try {
    const response = await axios.post(`${BACKEND_URL}/auth/login`, {
      email: 'admin@teste.com',
      senha: 'admin123'
    }, {
      timeout: 5000
    });
    
    if (response.data.success && response.data.token) {
      return response.data.token;
    }
    throw new Error('Login não retornou token');
  } catch (error) {
    throw error;
  }
}

async function testFrontendHealth() {
  try {
    const response = await axios.get(FRONTEND_URL, {
      timeout: 5000
    });
    return response.status === 200;
  } catch (error) {
    throw error;
  }
}

async function testAuthenticatedRoute(token) {
  try {
    const response = await axios.get(`${BACKEND_URL}/auth/perfil`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      timeout: 5000
    });
    return response.status === 200;
  } catch (error) {
    throw error;
  }
}

async function testAPIRoutes(token) {
  const routes = [
    '/api/usuarios',
    '/api/processos',
    '/api/agendamentos',
    '/api/notificacoes'
  ];
  
  const headers = {
    'Authorization': `Bearer ${token}`
  };
  
  for (const route of routes) {
    try {
      const response = await axios.get(`${BACKEND_URL}${route}`, {
        headers,
        timeout: 5000
      });
      logTest(`API ${route}`, response.status === 200);
    } catch (error) {
      logTest(`API ${route}`, false, error);
    }
  }
}

async function runCompleteTest() {
  console.log('📡 Testando conectividade...');
  
  // Teste 1: Backend Health
  try {
    await testBackendHealth();
    logTest('Backend está rodando', true);
  } catch (error) {
    logTest('Backend está rodando', false, error);
    return;
  }
  
  // Teste 2: Login
  let token = null;
  try {
    token = await testLogin();
    logTest('Login funcionando', true);
  } catch (error) {
    logTest('Login funcionando', false, error);
    return;
  }
  
  // Teste 3: Rota autenticada
  try {
    await testAuthenticatedRoute(token);
    logTest('Autenticação JWT', true);
  } catch (error) {
    logTest('Autenticação JWT', false, error);
  }
  
  // Teste 4: Frontend
  try {
    await testFrontendHealth();
    logTest('Frontend está rodando', true);
  } catch (error) {
    logTest('Frontend está rodando', false, error);
  }
  
  // Teste 5: APIs principais
  console.log('\n🔧 Testando APIs...');
  await testAPIRoutes(token);
  
  // Relatório final
  console.log('\n📊 RELATÓRIO FINAL');
  console.log('==================');
  console.log(`✅ Testes que passaram: ${testResults.passed}`);
  console.log(`❌ Testes que falharam: ${testResults.failed}`);
  console.log(`📊 Total de testes: ${testResults.total}`);
  console.log(`🎯 Taxa de sucesso: ${Math.round((testResults.passed / testResults.total) * 100)}%`);
  
  if (testResults.failed === 0) {
    console.log('\n🎉 TODOS OS TESTES PASSARAM!');
    console.log('✨ Sistema NPJ está 100% funcional!');
  } else {
    console.log('\n⚠️ Alguns testes falharam. Detalhes:');
    testResults.errors.forEach(error => {
      console.log(`   - ${error.test}: ${error.error}`);
    });
  }
  
  // Salvar relatório
  const report = {
    timestamp: new Date().toISOString(),
    results: testResults,
    summary: {
      passed: testResults.passed,
      failed: testResults.failed,
      total: testResults.total,
      successRate: Math.round((testResults.passed / testResults.total) * 100)
    }
  };
  
  fs.writeFileSync(
    path.join(__dirname, 'test-report.json'),
    JSON.stringify(report, null, 2)
  );
  
  console.log('\n📄 Relatório salvo em: test-report.json');
  
  return testResults.failed === 0;
}

// Executar se chamado diretamente
if (require.main === module) {
  runCompleteTest().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('❌ Erro durante execução dos testes:', error);
    process.exit(1);
  });
}

module.exports = { runCompleteTest };
