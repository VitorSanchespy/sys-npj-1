// Script para limpar dados de autenticação e forçar novo login
console.log('🔧 Limpando dados de autenticação...');

// Limpar localStorage
localStorage.removeItem('user');
localStorage.removeItem('token');
localStorage.removeItem('refreshToken');

// Limpar sessionStorage também
sessionStorage.clear();

// Limpar cookies relacionados (se existirem)
document.cookie.split(";").forEach(function(c) { 
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});

console.log('✅ Dados de autenticação limpos!');
console.log('🔄 Recarregando página...');

// Recarregar a página para forçar novo login
window.location.reload();
