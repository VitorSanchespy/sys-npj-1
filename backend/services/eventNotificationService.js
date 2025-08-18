/**
 * Service para notificações de eventos
 * Utiliza nodemailer e templates de email
 */
const nodemailer = require('nodemailer');
const dateUtils = require('../utils/date');

class EventNotificationService {
  constructor() {
    // Configuração do transporter SMTP
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
      port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    this.fromEmail = process.env.EMAIL_FROM || 'noreply@npj.ufmt.br';
    this.fromName = 'NPJ - Sistema de Eventos';
    this.frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  }

  /**
   * Carregar models de forma lazy para evitar importações circulares
   */
  getModels() {
    const { eventNotificationModel: EventNotification, usuarioModel: Usuario, roleModel: Role } = require('../models/indexModel');
    return { EventNotification, Usuario, Role };
  }

  /**
   * Verificar se já foi enviada uma notificação específica
   */
  async wasAlreadySent(eventId, type, additionalMeta = {}) {
    const { EventNotification } = this.getModels();
    return await EventNotification.wasAlreadySent(eventId, type, additionalMeta);
  }

  /**
   * Registrar notificação como enviada
   */
  async registerNotification(eventId, type, meta = {}) {
    try {
      const { EventNotification } = this.getModels();
      await EventNotification.create({
        event_id: eventId,
        type: type,
        sent_at: new Date(),
        meta: meta
      });
    } catch (error) {
      console.error('Erro ao registrar notificação:', error);
    }
  }

  /**
   * Enviar email genérico
   */
  async sendEmail(to, subject, html, meta = {}) {
    try {
      // Modo desenvolvimento: apenas simular envio
      if (process.env.NODE_ENV === 'development') {
        console.log(`📧 [MODO DEV] Simulando envio de email:`);
        console.log(`   Para: ${to}`);
        console.log(`   Assunto: ${subject}`);
        console.log(`   ✅ Email "enviado" (simulado)`);
        return { success: true, messageId: 'dev-' + Date.now(), simulated: true };
      }

      const mailOptions = {
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to: to,
        subject: subject,
        html: html
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email enviado: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Erro ao enviar email:', error.message);
      
      // Em desenvolvimento, simular sucesso para não quebrar o fluxo
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 [MODO DEV] Simulando sucesso devido ao erro SMTP');
        return { success: true, messageId: 'dev-fallback-' + Date.now(), simulated: true };
      }
      
      throw error;
    }
  }

  /**
   * Buscar responsáveis para aprovação (admins e professores)
   */
  async getResponsibleUsers() {
    try {
      const { Usuario, Role } = this.getModels();
      // Usar o alias 'role' conforme definido no usuarioModel
      const responsibleUsers = await Usuario.findAll({
        include: [
          {
            model: Role,
            as: 'role',
            where: {
              nome: ['Admin', 'Professor']
            }
          }
        ],
        attributes: ['id', 'nome', 'email']
      });

      return responsibleUsers;
    } catch (error) {
      console.error('Erro ao buscar usuários responsáveis:', error);
      return [];
    }
  }

  /**
   * Template: Solicitação de aprovação
   */
  getApprovalRequestTemplate(event, responsible) {
    const startFormatted = dateUtils.formatBrazilian(event.start_at);
    const endFormatted = dateUtils.formatBrazilian(event.end_at);
    
    const approveUrl = `${this.frontendUrl}/admin/events/${event.id}/approve`;
    const rejectUrl = `${this.frontendUrl}/admin/events/${event.id}/reject`;

    return {
      subject: `📋 Nova Solicitação de Evento - ${event.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px;">
          <div style="background: linear-gradient(135deg, #17a2b8 0%, #138496 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">📋 Nova Solicitação de Evento</h1>
          </div>
          
          <div style="padding: 30px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Olá <strong>${responsible.nome}</strong>,</p>
            <p style="font-size: 16px; margin-bottom: 30px;">Uma nova solicitação de evento foi criada e precisa da sua aprovação:</p>
            
            <div style="background-color: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #17a2b8;">
              <div style="display: grid; gap: 15px;">
                <div style="display: flex; align-items: center;">
                  <span style="font-size: 20px; margin-right: 10px;">📅</span>
                  <span><strong>Título:</strong> ${event.title}</span>
                </div>
                <div style="display: flex; align-items: center;">
                  <span style="font-size: 20px; margin-right: 10px;">👤</span>
                  <span><strong>Solicitante:</strong> ${event.requester.nome} (${event.requester.email})</span>
                </div>
                <div style="display: flex; align-items: center;">
                  <span style="font-size: 20px; margin-right: 10px;">🕐</span>
                  <span><strong>Início:</strong> ${startFormatted}</span>
                </div>
                <div style="display: flex; align-items: center;">
                  <span style="font-size: 20px; margin-right: 10px;">🕕</span>
                  <span><strong>Fim:</strong> ${endFormatted}</span>
                </div>
                ${event.description ? `
                <div style="display: flex; align-items: flex-start;">
                  <span style="font-size: 20px; margin-right: 10px;">📝</span>
                  <span><strong>Descrição:</strong> ${event.description}</span>
                </div>
                ` : ''}
                ${event.participants && event.participants.length > 0 ? `
                <div style="display: flex; align-items: flex-start;">
                  <span style="font-size: 20px; margin-right: 10px;">👥</span>
                  <span><strong>Participantes:</strong> ${event.participants.map(p => p.email).join(', ')}</span>
                </div>
                ` : ''}
              </div>
            </div>

            <div style="text-align: center; margin: 40px 0;">
              <p style="font-size: 16px; margin-bottom: 25px; color: #555;">
                <strong>Ações disponíveis:</strong>
              </p>
              
              <div style="display: inline-block; margin: 0 10px;">
                <a href="${approveUrl}" 
                   style="background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; margin: 0 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  ✅ Aprovar
                </a>
              </div>
              
              <div style="display: inline-block; margin: 0 10px;">
                <a href="${rejectUrl}" 
                   style="background: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; margin: 0 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  ❌ Rejeitar
                </a>
              </div>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0; color: #666;">
                Atenciosamente,<br>
                <strong style="color: #17a2b8;">Sistema NPJ</strong>
              </p>
            </div>
          </div>
        </div>
      `
    };
  }

  /**
   * Template: Evento aprovado
   */
  getApprovedTemplate(event) {
    const startFormatted = dateUtils.formatBrazilian(event.start_at);
    const endFormatted = dateUtils.formatBrazilian(event.end_at);

    return {
      subject: `✅ Evento Aprovado - ${event.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px;">
          <div style="background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">✅ Evento Aprovado!</h1>
          </div>
          
          <div style="padding: 30px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Olá <strong>${event.requester.nome}</strong>,</p>
            <p style="font-size: 16px; margin-bottom: 30px;">Seu evento foi aprovado com sucesso!</p>
            
            <div style="background-color: #d4edda; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #28a745;">
              <div style="display: grid; gap: 15px;">
                <div style="display: flex; align-items: center;">
                  <span style="font-size: 20px; margin-right: 10px;">📅</span>
                  <span><strong>Título:</strong> ${event.title}</span>
                </div>
                <div style="display: flex; align-items: center;">
                  <span style="font-size: 20px; margin-right: 10px;">🕐</span>
                  <span><strong>Início:</strong> ${startFormatted}</span>
                </div>
                <div style="display: flex; align-items: center;">
                  <span style="font-size: 20px; margin-right: 10px;">🕕</span>
                  <span><strong>Fim:</strong> ${endFormatted}</span>
                </div>
                ${event.approver ? `
                <div style="display: flex; align-items: center;">
                  <span style="font-size: 20px; margin-right: 10px;">👤</span>
                  <span><strong>Aprovado por:</strong> ${event.approver.nome}</span>
                </div>
                ` : ''}
              </div>
            </div>

            <div style="background-color: #cce7ff; padding: 20px; border-radius: 8px; margin-top: 30px;">
              <p style="margin: 0; font-size: 14px; color: #004085; text-align: center;">
                <strong>📧 Notificações automáticas foram enviadas para todos os participantes.</strong>
              </p>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0; color: #666;">
                Atenciosamente,<br>
                <strong style="color: #28a745;">Sistema NPJ</strong>
              </p>
            </div>
          </div>
        </div>
      `
    };
  }

  /**
   * Template: Evento rejeitado
   */
  getRejectedTemplate(event) {
    return {
      subject: `❌ Evento Rejeitado - ${event.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px;">
          <div style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">❌ Evento Rejeitado</h1>
          </div>
          
          <div style="padding: 30px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Olá <strong>${event.requester.nome}</strong>,</p>
            <p style="font-size: 16px; margin-bottom: 30px;">Infelizmente, seu evento foi rejeitado.</p>
            
            <div style="background-color: #f8d7da; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #dc3545;">
              <div style="display: grid; gap: 15px;">
                <div style="display: flex; align-items: center;">
                  <span style="font-size: 20px; margin-right: 10px;">📅</span>
                  <span><strong>Título:</strong> ${event.title}</span>
                </div>
                ${event.rejection_reason ? `
                <div style="display: flex; align-items: flex-start;">
                  <span style="font-size: 20px; margin-right: 10px;">📝</span>
                  <span><strong>Motivo da rejeição:</strong> ${event.rejection_reason}</span>
                </div>
                ` : ''}
                ${event.approver ? `
                <div style="display: flex; align-items: center;">
                  <span style="font-size: 20px; margin-right: 10px;">👤</span>
                  <span><strong>Rejeitado por:</strong> ${event.approver.nome}</span>
                </div>
                ` : ''}
              </div>
            </div>

            <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin-top: 30px;">
              <p style="margin: 0; font-size: 14px; color: #856404; text-align: center;">
                <strong>💡 Você pode criar uma nova solicitação com as correções necessárias.</strong>
              </p>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0; color: #666;">
                Atenciosamente,<br>
                <strong style="color: #dc3545;">Sistema NPJ</strong>
              </p>
            </div>
          </div>
        </div>
      `
    };
  }

  /**
   * Template: Lembrete diário
   */
  getDailyReminderTemplate(user, events) {
    const eventsHtml = events.map(event => {
      const startFormatted = dateUtils.formatBrazilian(event.start_at);
      const endFormatted = dateUtils.formatBrazilian(event.end_at);
      
      return `
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #ffc107;">
          <h3 style="margin: 0 0 10px 0; color: #856404;">📅 ${event.title}</h3>
          <p style="margin: 5px 0;"><strong>🕐 Início:</strong> ${startFormatted}</p>
          <p style="margin: 5px 0;"><strong>🕕 Fim:</strong> ${endFormatted}</p>
          ${event.description ? `<p style="margin: 5px 0;"><strong>📝 Descrição:</strong> ${event.description}</p>` : ''}
        </div>
      `;
    }).join('');

    return {
      subject: `📅 Seus eventos de hoje - ${dateUtils.formatBrazilian(new Date()).split(' ')[0]}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px;">
          <div style="background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%); color: #212529; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">📅 Seus Eventos de Hoje</h1>
          </div>
          
          <div style="padding: 30px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Olá <strong>${user.nome}</strong>,</p>
            <p style="font-size: 16px; margin-bottom: 30px;">Você tem ${events.length} evento(s) programado(s) para hoje:</p>
            
            ${eventsHtml}

            <div style="background-color: #cce7ff; padding: 20px; border-radius: 8px; margin-top: 30px;">
              <p style="margin: 0; font-size: 14px; color: #004085; text-align: center;">
                <strong>🔔 Você receberá lembretes específicos próximo ao horário de cada evento.</strong>
              </p>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0; color: #666;">
                Tenha um ótimo dia!<br>
                <strong style="color: #ffc107;">Sistema NPJ</strong>
              </p>
            </div>
          </div>
        </div>
      `
    };
  }

  /**
   * Template: Lembrete por hora
   */
  getHourlyReminderTemplate(event, user) {
    const startFormatted = dateUtils.formatBrazilian(event.start_at);
    const endFormatted = dateUtils.formatBrazilian(event.end_at);
    const minutesUntil = Math.round(dateUtils.diffInMinutes(new Date(), event.start_at));

    return {
      subject: `⏰ Evento começando em breve - ${event.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px;">
          <div style="background: linear-gradient(135deg, #fd7e14 0%, #e66a00 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">⏰ Evento Começando em Breve!</h1>
          </div>
          
          <div style="padding: 30px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Olá <strong>${user.nome}</strong>,</p>
            <p style="font-size: 16px; margin-bottom: 30px;">Seu evento começará em aproximadamente <strong>${minutesUntil} minutos</strong>:</p>
            
            <div style="background-color: #fff3cd; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #fd7e14; border: 2px solid #fd7e14;">
              <div style="display: grid; gap: 15px;">
                <div style="display: flex; align-items: center;">
                  <span style="font-size: 20px; margin-right: 10px;">📅</span>
                  <span><strong>Título:</strong> ${event.title}</span>
                </div>
                <div style="display: flex; align-items: center;">
                  <span style="font-size: 20px; margin-right: 10px;">🕐</span>
                  <span><strong>Início:</strong> ${startFormatted}</span>
                </div>
                <div style="display: flex; align-items: center;">
                  <span style="font-size: 20px; margin-right: 10px;">🕕</span>
                  <span><strong>Fim:</strong> ${endFormatted}</span>
                </div>
                ${event.description ? `
                <div style="display: flex; align-items: flex-start;">
                  <span style="font-size: 20px; margin-right: 10px;">📝</span>
                  <span><strong>Descrição:</strong> ${event.description}</span>
                </div>
                ` : ''}
              </div>
            </div>

            <div style="background-color: #f8d7da; padding: 20px; border-radius: 8px; margin-top: 30px;">
              <p style="margin: 0; font-size: 14px; color: #721c24; text-align: center;">
                <strong>⚠️ Não se esqueça! Prepare-se para o evento.</strong>
              </p>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0; color: #666;">
                Atenciosamente,<br>
                <strong style="color: #fd7e14;">Sistema NPJ</strong>
              </p>
            </div>
          </div>
        </div>
      `
    };
  }

  /**
   * Enviar solicitação de aprovação para responsáveis
   */
  async sendApprovalRequest(event, emailsConvidados = []) {
    try {
      // Verificar se já foi enviada
      if (await this.wasAlreadySent(event.id, 'approval_request')) {
        console.log(`⚠️ Solicitação de aprovação já foi enviada para evento ${event.id}`);
        return { success: true, alreadySent: true };
      }

      // Buscar responsáveis
      const responsibleUsers = await this.getResponsibleUsers();
      
      if (responsibleUsers.length === 0) {
        throw new Error('Nenhum usuário responsável encontrado para aprovação');
      }

      // Enviar para cada responsável
      const results = [];
      for (const responsible of responsibleUsers) {
        const template = this.getApprovalRequestTemplate(event, responsible);
        const result = await this.sendEmail(responsible.email, template.subject, template.html);
        results.push({ user: responsible.email, result });
      }

      // Registrar notificação
      await this.registerNotification(event.id, 'approval_request', {
        recipients: responsibleUsers.map(u => u.email),
        event_title: event.title
      });

      console.log(`✅ Solicitação de aprovação enviada para ${responsibleUsers.length} responsável(is)`);
      return { success: true, results };
    } catch (error) {
      console.error('❌ Erro ao enviar solicitação de aprovação:', error);
      throw error;
    }
  }

  /**
   * Enviar notificação de aprovação
   */
  async sendApproved(event) {
    try {
      // Verificar se já foi enviada
      if (await this.wasAlreadySent(event.id, 'approved')) {
        console.log(`⚠️ Notificação de aprovação já foi enviada para evento ${event.id}`);
        return { success: true, alreadySent: true };
      }

      // Enviar para o solicitante
      const template = this.getApprovedTemplate(event);
      const result = await this.sendEmail(event.requester.email, template.subject, template.html);

      // Registrar notificação
      await this.registerNotification(event.id, 'approved', {
        recipient: event.requester.email,
        event_title: event.title
      });

      console.log(`✅ Notificação de aprovação enviada para ${event.requester.email}`);
      return { success: true, result };
    } catch (error) {
      console.error('❌ Erro ao enviar notificação de aprovação:', error);
      throw error;
    }
  }

  /**
   * Enviar notificação de rejeição
   */
  async sendRejected(event) {
    try {
      // Verificar se já foi enviada
      if (await this.wasAlreadySent(event.id, 'rejected')) {
        console.log(`⚠️ Notificação de rejeição já foi enviada para evento ${event.id}`);
        return { success: true, alreadySent: true };
      }

      // Enviar para o solicitante
      const template = this.getRejectedTemplate(event);
      const result = await this.sendEmail(event.requester.email, template.subject, template.html);

      // Registrar notificação
      await this.registerNotification(event.id, 'rejected', {
        recipient: event.requester.email,
        event_title: event.title,
        rejection_reason: event.rejection_reason
      });

      console.log(`✅ Notificação de rejeição enviada para ${event.requester.email}`);
      return { success: true, result };
    } catch (error) {
      console.error('❌ Erro ao enviar notificação de rejeição:', error);
      throw error;
    }
  }

  /**
   * Enviar lembrete diário
   */
  async sendDailyReminder(user, eventsDoDia) {
    try {
      const today = dateUtils.formatISO(new Date()).split('T')[0];
      
      // Verificar se já foi enviado hoje
      if (await this.wasAlreadySent(null, 'daily_reminder', { user_id: user.id, date: today })) {
        console.log(`⚠️ Lembrete diário já foi enviado hoje para usuário ${user.id}`);
        return { success: true, alreadySent: true };
      }

      if (eventsDoDia.length === 0) {
        return { success: true, noEvents: true };
      }

      // Enviar lembrete
      const template = this.getDailyReminderTemplate(user, eventsDoDia);
      const result = await this.sendEmail(user.email, template.subject, template.html);

      // Registrar notificação para cada evento
      for (const event of eventsDoDia) {
        await this.registerNotification(event.id, 'daily_reminder', {
          user_id: user.id,
          user_email: user.email,
          date: today,
          event_title: event.title
        });
      }

      console.log(`✅ Lembrete diário enviado para ${user.email} com ${eventsDoDia.length} evento(s)`);
      return { success: true, result };
    } catch (error) {
      console.error('❌ Erro ao enviar lembrete diário:', error);
      throw error;
    }
  }

  /**
   * Enviar lembrete por hora
   */
  async sendHourlyReminder(event, user) {
    try {
      // Verificar se já foi enviado para este evento e usuário
      if (await this.wasAlreadySent(event.id, 'hourly_reminder', { user_id: user.id })) {
        console.log(`⚠️ Lembrete por hora já foi enviado para evento ${event.id} e usuário ${user.id}`);
        return { success: true, alreadySent: true };
      }

      // Enviar lembrete
      const template = this.getHourlyReminderTemplate(event, user);
      const result = await this.sendEmail(user.email, template.subject, template.html);

      // Registrar notificação
      await this.registerNotification(event.id, 'hourly_reminder', {
        user_id: user.id,
        user_email: user.email,
        event_title: event.title
      });

      console.log(`✅ Lembrete por hora enviado para ${user.email} sobre evento ${event.title}`);
      return { success: true, result };
    } catch (error) {
      console.error('❌ Erro ao enviar lembrete por hora:', error);
      throw error;
    }
  }
}

module.exports = new EventNotificationService();
