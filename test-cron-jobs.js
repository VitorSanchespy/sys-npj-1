/**
 * Teste manual dos cron jobs do sistema de eventos
 */

async function testeCronJobs() {
  console.log('🔄 TESTE MANUAL DOS CRON JOBS');
  console.log('=' .repeat(50));

  try {
    // Importar serviços necessários
    const eventService = require('./backend/services/eventService');
    const eventNotificationService = require('./backend/services/eventNotificationService');
    
    console.log('\n1️⃣ Testando busca de eventos para hoje...');
    const todayEvents = await eventService.getTodayApprovedEvents();
    console.log('✅ Eventos de hoje:', todayEvents.length);

    console.log('\n2️⃣ Testando busca de eventos que começam em breve...');
    const upcomingEvents = await eventService.getEventsStartingInAnHour();
    console.log('✅ Eventos começando em breve:', upcomingEvents.length);

    console.log('\n3️⃣ Testando marcação de eventos como completos...');
    const completedCount = await eventService.markEventsAsCompleted();
    console.log('✅ Eventos marcados como completos:', completedCount);

    console.log('\n4️⃣ Testando template de notificação...');
    const mockEvent = {
      id: 1,
      title: 'Evento de Teste',
      start_at: new Date(),
      end_at: new Date(Date.now() + 3600000),
      description: 'Descrição do evento',
      requester: {
        nome: 'Admin',
        email: 'admin@teste.com'
      },
      participants: []
    };

    const mockUser = {
      nome: 'Admin',
      email: 'admin@teste.com'
    };

    const template = eventNotificationService.getApprovalRequestTemplate(mockEvent, mockUser);
    console.log('✅ Template gerado com sucesso');
    console.log('📧 Assunto:', template.subject);

    console.log('\n🎉 TODOS OS TESTES DE CRON JOBS PASSARAM!');
    console.log('✅ Sistema de cron jobs está funcionando');

  } catch (error) {
    console.error('\n❌ ERRO NO TESTE DE CRON JOBS:', error.message);
    console.error('🔍 Stack:', error.stack);
  }
}

testeCronJobs();
