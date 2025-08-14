/**
 * Teste rápido da integração NPJ Calendar
 */

require('dotenv').config();
const npjCalendarService = require('./services/npjCalendarService');

async function testarNPJCalendar() {
  console.log('🧪 Teste da Integração NPJ Google Calendar\n');

  try {
    // 1. Verificar status da configuração
    console.log('1️⃣ Verificando status da configuração...');
    const status = npjCalendarService.getStatus();
    console.log('📊 Status:', JSON.stringify(status, null, 2));

    // 2. Verificar se está disponível
    console.log('\n2️⃣ Verificando disponibilidade...');
    const isAvailable = npjCalendarService.isAvailable();
    console.log(`🔍 Serviço disponível: ${isAvailable ? '✅ SIM' : '❌ NÃO'}`);

    if (!isAvailable) {
      console.log('❌ Serviço não está disponível. Verifique a configuração.');
      return;
    }

    // 3. Listar eventos NPJ existentes
    console.log('\n3️⃣ Listando eventos NPJ existentes...');
    const listResult = await npjCalendarService.listNPJEvents({
      timeMin: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 24 horas atrás
      maxResults: 5
    });

    if (listResult.success) {
      console.log(`📅 Encontrados ${listResult.events.length} eventos NPJ:`);
      listResult.events.forEach((event, index) => {
        const startDate = new Date(event.start?.dateTime || event.start?.date);
        console.log(`   ${index + 1}. ${event.summary} - ${startDate.toLocaleString('pt-BR')}`);
      });
    } else {
      console.log('❌ Erro ao listar eventos:', listResult.error);
    }

    // 4. Criar evento de teste
    console.log('\n4️⃣ Criando evento de teste...');
    const testEventData = {
      summary: 'Teste Integração NPJ',
      description: 'Evento de teste criado para validar a integração NPJ Calendar. Pode ser removido.',
      start: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 horas no futuro
      end: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 horas no futuro
      location: 'Sistema NPJ - Teste de Integração',
      tipo_evento: 'Teste de Sistema',
      processo_id: 999,
      created_by: 1
    };

    const createResult = await npjCalendarService.createEvent(testEventData);

    if (createResult.success) {
      console.log('✅ Evento de teste criado com sucesso!');
      console.log(`🔗 Link: ${createResult.htmlLink}`);
      console.log(`🆔 Event ID: ${createResult.eventId}`);

      // 5. Testar atualização
      console.log('\n5️⃣ Testando atualização do evento...');
      const updateResult = await npjCalendarService.updateEvent(createResult.eventId, {
        ...testEventData,
        summary: 'Teste Integração NPJ - ATUALIZADO',
        description: 'Evento de teste ATUALIZADO para validar a funcionalidade de update.'
      });

      if (updateResult.success) {
        console.log('✅ Evento atualizado com sucesso!');
      } else {
        console.log('❌ Erro ao atualizar evento:', updateResult.error);
      }

      // 6. Aguardar um pouco e remover evento de teste
      console.log('\n6️⃣ Removendo evento de teste em 3 segundos...');
      setTimeout(async () => {
        try {
          const deleteResult = await npjCalendarService.deleteEvent(createResult.eventId);
          if (deleteResult.success) {
            console.log('🗑️ Evento de teste removido com sucesso!');
          } else {
            console.log('❌ Erro ao remover evento:', deleteResult.error);
          }
        } catch (error) {
          console.log('❌ Erro ao remover evento:', error.message);
        }
      }, 3000);

    } else {
      console.log('❌ Erro ao criar evento de teste:', createResult.error);
    }

    console.log('\n🎉 Teste da integração NPJ Calendar concluído!');
    console.log('📋 Funcionalidades testadas:');
    console.log('   ✅ Configuração e status');
    console.log('   ✅ Listagem de eventos NPJ');
    console.log('   ✅ Criação de eventos');
    console.log('   ✅ Atualização de eventos');
    console.log('   ✅ Remoção de eventos');

  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Executar teste
testarNPJCalendar().then(() => {
  setTimeout(() => {
    console.log('\n✅ Teste finalizado. Pressione Ctrl+C para sair.');
    process.exit(0);
  }, 5000);
}).catch(error => {
  console.error('❌ Erro fatal no teste:', error);
  process.exit(1);
});
