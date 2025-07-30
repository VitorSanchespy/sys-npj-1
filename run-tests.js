// Script simples de testes
const { spawn } = require('child_process');

const TESTS = {
  connectivity: 'tests/organized/connectivity/test_connectivity.js',
  integration: 'tests/organized/integration/test_massivo_docker.js',
  backend: 'tests/organized/integration/test_backend_docker.js'
};

// Executa teste
function runTest(testName) {
  return new Promise((resolve) => {
    const testPath = TESTS[testName];
    if (!testPath) {
      console.log(`❌ Teste '${testName}' não encontrado`);
      resolve(false);
      return;
    }

    console.log(`🚀 Executando: ${testName}`);
    
    const child = spawn('node', [testPath], { stdio: 'inherit' });
    
    child.on('close', (code) => {
      const success = code === 0;
      console.log(success ? `✅ ${testName} - OK` : `❌ ${testName} - FALHOU`);
      resolve(success);
    });
  });
}

// Executa todos os testes
async function runAllTests() {
  console.log('🎯 EXECUTANDO TODOS OS TESTES');
  console.log('=============================');
  
  let passed = 0;
  const total = Object.keys(TESTS).length;
  
  for (const testName of Object.keys(TESTS)) {
    const success = await runTest(testName);
    if (success) passed++;
  }
  
  console.log(`\n📊 Resultado: ${passed}/${total} testes passaram`);
  
  if (passed === total) {
    console.log('🎉 TODOS OS TESTES PASSARAM!');
  } else {
    console.log('⚠️ ALGUNS TESTES FALHARAM');
  }
}

// Função principal
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--all')) {
    await runAllTests();
  } else if (args.includes('--integration')) {
    await runTest('integration');
  } else if (args.includes('--connectivity')) {
    await runTest('connectivity');
  } else if (args.includes('--backend')) {
    await runTest('backend');
  } else {
    console.log('Uso: node run-tests.js [--all|--integration|--connectivity|--backend]');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { runTest, runAllTests };