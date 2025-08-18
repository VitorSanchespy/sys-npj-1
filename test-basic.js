/**
 * Teste simples da API usando fetch nativo do Node.js
 */

async function testeBasico() {
  console.log('🧪 TESTE BÁSICO DO SISTEMA DE EVENTOS');
  console.log('=' .repeat(50));

  try {
    // Usar fetch do Node.js 18+
    console.log('\n🔍 Testando endpoint raiz...');
    const response = await fetch('http://localhost:3001/');
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Servidor responde:', data.message);
      console.log('📊 DB Status:', data.dbAvailable);
      
      return true;
    } else {
      console.error('❌ Resposta não ok:', response.status, response.statusText);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Erro na conexão:', error.message);
    return false;
  }
}

testeBasico();
