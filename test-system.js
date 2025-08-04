#!/usr/bin/env node

/**
 * Script de Teste Final - Sistema NPJ
 * Verifica se frontend e backend estão comunicando corretamente
 */

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testSystem() {
  console.log('🧪 TESTE FINAL DO SISTEMA NPJ');
  console.log('=============================\n');

  let allPassed = true;

  // 1. Testar Backend
  console.log('📡 Testando Backend...');
  try {
    const backendResponse = await fetch('http://localhost:3001/test');
    const backendData = await backendResponse.json();
    
    if (backendResponse.ok) {
      console.log('✅ Backend: Funcionando');
      console.log(`   Mensagem: ${backendData.message}`);
      console.log(`   DB: ${backendData.dbAvailable ? 'Conectado' : 'Desconectado'}`);
    } else {
      console.log('❌ Backend: Falhou');
      allPassed = false;
    }
  } catch (error) {
    console.log('❌ Backend: Erro de conexão');
    console.log(`   Erro: ${error.message}`);
    allPassed = false;
  }

  console.log('');

  // 2. Testar Frontend
  console.log('🌐 Testando Frontend...');
  try {
    const frontendResponse = await fetch('http://localhost:5173');
    
    if (frontendResponse.ok) {
      console.log('✅ Frontend: Funcionando');
      console.log('   URL: http://localhost:5173');
    } else {
      console.log('❌ Frontend: Falhou');
      allPassed = false;
    }
  } catch (error) {
    console.log('❌ Frontend: Erro de conexão');
    console.log(`   Erro: ${error.message}`);
    allPassed = false;
  }

  console.log('');

  // 3. Testar API Authentication
  console.log('🔐 Testando API Auth...');
  try {
    const loginResponse = await fetch('http://localhost:3001/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@npj.com',
        senha: 'admin123'
      })
    });

    const loginData = await loginResponse.json();

    if (loginResponse.ok && loginData.success) {
      console.log('✅ Auth: Login funcionando');
      console.log(`   Usuário: ${loginData.usuario?.nome || 'Admin'}`);
      
      // Testar endpoint autenticado
      const profileResponse = await fetch('http://localhost:3001/auth/perfil', {
        headers: {
          'Authorization': `Bearer ${loginData.token}`
        }
      });

      if (profileResponse.ok) {
        console.log('✅ Auth: Token válido');
      } else {
        console.log('⚠️ Auth: Problema com token');
      }
    } else {
      console.log('❌ Auth: Login falhou');
      console.log(`   Erro: ${loginData.message || 'Desconhecido'}`);
      allPassed = false;
    }
  } catch (error) {
    console.log('❌ Auth: Erro de conexão');
    console.log(`   Erro: ${error.message}`);
    allPassed = false;
  }

  console.log('');

  // 4. Testar CORS
  console.log('🌍 Testando CORS...');
  try {
    const corsResponse = await fetch('http://localhost:3001/api/tabelas/roles', {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:5173',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'authorization,content-type'
      }
    });

    if (corsResponse.ok || corsResponse.status === 204) {
      console.log('✅ CORS: Configurado corretamente');
    } else {
      console.log('⚠️ CORS: Possível problema de configuração');
    }
  } catch (error) {
    console.log('❌ CORS: Erro ao testar');
  }

  console.log('');

  // Resultado Final
  console.log('📊 RESULTADO FINAL');
  console.log('=================');
  if (allPassed) {
    console.log('🎉 SISTEMA TOTALMENTE FUNCIONAL!');
    console.log('');
    console.log('📌 URLs de Acesso:');
    console.log('   Frontend: http://localhost:5173');
    console.log('   Backend:  http://localhost:3001');
    console.log('');
    console.log('🔑 Credenciais de Teste:');
    console.log('   Email: admin@npj.com');
    console.log('   Senha: admin123');
  } else {
    console.log('🚨 SISTEMA COM PROBLEMAS');
    console.log('   Verifique os logs acima para mais detalhes');
  }

  console.log('');
  console.log('✨ Teste concluído!');
}

// Executar teste
testSystem().catch(console.error);
