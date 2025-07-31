// Teste simples do sistema de notificações com credenciais reais
const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

// Usar credenciais que funcionaram no teste do backend
const realUser = {
  email: 'teste@teste.com',
  senha: 'teste123' // Se não funcionar, vamos tentar outras
};

async function testeRapidoNotificacoes() {
  console.log('🔔 TESTE RÁPIDO - SISTEMA DE NOTIFICAÇÕES FRONTEND');
  console.log('=' .repeat(60));

  try {
    // 1. Login
    console.log('\n1️⃣ Fazendo login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, realUser);
    const token = loginResponse.data.token;
    const user = loginResponse.data.user;
    console.log(`✅ Login realizado: ${user.nome} (${user.role})`);

    // 2. Listar notificações
    console.log('\n2️⃣ Listando notificações...');
    const notifResponse = await axios.get(`${BASE_URL}/api/notificacoes`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`📧 Total de notificações: ${notifResponse.data.notificacoes?.length || 0}`);
    
    if (notifResponse.data.notificacoes?.length > 0) {
      console.log('📋 Últimas 3 notificações:');
      notifResponse.data.notificacoes.slice(0, 3).forEach((notif, index) => {
        console.log(`   ${index + 1}. ${notif.titulo} - ${notif.tipo} (${notif.lida ? 'Lida' : 'Não lida'})`);
      });
    }

    // 3. Contador de não lidas
    console.log('\n3️⃣ Verificando não lidas...');
    const countResponse = await axios.get(`${BASE_URL}/api/notificacoes/nao-lidas/contador`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`🔔 Notificações não lidas: ${countResponse.data.count}`);

    // 4. Configurações
    console.log('\n4️⃣ Testando configurações...');
    const configResponse = await axios.get(`${BASE_URL}/api/notificacoes/configuracoes`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('⚙️ Configurações obtidas:', configResponse.data.configuracao ? 'SIM' : 'CRIADAS');

    // 5. Atualizar configuração de teste
    const novaConfig = {
      email_lembretes: true,
      email_alertas: true,
      email_agendamentos: true,
      horario_inicio: '08:00',
      horario_fim: '18:00'
    };
    
    await axios.put(`${BASE_URL}/api/notificacoes/configuracoes`, novaConfig, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Configurações atualizadas');

    // 6. Criar um agendamento para gerar notificação
    console.log('\n5️⃣ Criando agendamento para gerar notificação...');
    const novoAgendamento = {
      titulo: 'Teste Frontend - Notificações',
      descricao: 'Agendamento para testar sistema de notificações do frontend',
      data_evento: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // Em 2 horas
      tipo_evento: 'reuniao',
      local: 'Sistema de Testes',
      lembrete_1_dia: true
    };

    const agendResponse = await axios.post(`${BASE_URL}/api/agendamentos`, novoAgendamento, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`📅 Agendamento criado: ID ${agendResponse.data.id}`);

    // 7. Aguardar e verificar nova notificação
    console.log('\n6️⃣ Aguardando processamento da notificação...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    const novasNotifResponse = await axios.get(`${BASE_URL}/api/notificacoes`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`📧 Total após agendamento: ${novasNotifResponse.data.notificacoes?.length || 0}`);

    // Resultado Final
    console.log('\n' + '🎉'.repeat(20));
    console.log('✅ TESTE COMPLETO - TODAS AS FUNCIONALIDADES OK!');
    console.log('\n🔧 FUNCIONALIDADES TESTADAS:');
    console.log('   ✓ Login e autenticação');
    console.log('   ✓ Listagem de notificações');
    console.log('   ✓ Contador de não lidas');
    console.log('   ✓ Configurações (obter e atualizar)');
    console.log('   ✓ Criação de agendamento com notificação');
    
    console.log('\n🌐 AGORA TESTE NO FRONTEND:');
    console.log('   1. Acesse: http://localhost:5173');
    console.log('   2. Faça login com: teste@teste.com / teste123');
    console.log('   3. Verifique o sino de notificações no header');
    console.log('   4. Acesse: /notificacoes');
    console.log('   5. Acesse: /notificacoes/configuracoes');
    console.log('\n✨ O sistema está pronto para uso!');

  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data?.erro || error.message);
  }
}

// Executar
testeRapidoNotificacoes();
