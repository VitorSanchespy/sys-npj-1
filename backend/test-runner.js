#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Iniciando Testes Completos do Sistema de Agendamentos Google Calendar');
console.log('='.repeat(80));

const runCommand = (command, args, options = {}) => {
  return new Promise((resolve, reject) => {
    console.log(`\n🔧 Executando: ${command} ${args.join(' ')}`);
    
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Comando falhou com código ${code}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
};

const runTests = async () => {
  try {
    console.log('\n📋 ETAPA 1: Testes Unitários');
    console.log('-'.repeat(50));
    await runCommand('npm', ['run', 'test:unit']);

    console.log('\n📋 ETAPA 2: Testes de Integração');
    console.log('-'.repeat(50));
    await runCommand('npm', ['run', 'test:integration']);

    console.log('\n📋 ETAPA 3: Testes E2E');
    console.log('-'.repeat(50));
    await runCommand('npm', ['run', 'test:e2e']);

    console.log('\n📋 ETAPA 4: Relatório de Cobertura');
    console.log('-'.repeat(50));
    await runCommand('npm', ['run', 'test:coverage']);

    console.log('\n🎉 TODOS OS TESTES CONCLUÍDOS COM SUCESSO!');
    console.log('='.repeat(80));
    console.log('📊 Verifique o relatório de cobertura em: ./coverage/lcov-report/index.html');
    
  } catch (error) {
    console.error('\n❌ ERRO NOS TESTES:', error.message);
    console.log('\n🔍 DICAS DE TROUBLESHOOTING:');
    console.log('1. Verifique se o banco de dados está rodando');
    console.log('2. Confirme se as dependências estão instaladas: npm install');
    console.log('3. Execute testes individuais para isolar problemas');
    console.log('4. Verifique logs de erro para mais detalhes');
    process.exit(1);
  }
};

// Verificar se argumentos específicos foram passados
const args = process.argv.slice(2);

if (args.includes('--unit')) {
  console.log('🧪 Executando apenas testes unitários...');
  runCommand('npm', ['run', 'test:unit']).catch(error => {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  });
} else if (args.includes('--integration')) {
  console.log('🔗 Executando apenas testes de integração...');
  runCommand('npm', ['run', 'test:integration']).catch(error => {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  });
} else if (args.includes('--e2e')) {
  console.log('🌐 Executando apenas testes E2E...');
  runCommand('npm', ['run', 'test:e2e']).catch(error => {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  });
} else if (args.includes('--coverage')) {
  console.log('📊 Executando testes com cobertura...');
  runCommand('npm', ['run', 'test:coverage']).catch(error => {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  });
} else if (args.includes('--watch')) {
  console.log('👀 Executando testes em modo watch...');
  runCommand('npm', ['run', 'test:watch']).catch(error => {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  });
} else {
  // Executar todos os testes
  runTests();
}
