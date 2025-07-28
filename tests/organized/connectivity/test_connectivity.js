/**
 * @fileoverview Teste Simples de Conectividade do Backend Docker
 * @description Verifica conectividade básica e endpoints públicos do backend NPJ
 * @author Sistema NPJ
 * @version 1.0.0
 * @since 2025-07-28
 */

const axios = require('axios');

/**
 * Configurações do teste de conectividade
 */
const CONFIG = {
  API_URL: 'http://localhost:3001',
  TIMEOUT: 5000,
  ENDPOINTS_TO_TEST: [
    { path: '/', description: 'Rota raiz' },
    { path: '/health', description: 'Health check' },
    { path: '/api/aux/fase', description: 'Fases (requer auth)' },
    { path: '/api/aux/materia-assunto', description: 'Matérias (requer auth)' }
  ]
};

/**
 * Executa teste de conectividade simples do backend
 * @returns {Promise<void>}
 */
async function testeConectividade() {
  console.log('🚀 TESTE SIMPLES - CONECTIVIDADE BACKEND DOCKER');
  console.log('===========================================');
  console.log(`Container: npj-backend (${CONFIG.API_URL})`);
  console.log(`Timeout: ${CONFIG.TIMEOUT}ms`);
  console.log('');

  let testsResults = { total: 0, passed: 0, failed: 0 };

  // Teste 1: Verificar se o servidor está respondendo
  try {
    console.log('📡 Testando conectividade básica...');
    const response = await axios.get(`${CONFIG.API_URL}/`, { timeout: CONFIG.TIMEOUT });
    console.log('✅ Servidor está respondendo:', response.status);
    testsResults.passed++;
  } catch (error) {
    console.log('❌ Erro de conectividade:', error.code || error.message);
    testsResults.failed++;
    return; // Para aqui se não conseguir conectar
  }
  testsResults.total++;

  // Teste 2: Verificar endpoint de health check
  try {
    console.log('🔍 Verificando health check...');
    const response = await axios.get(`${CONFIG.API_URL}/health`, { timeout: CONFIG.TIMEOUT });
    console.log('✅ Health check:', response.data);
    testsResults.passed++;
  } catch (error) {
    console.log('⚠️ Health check não disponível');
    testsResults.failed++;
  }
  testsResults.total++;

  // Teste 3: Verificar endpoints que requerem autenticação (devem retornar 401)
  console.log('� Testando endpoints protegidos (deve retornar 401)...');
  
  for (const endpoint of CONFIG.ENDPOINTS_TO_TEST.slice(2)) {
    try {
      testsResults.total++;
      const response = await axios.get(`${CONFIG.API_URL}${endpoint.path}`, { timeout: CONFIG.TIMEOUT });
      console.log(`⚠️ ${endpoint.description}: Resposta inesperada (${response.status}) - deveria ser 401`);
      testsResults.failed++;
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log(`✅ ${endpoint.description}: Protegido corretamente (401)`);
        testsResults.passed++;
      } else {
        console.log(`❌ ${endpoint.description}: Erro inesperado -`, error.message);
        testsResults.failed++;
      }
    }
  }

  // Resumo final
  console.log('');
  console.log('📊 RESUMO DO TESTE DE CONECTIVIDADE');
  console.log('===================================');
  console.log(`✅ Testes passaram: ${testsResults.passed}`);
  console.log(`❌ Testes falharam: ${testsResults.failed}`);
  console.log(`📈 Taxa de sucesso: ${Math.round((testsResults.passed / testsResults.total) * 100)}%`);
  console.log(`🎲 Total de testes: ${testsResults.total}`);
  console.log('');
  
  if (testsResults.passed === testsResults.total) {
    console.log('🎉 CONECTIVIDADE 100% FUNCIONAL!');
  } else if (testsResults.passed > 0) {
    console.log('🟡 CONECTIVIDADE PARCIAL - Alguns problemas detectados');
  } else {
    console.log('🔴 FALHA CRÍTICA DE CONECTIVIDADE');
  }
  
  console.log('💡 Para testes completos, execute: node tests/organized/integration/test_massivo_docker.js');
  console.log(`📅 Teste executado em: ${new Date().toLocaleString('pt-BR')}`);
}

// Executar o teste se for chamado diretamente
if (require.main === module) {
  testeConectividade().catch(console.error);
}

module.exports = { testeConectividade, CONFIG };
