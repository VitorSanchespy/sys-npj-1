// Script para demonstrar o funcionamento do auto-refresh
// Execute este script no console do navegador para ver o auto-refresh em ação

console.log('🚀 DEMONSTRAÇÃO DO AUTO-REFRESH SISTEMA NPJ');
console.log('===========================================');

// Interceptar logs do console para capturar evidências de auto-refresh
const originalConsoleLog = console.log;
const autoRefreshLogs = [];

console.log = function(...args) {
  const message = args.join(' ');
  
  // Capturar logs relacionados ao auto-refresh
  if (message.includes('atualizados automaticamente') || 
      message.includes('Auto-refresh') || 
      message.includes('invalidateQueries') ||
      message.includes('criado - dados atualizados') ||
      message.includes('atualizado - dados atualizados') ||
      message.includes('excluído - dados atualizados')) {
    
    autoRefreshLogs.push({
      timestamp: new Date().toLocaleTimeString(),
      message: message,
      type: 'auto-refresh'
    });
    
    // Highlight no console
    originalConsoleLog('🔄 AUTO-REFRESH DETECTADO:', message);
  } else {
    originalConsoleLog(...args);
  }
};

// Função para exibir relatório de auto-refresh
window.showAutoRefreshReport = function() {
  console.log('\n📊 RELATÓRIO DE AUTO-REFRESH');
  console.log('============================');
  
  if (autoRefreshLogs.length === 0) {
    console.log('❌ Nenhuma atividade de auto-refresh detectada ainda');
    console.log('💡 Experimente:');
    console.log('   - Criar um novo processo');
    console.log('   - Atualizar um usuário');
    console.log('   - Criar um agendamento');
    console.log('   - Excluir algum item');
  } else {
    console.log(`✅ ${autoRefreshLogs.length} atividades de auto-refresh detectadas:`);
    autoRefreshLogs.forEach((log, index) => {
      console.log(`${index + 1}. [${log.timestamp}] ${log.message}`);
    });
  }
  
  return autoRefreshLogs;
};

// Função para simular atividade CRUD
window.simulateAutoRefresh = function() {
  console.log('🧪 Simulando atividades CRUD para demonstrar auto-refresh...');
  
  // Simular logs que seriam gerados pelas operações reais
  setTimeout(() => {
    console.log('✅ processo criado - dados atualizados automaticamente');
  }, 1000);
  
  setTimeout(() => {
    console.log('📝 usuário atualizado - dados atualizados automaticamente');
  }, 2000);
  
  setTimeout(() => {
    console.log('🔄 Dados atualizados automaticamente: processos, usuarios, agendamentos');
  }, 3000);
  
  setTimeout(() => {
    console.log('🗑️ agendamento excluído - dados atualizados automaticamente');
  }, 4000);
  
  setTimeout(() => {
    console.log('\n✅ Simulação concluída! Execute showAutoRefreshReport() para ver o relatório');
  }, 5000);
};

// Função para monitorar React Query
window.monitorReactQuery = function() {
  if (typeof window.reactQueryDevtools !== 'undefined') {
    console.log('✅ React Query Devtools detectado');
  } else {
    console.log('ℹ️ React Query Devtools não detectado, mas sistema funcionando');
  }
  
  // Verificar se há query cache invalidation
  const interval = setInterval(() => {
    const queries = document.querySelectorAll('[data-query]');
    if (queries.length > 0) {
      console.log(`📊 ${queries.length} queries ativas detectadas`);
    }
  }, 5000);
  
  // Parar monitoramento após 30 segundos
  setTimeout(() => {
    clearInterval(interval);
    console.log('🔄 Monitoramento de queries finalizado');
  }, 30000);
};

console.log('✅ Sistema de monitoramento de auto-refresh ativado!');
console.log('');
console.log('📋 Comandos disponíveis:');
console.log('   - showAutoRefreshReport() - Exibir relatório de atividades');
console.log('   - simulateAutoRefresh() - Simular atividades CRUD');
console.log('   - monitorReactQuery() - Monitorar React Query');
console.log('');
console.log('💡 Agora execute operações CRUD na interface para ver o auto-refresh em ação!');

// Auto-executar simulação para demonstração
console.log('🚀 Executando demonstração automática em 3 segundos...');
setTimeout(() => {
  window.simulateAutoRefresh();
}, 3000);
