// Script para detectar duplicações no layout
// Execute no console do navegador para identificar problemas

function debugLayoutDuplicates() {
  console.log('🔍 VERIFICANDO DUPLICAÇÕES NO LAYOUT...\n');
  
  // 1. Verificar containers principais
  const mainLayouts = document.querySelectorAll('[data-testid="main-layout-container"]');
  console.log(`📦 Main Layout Containers: ${mainLayouts.length} ${mainLayouts.length > 1 ? '❌ DUPLICADO!' : '✅'}`);
  
  // 2. Verificar navigations
  const navigations = document.querySelectorAll('[data-testid="navigation-container"]');
  console.log(`🧭 Navigation Containers: ${navigations.length} ${navigations.length > 1 ? '❌ DUPLICADO!' : '✅'}`);
  
  // 3. Verificar sidebars
  const sidebars = document.querySelectorAll('[data-testid="sidebar-navigation"]');
  console.log(`📝 Sidebar Navigations: ${sidebars.length} ${sidebars.length > 1 ? '❌ DUPLICADO!' : '✅'}`);
  
  // 4. Verificar user info sections
  const userInfos = document.querySelectorAll('[data-testid="user-info-section"]');
  console.log(`👤 User Info Sections: ${userInfos.length} ${userInfos.length > 1 ? '❌ DUPLICADO!' : '✅'}`);
  
  // 5. Verificar menu items sections
  const menuSections = document.querySelectorAll('[data-testid="menu-items-section"]');
  console.log(`📋 Menu Items Sections: ${menuSections.length} ${menuSections.length > 1 ? '❌ DUPLICADO!' : '✅'}`);
  
  // 6. Verificar headers
  const topHeaders = document.querySelectorAll('[data-testid="top-header"]');
  console.log(`🎯 Top Headers: ${topHeaders.length} ${topHeaders.length > 1 ? '❌ DUPLICADO!' : '✅'}`);
  
  // 7. Verificar content wrappers
  const contentWrappers = document.querySelectorAll('[data-testid="page-content-wrapper"]');
  console.log(`📄 Page Content Wrappers: ${contentWrappers.length} ${contentWrappers.length > 1 ? '❌ DUPLICADO!' : '✅'}`);
  
  console.log('\n🔧 ANÁLISE DE CSS/HTML:');
  
  // 8. Verificar flex containers aninhados incorretamente
  const flexContainers = document.querySelectorAll('[style*="display: flex"]');
  console.log(`📐 Flex Containers: ${flexContainers.length}`);
  
  // 9. Verificar se há elementos com position fixed duplicados
  const fixedElements = document.querySelectorAll('[style*="position: fixed"]');
  console.log(`📌 Fixed Position Elements: ${fixedElements.length}`);
  
  // 10. Verificar AuthProviders (contextos)
  const authContexts = document.querySelectorAll('[data-react-context="AuthContext"]');
  console.log(`🔐 Auth Contexts: ${authContexts.length} ${authContexts.length > 1 ? '❌ DUPLICADO!' : '✅'}`);
  
  console.log('\n💡 RESUMO:');
  const totalProblems = [mainLayouts, navigations, sidebars, userInfos, menuSections, topHeaders, contentWrappers]
    .filter(nodeList => nodeList.length > 1).length;
  
  if (totalProblems === 0) {
    console.log('✅ Nenhuma duplicação detectada!');
  } else {
    console.log(`❌ ${totalProblems} tipos de duplicação encontrados!`);
    console.log('🔧 Verifique os elementos marcados com ❌ acima.');
  }
}

// Auto-executar quando carregado
if (typeof window !== 'undefined') {
  console.log('🚀 Script de debug carregado! Execute debugLayoutDuplicates() no console.');
}
