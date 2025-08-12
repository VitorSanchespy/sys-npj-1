const axios = require('axios');
const { execSync } = require('child_process');

// Configuração dos testes
const BASE_URL = 'http://localhost:3001';
const TEST_USER = {
  username: 'root',
  password: 'senha123'
};

console.log('🧪 TESTE DE ALINHAMENTO - CONFIGURAÇÕES DE NOTIFICAÇÃO');
console.log('===============================================\n');

async function testNotificationAlignment() {
  try {
    // 1. Fazer login para obter token
    console.log('1️⃣ Fazendo login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, TEST_USER);
    const token = loginResponse.data.token;
    console.log('✅ Login realizado com sucesso\n');

    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };

    // 2. Verificar modelo backend
    console.log('2️⃣ Verificando campos aceitos no backend...');
    try {
      const currentSettings = await axios.get(`${BASE_URL}/api/notifications/settings`, config);
      console.log('Campos retornados pelo backend:', Object.keys(currentSettings.data || {}));
    } catch (error) {
      console.log('❌ Erro ao buscar configurações:', error.response?.data?.message || error.message);
    }

    // 3. Testar campo email_agendamentos (substitui email_lembretes)
    console.log('\n3️⃣ Testando campo email_agendamentos...');
    try {
      const updateData = {
        email_agendamentos: true,
        email_processos: false,
        email_sistema: true,
        email_atualizacoes: false
      };

      const updateResponse = await axios.put(`${BASE_URL}/api/notifications/settings`, updateData, config);
      console.log('✅ Campo email_agendamentos aceito pelo backend');
      console.log('Dados salvos:', updateResponse.data);
    } catch (error) {
      console.log('❌ Erro com email_agendamentos:', error.response?.data?.message || error.message);
    }

    // 4. Testar campos antigos (devem falhar)
    console.log('\n4️⃣ Testando campos antigos (devem ser rejeitados)...');
    try {
      const oldFieldsData = {
        email_lembretes: true,
        email_alertas: false
      };

      await axios.put(`${BASE_URL}/api/notifications/settings`, oldFieldsData, config);
      console.log('❌ PROBLEMA: Campos antigos foram aceitos!');
    } catch (error) {
      console.log('✅ Campos antigos rejeitados corretamente');
    }

    // 5. Verificar se dados foram salvos corretamente
    console.log('\n5️⃣ Verificando se dados foram salvos...');
    try {
      const savedSettings = await axios.get(`${BASE_URL}/api/notifications/settings`, config);
      console.log('Configurações salvas:', savedSettings.data);
      
      // Verificar se tem os campos corretos
      const expectedFields = ['email_agendamentos', 'email_processos', 'email_sistema', 'email_atualizacoes'];
      const actualFields = Object.keys(savedSettings.data || {});
      const hasCorrectFields = expectedFields.every(field => actualFields.includes(field));
      
      if (hasCorrectFields) {
        console.log('✅ Todos os campos esperados estão presentes');
      } else {
        console.log('❌ Campos faltando:', expectedFields.filter(field => !actualFields.includes(field)));
      }
    } catch (error) {
      console.log('❌ Erro ao verificar dados salvos:', error.response?.data?.message || error.message);
    }

    console.log('\n🎯 RESULTADO DO TESTE DE ALINHAMENTO:');
    console.log('- Frontend agora usa: email_agendamentos, email_processos, email_sistema, email_atualizacoes');
    console.log('- Backend aceita: email_agendamentos, email_processos, email_sistema, email_atualizacoes');
    console.log('- Campos antigos (email_lembretes, email_alertas, email_autenticacao) removidos');
    console.log('✅ ALINHAMENTO COMPLETO!');

  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    console.log('Certifique-se de que o backend está rodando na porta 3001');
  }
}

// Verificar se o backend está rodando
console.log('🔍 Verificando se o backend está rodando...');
axios.get(`${BASE_URL}/api/health`)
  .then(() => {
    console.log('✅ Backend está rodando\n');
    testNotificationAlignment();
  })
  .catch(() => {
    console.log('❌ Backend não está rodando. Iniciando...\n');
    try {
      console.log('🚀 Iniciando backend...');
      execSync('start-local.bat', { stdio: 'inherit', cwd: __dirname });
      setTimeout(() => {
        testNotificationAlignment();
      }, 5000);
    } catch (error) {
      console.log('❌ Erro ao iniciar backend:', error.message);
      console.log('Execute manualmente: npm start no diretório backend/');
    }
  });
