/**
 * Cron jobs para o sistema de eventos
 */
const cron = require('node-cron');
const eventService = require('../services/eventService');
const eventNotificationService = require('../services/eventNotificationService');
const { usuarioModel: Usuario } = require('../models/indexModel');

class EventCronJobs {
  constructor() {
    this.jobs = [];
    this.isRunning = false;
  }

  /**
   * Inicializar todos os cron jobs
   */
  start() {
    if (this.isRunning) {
      console.log('⚠️ Cron jobs de eventos já estão rodando');
      return;
    }

    try {
      this.scheduleJobs();
      this.isRunning = true;
      console.log('✅ Cron jobs de eventos iniciados com sucesso');
    } catch (error) {
      console.error('❌ Erro ao iniciar cron jobs de eventos:', error);
      throw error;
    }
  }

  /**
   * Parar todos os cron jobs
   */
  stop() {
    this.jobs.forEach(job => {
      if (job && typeof job.destroy === 'function') {
        job.destroy();
      }
    });
    this.jobs = [];
    this.isRunning = false;
    console.log('🛑 Cron jobs de eventos parados');
  }

  /**
   * Agendar todos os jobs
   */
  scheduleJobs() {
    // 1. Lembretes diários às 06:00
    const dailyReminderJob = cron.schedule('0 6 * * *', async () => {
      await this.sendDailyReminders();
    }, {
      scheduled: true,
      timezone: 'America/Cuiaba'
    });
    this.jobs.push(dailyReminderJob);
    console.log('📅 Job de lembretes diários agendado para 06:00');

    // 2. Lembretes por hora a cada 5 minutos
    const hourlyReminderJob = cron.schedule('*/5 * * * *', async () => {
      await this.sendHourlyReminders();
    }, {
      scheduled: true,
      timezone: 'America/Cuiaba'
    });
    this.jobs.push(hourlyReminderJob);
    console.log('⏰ Job de lembretes por hora agendado para cada 5 minutos');

    // 3. Marcar eventos como completos a cada 15 minutos
    const completionJob = cron.schedule('*/15 * * * *', async () => {
      await this.markEventsAsCompleted();
    }, {
      scheduled: true,
      timezone: 'America/Cuiaba'
    });
    this.jobs.push(completionJob);
    console.log('✅ Job de completar eventos agendado para cada 15 minutos');

    // 4. Job de limpeza de notificações antigas (opcional) - diário às 02:00
    const cleanupJob = cron.schedule('0 2 * * *', async () => {
      await this.cleanupOldNotifications();
    }, {
      scheduled: true,
      timezone: 'America/Cuiaba'
    });
    this.jobs.push(cleanupJob);
    console.log('🧹 Job de limpeza agendado para 02:00');
  }

  /**
   * Enviar lembretes diários
   */
  async sendDailyReminders() {
    try {
      console.log('📅 Iniciando envio de lembretes diários...');

      // Buscar eventos aprovados para hoje
      const todayEvents = await eventService.getTodayApprovedEvents();

      if (todayEvents.length === 0) {
        console.log('📅 Nenhum evento aprovado para hoje');
        return;
      }

      console.log(`📅 Encontrados ${todayEvents.length} evento(s) para hoje`);

      // Agrupar eventos por usuário (solicitante + participantes)
      const userEvents = new Map();

      for (const event of todayEvents) {
        // Adicionar solicitante
        if (event.requester) {
          if (!userEvents.has(event.requester.id)) {
            userEvents.set(event.requester.id, {
              user: event.requester,
              events: []
            });
          }
          userEvents.get(event.requester.id).events.push(event);
        }

        // Adicionar participantes
        if (event.participants) {
          for (const participant of event.participants) {
            if (participant.user) {
              if (!userEvents.has(participant.user.id)) {
                userEvents.set(participant.user.id, {
                  user: participant.user,
                  events: []
                });
              }
              userEvents.get(participant.user.id).events.push(event);
            }
          }
        }
      }

      // Enviar lembretes para cada usuário
      let successCount = 0;
      let errorCount = 0;

      for (const [userId, userData] of userEvents) {
        try {
          await eventNotificationService.sendDailyReminder(userData.user, userData.events);
          successCount++;
        } catch (error) {
          console.error(`❌ Erro ao enviar lembrete diário para usuário ${userId}:`, error.message);
          errorCount++;
        }
      }

      console.log(`📅 Lembretes diários enviados: ${successCount} sucessos, ${errorCount} erros`);
    } catch (error) {
      console.error('❌ Erro no job de lembretes diários:', error);
    }
  }

  /**
   * Enviar lembretes por hora
   */
  async sendHourlyReminders() {
    try {
      console.log('⏰ Verificando eventos que começam em breve...');

      // Buscar eventos que começam em ~60 minutos
      const upcomingEvents = await eventService.getEventsStartingInAnHour();

      if (upcomingEvents.length === 0) {
        return; // Não logar se não houver eventos
      }

      console.log(`⏰ Encontrados ${upcomingEvents.length} evento(s) começando em breve`);

      let successCount = 0;
      let errorCount = 0;

      for (const event of upcomingEvents) {
        // Enviar para solicitante
        if (event.requester) {
          try {
            await eventNotificationService.sendHourlyReminder(event, event.requester);
            successCount++;
          } catch (error) {
            console.error(`❌ Erro ao enviar lembrete por hora para solicitante ${event.requester.id}:`, error.message);
            errorCount++;
          }
        }

        // Enviar para participantes
        if (event.participants) {
          for (const participant of event.participants) {
            if (participant.user) {
              try {
                await eventNotificationService.sendHourlyReminder(event, participant.user);
                successCount++;
              } catch (error) {
                console.error(`❌ Erro ao enviar lembrete por hora para participante ${participant.user.id}:`, error.message);
                errorCount++;
              }
            }
          }
        }
      }

      console.log(`⏰ Lembretes por hora enviados: ${successCount} sucessos, ${errorCount} erros`);
    } catch (error) {
      console.error('❌ Erro no job de lembretes por hora:', error);
    }
  }

  /**
   * Marcar eventos como completos
   */
  async markEventsAsCompleted() {
    try {
      console.log('✅ Verificando eventos para marcar como completos...');

      const completedCount = await eventService.markEventsAsCompleted();

      if (completedCount > 0) {
        console.log(`✅ ${completedCount} evento(s) marcado(s) como completo(s)`);
      }
    } catch (error) {
      console.error('❌ Erro no job de completar eventos:', error);
    }
  }

  /**
   * Limpeza de notificações antigas (opcional)
   */
  async cleanupOldNotifications() {
    try {
      console.log('🧹 Iniciando limpeza de notificações antigas...');

      const { eventNotificationModel: EventNotification } = require('../models/indexModel');
      const { Op } = require('sequelize');

      // Remover notificações com mais de 30 dias
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const deletedCount = await EventNotification.destroy({
        where: {
          sent_at: {
            [Op.lt]: thirtyDaysAgo
          }
        }
      });

      if (deletedCount > 0) {
        console.log(`🧹 ${deletedCount} notificação(ões) antiga(s) removida(s)`);
      }
    } catch (error) {
      console.error('❌ Erro na limpeza de notificações:', error);
    }
  }

  /**
   * Obter status dos jobs
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      jobsCount: this.jobs.length,
      jobs: [
        { name: 'Daily Reminders', schedule: '0 6 * * *' },
        { name: 'Hourly Reminders', schedule: '*/5 * * * *' },
        { name: 'Mark Completed', schedule: '*/15 * * * *' },
        { name: 'Cleanup', schedule: '0 2 * * *' }
      ]
    };
  }
}

module.exports = new EventCronJobs();
