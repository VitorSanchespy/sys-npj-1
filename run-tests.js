/**
 * @fileoverview Script Principal de Execução de Testes NPJ
 * @description Centraliza e executa todos os tipos de teste do sistema NPJ
 * @author Sistema NPJ  
 * @version 1.0.0
 * @since 2025-07-28
 */

const { spawn } = require('child_process');
const path = require('path');

/**
 * Configurações dos testes disponíveis
 */
const TESTS = {
  connectivity: {
    path: 'tests/organized/connectivity/test_connectivity.js',
    description: 'Teste de Conectividade Básica',
    emoji: '📡'
  },
  integration: {
    path: 'tests/organized/integration/test_massivo_docker.js', 
    description: 'Teste Completo de Integração',
    emoji: '🚀'
  },
  backend: {
    path: 'tests/organized/integration/test_backend_docker.js',
    description: 'Teste Específico do Backend',
    emoji: '⚙️'
  }
};

/**
 * Executa um teste específico
 * @param {string} testName - Nome do teste para executar
 * @returns {Promise<boolean>} Se o teste passou ou não
 */
function runTest(testName) {
  return new Promise((resolve) => {
    const test = TESTS[testName];
    if (!test) {
      console.log(`❌ Teste '${testName}' não encontrado`);
      resolve(false);
      return;
    }

    console.log(`${test.emoji} Executando: ${test.description}`);
    console.log('='.repeat(50));

    const child = spawn('node', [test.path], {
      stdio: 'inherit',
      cwd: process.cwd()
    });

    child.on('close', (code) => {
      console.log('='.repeat(50));
      if (code === 0) {
        console.log(`✅ ${test.description} - CONCLUÍDO`);
        resolve(true);
      } else {
        console.log(`❌ ${test.description} - FALHOU (código: ${code})`);
        resolve(false);
      }
      console.log('');
    });

    child.on('error', (error) => {
      console.log(`❌ Erro ao executar ${test.description}:`, error.message);
      resolve(false);
    });
  });
}

/**
 * Executa todos os testes em sequência
 * @returns {Promise<void>}
 */
async function runAllTests() {
  console.log('🎯 EXECUÇÃO COMPLETA DE TESTES - SISTEMA NPJ');
  console.log('===========================================');
  console.log(`📅 Data/Hora: ${new Date().toLocaleString('pt-BR')}`);
  console.log(`📁 Diretório: ${process.cwd()}`);
  console.log('');

  const results = {
    total: Object.keys(TESTS).length,
    passed: 0,
    failed: 0,
    details: []
  };

  // Executar cada teste
  for (const [testName, test] of Object.entries(TESTS)) {
    const startTime = Date.now();
    const success = await runTest(testName);
    const duration = Date.now() - startTime;
    
    if (success) {
      results.passed++;
    } else {
      results.failed++;
    }
    
    results.details.push({
      name: testName,
      description: test.description,
      success,
      duration
    });
  }

  // Resumo final
  console.log('🎯 RESUMO FINAL DE TODOS OS TESTES');
  console.log('==================================');
  
  results.details.forEach(result => {
    const status = result.success ? '✅' : '❌';
    const time = `(${Math.round(result.duration / 1000)}s)`;
    console.log(`${status} ${result.description} ${time}`);
  });
  
  console.log('');
  console.log(`📊 Testes executados: ${results.total}`);
  console.log(`✅ Sucessos: ${results.passed}`);
  console.log(`❌ Falhas: ${results.failed}`);
  console.log(`📈 Taxa de sucesso: ${Math.round((results.passed / results.total) * 100)}%`);
  
  if (results.passed === results.total) {
    console.log('\n🎉 TODOS OS TESTES PASSARAM! SISTEMA COMPLETAMENTE FUNCIONAL! 🎉');
  } else if (results.passed > 0) {
    console.log('\n🟡 SISTEMA PARCIALMENTE FUNCIONAL - Verificar falhas acima');
  } else {
    console.log('\n🔴 SISTEMA COM PROBLEMAS CRÍTICOS - Todos os testes falharam');
  }
}

/**
 * Mostra ajuda sobre como usar o script
 */
function showHelp() {
  console.log('📖 AJUDA - SCRIPT DE TESTES NPJ');
  console.log('================================');
  console.log('');
  console.log('Uso: node run-tests.js [opção]');
  console.log('');
  console.log('Opções disponíveis:');
  console.log('  --all          Executa todos os testes em sequência');
  console.log('  --connectivity Executa apenas teste de conectividade');
  console.log('  --integration  Executa apenas teste de integração completo');
  console.log('  --backend      Executa apenas teste específico do backend');
  console.log('  --help         Mostra esta ajuda');
  console.log('');
  console.log('Exemplos:');
  console.log('  node run-tests.js --all          # Todos os testes');
  console.log('  node run-tests.js --integration  # Só integração');
  console.log('  node run-tests.js --connectivity # Só conectividade');
  console.log('');
  console.log('Testes disponíveis:');
  Object.entries(TESTS).forEach(([name, test]) => {
    console.log(`  ${test.emoji} ${name}: ${test.description}`);
  });
}

/**
 * Função principal do script
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help')) {
    showHelp();
    return;
  }
  
  if (args.includes('--all')) {
    await runAllTests();
    return;
  }
  
  // Executar teste específico
  for (const [testName] of Object.entries(TESTS)) {
    if (args.includes(`--${testName}`)) {
      await runTest(testName);
      return;
    }
  }
  
  console.log('❌ Opção não reconhecida. Use --help para ver as opções disponíveis.');
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { runTest, runAllTests, TESTS };
