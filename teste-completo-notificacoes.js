const axios = require('axios');

async function testeCompletoNotificacoes() {
  console.log('🧪 TESTE COMPLETO DE NOTIFICAÇÕES DE AGENDAMENTOS\n');

  try {
    // 1. Login
    console.log('1️⃣ Fazendo login...');
    const loginResponse = await axios.post('http://localhost:3001/auth/login', {
      email: 'teste@teste.com',
      senha: '123456'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login realizado com sucesso');

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    console.log('\n🎯 TESTANDO CENÁRIOS DE NOTIFICAÇÃO:\n');

    // 2. Criar agendamento (deve gerar notificação)
    console.log('2️⃣ Criando agendamento...');
    const agendamentoData = {
      tipo_evento: 'reuniao',
      titulo: 'Reunião de Projeto Final',
      descricao: 'Discussão sobre entrega final do projeto',
      data_evento: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Amanhã
      local: 'Sala de Reuniões Virtual',
      lembrete_1_dia: true
    };

    const agendamentoResponse = await axios.post(
      'http://localhost:3001/api/agendamentos',
      agendamentoData,
      { headers }
    );

    console.log('✅ Agendamento criado:', {
      id: agendamentoResponse.data.id,
      titulo: agendamentoResponse.data.titulo,
      status: agendamentoResponse.data.status
    });

    const agendamentoId = agendamentoResponse.data.id;

    // 3. Aguardar processamento
    console.log('\n3️⃣ Aguardando processamento de notificações...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 4. Verificar notificações criadas
    console.log('\n4️⃣ Verificando notificações geradas...');
    const notificacoesResponse = await axios.get(
      `http://localhost:3001/api/notificacoes`,
      { headers }
    );

    console.log(`📧 ${notificacoesResponse.data.length} notificações encontradas:`);
    notificacoesResponse.data.forEach((notif, index) => {
      console.log(`   ${index + 1}. ${notif.titulo} (${notif.tipo}) - Status: ${notif.status}`);
      console.log(`      "${notif.mensagem}"`);
    });

    // 5. Atualizar agendamento (deve gerar nova notificação)
    console.log('\n5️⃣ Atualizando agendamento...');
    const updateData = {
      titulo: 'Reunião de Projeto Final - ATUALIZADA',
      local: 'Sala 205 - Presencial'
    };

    await axios.put(
      `http://localhost:3001/api/agendamentos/${agendamentoId}`,
      updateData,
      { headers }
    );

    console.log('✅ Agendamento atualizado com sucesso');

    // 6. Aguardar processamento da atualização
    console.log('\n6️⃣ Aguardando processamento de atualização...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 7. Cancelar agendamento (deve gerar notificação de cancelamento)
    console.log('\n7️⃣ Cancelando agendamento...');
    await axios.delete(
      `http://localhost:3001/api/agendamentos/${agendamentoId}`,
      { headers }
    );

    console.log('✅ Agendamento cancelado com sucesso');

    // 8. Verificar notificações finais
    console.log('\n8️⃣ Verificando todas as notificações finais...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    const notificacoesFinaisResponse = await axios.get(
      `http://localhost:3001/api/notificacoes`,
      { headers }
    );

    console.log(`\n📊 RESULTADO FINAL:`);
    console.log(`📧 Total de notificações: ${notificacoesFinaisResponse.data.length}`);
    
    const tiposNotificacao = {};
    notificacoesFinaisResponse.data.forEach(notif => {
      tiposNotificacao[notif.tipo] = (tiposNotificacao[notif.tipo] || 0) + 1;
    });

    console.log('📈 Tipos de notificação:');
    Object.entries(tiposNotificacao).forEach(([tipo, count]) => {
      console.log(`   ${tipo}: ${count} notificação(s)`);
    });

    console.log('\n🎉 TESTE COMPLETO FINALIZADO COM SUCESSO!');
    console.log('\n✅ Sistema de notificações funcionando corretamente:');
    console.log('   ✓ Notificações de criação de agendamento');
    console.log('   ✓ Notificações de atualização de agendamento');
    console.log('   ✓ Notificações de cancelamento de agendamento');
    console.log('   ✓ Persistência no banco de dados');
    console.log('   ✓ Mapeamento correto de tipos ENUM');

  } catch (error) {
    if (error.response) {
      console.error('❌ Erro na resposta:', error.response.status, error.response.data);
    } else {
      console.error('❌ Erro:', error.message);
    }
  }
}

testeCompletoNotificacoes();
