/**
 * Teste do novo sistema de Toast
 * Valida se o sistema de notificações foi totalmente substituído
 */

console.log('🧪 TESTE: Sistema de Toast - Substituição do Sistema de Notificações');
console.log('=' .repeat(70));

// Verificar se os arquivos do sistema antigo foram removidos
const fs = require('fs');
const path = require('path');

const testResults = {
  passed: 0,
  failed: 0,
  total: 0
};

function test(description, condition) {
  testResults.total++;
  if (condition) {
    console.log(`✅ ${description}`);
    testResults.passed++;
  } else {
    console.log(`❌ ${description}`);
    testResults.failed++;
  }
}

// Teste 1: Verificar se arquivos do backend foram removidos
const backendFilesToRemove = [
  '../backend/models/notificacaoModel.js',
  '../backend/models/configuracaoNotificacaoModel.js',
  '../backend/controllers/notificacaoController.js',
  '../backend/services/notificacaoService.js',
  '../backend/routes/notificacaoRoute.js'
];

backendFilesToRemove.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  test(`Backend: ${path.basename(filePath)} removido`, !fs.existsSync(fullPath));
});

// Teste 2: Verificar se arquivos do frontend foram removidos
const frontendFilesToRemove = [
  '../frontend/src/services/notificationService.js',
  '../frontend/src/pages/dashboard/NotificationPage.jsx',
  '../frontend/src/pages/dashboard/NotificationSettingsPage.jsx',
  '../frontend/src/components/notifications',
  '../frontend/src/contexts/NotificationContext.jsx'
];

frontendFilesToRemove.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  test(`Frontend: ${path.basename(filePath)} removido`, !fs.existsSync(fullPath));
});

// Teste 3: Verificar se novos arquivos do Toast foram criados
const toastFiles = [
  '../frontend/src/services/toastService.js',
  '../frontend/src/components/toast/ToastConfig.jsx'
];

toastFiles.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  test(`Toast: ${path.basename(filePath)} criado`, fs.existsSync(fullPath));
});

// Teste 4: Verificar se react-toastify foi instalado
try {
  const packageJson = require('../frontend/package.json');
  test('Toast: react-toastify instalado', !!packageJson.dependencies['react-toastify']);
} catch (error) {
  test('Toast: react-toastify instalado', false);
}

// Teste 5: Verificar se o App.jsx foi atualizado
try {
  const appContent = fs.readFileSync(path.join(__dirname, '../frontend/src/App.jsx'), 'utf8');
  test('App.jsx: ToastConfig importado', appContent.includes('ToastConfig'));
  test('App.jsx: NotificationProvider removido', !appContent.includes('NotificationProvider'));
  test('App.jsx: NotificationToast removido', !appContent.includes('NotificationToast'));
} catch (error) {
  test('App.jsx: Verificação falhou', false);
}

// Resultado final
console.log('\n' + '='.repeat(70));
console.log(`📊 RESULTADO: ${testResults.passed}/${testResults.total} testes passaram`);

if (testResults.failed === 0) {
  console.log('🎉 SUCESSO: Sistema de notificações totalmente refatorado!');
  console.log('💡 Sistema legado removido e substituído por Toast');
} else {
  console.log(`⚠️  ATENÇÃO: ${testResults.failed} teste(s) falharam`);
  console.log('🔧 Verifique os pontos pendentes acima');
}

console.log('\n🚀 Próximos passos:');
console.log('   1. Testar o sistema Toast no frontend');
console.log('   2. Remover tabelas de notificação do banco (quando disponível)');
console.log('   3. Atualizar documentação do sistema');
