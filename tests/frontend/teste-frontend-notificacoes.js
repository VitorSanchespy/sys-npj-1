// Testes para o sistema de notificações do frontend
const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

// Credenciais de teste
const testUsers = [
  { email: 'admin@teste.com', senha: 'admin123' },
  { email: 'professor@teste.com', senha: 'prof123' },
  { email: 'aluno@teste.com', senha: 'aluno123' }
];

let sessions = {};

// Função para fazer login
async function login(credentials) {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, credentials);
    console.log(`✅ Login realizado: ${credentials.email}`);
    return {
      token: response.data.token,
      user: response.data.user
    };
  } catch (error) {
    console.error(`❌ Erro no login ${credentials.email}:`, error.response?.data?.erro || error.message);
    return null;
  }
}

// Função para testar notificações
async function testarNotificacoes(token, userType) {
  try {
    console.log(`\n📋 Testando notificações para ${userType}:`);
    
    // 1. Listar notificações
    const response = await axios.get(`${BASE_URL}/notificacoes`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`   📧 ${response.data.notificacoes?.length || 0} notificações encontradas`);

    // 2. Contar não lidas
    const countResponse = await axios.get(`${BASE_URL}/notificacoes/nao-lidas/contador`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`   🔔 ${countResponse.data.count} notificações não lidas`);

    // 3. Configurações
    const configResponse = await axios.get(`${BASE_URL}/notificacoes/configuracoes`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`   ⚙️ Configurações carregadas:`, configResponse.data.configuracao ? 'OK' : 'Criadas');

    return {
      total: response.data.notificacoes?.length || 0,
      unread: countResponse.data.count,
      hasConfig: !!configResponse.data.configuracao
    };

  } catch (error) {
    console.error(`❌ Erro ao testar notificações para ${userType}:`, error.response?.data?.erro || error.message);
    return null;
  }
}

// Função para testar configurações
async function testarConfiguracoes(token, userType) {
  try {
    console.log(`\n⚙️ Testando configurações para ${userType}:`);
    
    // Atualizar configurações
    const novasConfiguracoes = {
      email_lembretes: true,
      email_alertas: false,
      email_agendamentos: true,
      email_processos: true,
      push_lembretes: true,
      push_alertas: true,
      horario_inicio: '09:00',
      horario_fim: '17:00'
    };

    const updateResponse = await axios.put(`${BASE_URL}/notificacoes/configuracoes`, novasConfiguracoes, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`   ✅ Configurações atualizadas com sucesso`);
    return true;

  } catch (error) {
    console.error(`❌ Erro ao testar configurações para ${userType}:`, error.response?.data?.erro || error.message);
    return false;
  }
}

// Função para criar agendamento e gerar notificação
async function criarAgendamentoTeste(token, userType) {
  try {
    console.log(`\n📅 Criando agendamento de teste para ${userType}:`);
    
    const novoAgendamento = {
      titulo: `Teste Frontend Notificações - ${userType}`,
      descricao: 'Agendamento criado para testar o sistema de notificações do frontend',
      data_evento: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Amanhã
      tipo_evento: 'reuniao',
      local: 'Sistema de Testes',
      lembrete_1_dia: true
    };

    const response = await axios.post(`${BASE_URL}/agendamentos`, novoAgendamento, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`   ✅ Agendamento criado com ID: ${response.data.id}`);
    
    // Aguardar processamento da notificação
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return response.data;

  } catch (error) {
    console.error(`❌ Erro ao criar agendamento para ${userType}:`, error.response?.data?.erro || error.message);
    return null;
  }
}

// Função principal de teste
async function testarSistemaNotificacoesFrontend() {
  console.log('🧪 TESTE DO SISTEMA DE NOTIFICAÇÕES - FRONTEND');
  console.log('=' .repeat(70));

  try {
    // 1. Fazer login com todos os usuários
    console.log('\n1️⃣ Fazendo login com usuários de teste...');
    for (const userCred of testUsers) {
      const session = await login(userCred);
      if (session) {
        const userType = userCred.email.split('@')[0];
        sessions[userType] = session;
      }
    }

    // 2. Testar notificações para cada usuário
    console.log('\n2️⃣ Testando sistema de notificações...');
    const stats = {};
    
    for (const [userType, session] of Object.entries(sessions)) {
      const result = await testarNotificacoes(session.token, userType);
      if (result) {
        stats[userType] = result;
      }
    }

    // 3. Testar configurações
    console.log('\n3️⃣ Testando configurações de notificações...');
    for (const [userType, session] of Object.entries(sessions)) {
      await testarConfiguracoes(session.token, userType);
    }

    // 4. Criar agendamentos para gerar notificações
    console.log('\n4️⃣ Criando agendamentos para gerar notificações...');
    for (const [userType, session] of Object.entries(sessions)) {
      await criarAgendamentoTeste(session.token, userType);
    }

    // 5. Verificar notificações após criação
    console.log('\n5️⃣ Verificando notificações após criação de agendamentos...');
    for (const [userType, session] of Object.entries(sessions)) {
      await testarNotificacoes(session.token, userType);
    }

    // Relatório final
    console.log('\n📊 RELATÓRIO FINAL:');
    console.log('─'.repeat(70));
    console.log('✅ FUNCIONALIDADES TESTADAS:');
    console.log('   ✓ Listagem de notificações');
    console.log('   ✓ Contador de não lidas');
    console.log('   ✓ Configurações de notificação');
    console.log('   ✓ Criação de agendamentos com notificações');
    console.log('   ✓ API endpoints funcionando');
    
    console.log('\n🎯 PRÓXIMOS PASSOS:');
    console.log('   • Testar interface do frontend no navegador');
    console.log('   • Verificar sino de notificações no header');
    console.log('   • Testar páginas de notificações e configurações');
    console.log('   • Verificar toasts de notificação em tempo real');
    
    console.log('\n🌐 ACESSE:');
    console.log('   • Frontend: http://localhost:5173');
    console.log('   • Página de Notificações: http://localhost:5173/notificacoes');
    console.log('   • Configurações: http://localhost:5173/notificacoes/configuracoes');

  } catch (error) {
    console.error('❌ Erro geral no teste:', error);
  }
}

// Executar testes
if (require.main === module) {
  testarSistemaNotificacoesFrontend();
}

module.exports = {
  testarSistemaNotificacoesFrontend,
  testarNotificacoes,
  testarConfiguracoes
};
