// 🚀 SCRIPT DE TESTE AUTOMATIZADO - SISTEMA NPJ
// Baseado nos testes executados anteriormente com melhorias

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:3001';
let token = null;

// Dados de teste
const testUser = {
  email: 'admin@teste.com',
  senha: 'admin123'
};

// Função de login
async function login() {
  try {
    console.log('🔐 Fazendo login...');
    const response = await axios.post(`${API_URL}/auth/login`, testUser);
    token = response.data.token;
    console.log('✅ Login realizado com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Erro no login:', error.response?.data?.message || error.message);
    return false;
  }
}

// Teste rápido das principais funcionalidades
async function testBasicFunctionality() {
  console.log('\n📋 TESTE BÁSICO DE FUNCIONALIDADES');
  
  try {
    // 1. Testar usuários
    console.log('  👥 Testando usuários...');
    const users = await axios.get(`${API_URL}/api/usuarios`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`  ✅ ${users.data.length} usuários encontrados`);

    // 2. Testar processos
    console.log('  ⚖️ Testando processos...');
    const processes = await axios.get(`${API_URL}/api/processos`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`  ✅ ${processes.data.length} processos encontrados`);

    // 3. Testar agendamentos
    console.log('  📅 Testando agendamentos...');
    const agendamentos = await axios.get(`${API_URL}/api/agendamentos`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`  ✅ ${agendamentos.data.length} agendamentos encontrados`);

    // 4. Testar perfil
    console.log('  👤 Testando perfil...');
    const profile = await axios.get(`${API_URL}/auth/perfil`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`  ✅ Perfil obtido: ${profile.data.nome}`);

    // 5. Testar tabelas auxiliares
    console.log('  📊 Testando tabelas auxiliares...');
    const auxData = await axios.get(`${API_URL}/api/aux/materia-assunto`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`  ✅ ${auxData.data.length} matérias/assuntos encontrados`);

    return true;
  } catch (error) {
    console.error('  ❌ Erro no teste básico:', error.response?.data?.message || error.message);
    return false;
  }
}

// Executar testes
async function runTests() {
  console.log('🎯 SISTEMA NPJ - TESTE DE FUNCIONALIDADE');
  console.log('=========================================');
  
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('❌ Falha no login. Sistema inacessível.');
    return;
  }

  const basicTest = await testBasicFunctionality();
  
  console.log('\n📊 RESUMO DOS TESTES:');
  console.log('=====================');
  console.log(`🔐 Login: ${loginSuccess ? '✅ OK' : '❌ FALHA'}`);
  console.log(`📋 Funcionalidades Básicas: ${basicTest ? '✅ OK' : '❌ FALHA'}`);
  
  if (loginSuccess && basicTest) {
    console.log('\n🎉 SISTEMA FUNCIONANDO CORRETAMENTE!');
    console.log('✅ Todas as principais funcionalidades estão operacionais');
    console.log('✅ Backend respondendo adequadamente');
    console.log('✅ Autenticação funcionando');
    console.log('✅ APIs acessíveis');
  } else {
    console.log('\n⚠️ SISTEMA COM PROBLEMAS');
    console.log('❌ Verificar configurações do backend');
    console.log('❌ Verificar se o servidor está rodando na porta 3001');
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };
