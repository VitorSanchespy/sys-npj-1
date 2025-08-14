const nodemailer = require('nodemailer');
const cron = require('node-cron');
const AgendamentoProcesso = require('../models/agendamentoProcessoModel');
const { usuarioModel: Usuario } = require('../models/indexModel');
const { Op } = require('sequelize');

class EnhancedNotificationService {
  constructor() {
    this.transporter = null;
    this.initializeMailer();
    this.startScheduler();
  }

  async initializeMailer() {
    try {
      // Configurar transporter baseado nas variáveis de ambiente
      if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        this.transporter = nodemailer.createTransporter({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT) || 587,
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          },
          tls: {
            rejectUnauthorized: false
          }
        });

        await this.transporter.verify();
        console.log('✅ Serviço de e-mail configurado');
      } else if (process.env.NOTIFICATION_EMAIL && process.env.NOTIFICATION_PASSWORD) {
        this.transporter = nodemailer.createTransporter({
          service: 'gmail',
          auth: {
            user: process.env.NOTIFICATION_EMAIL,
            pass: process.env.NOTIFICATION_PASSWORD,
          },
        });
        console.log('✅ Serviço de e-mail configurado (Gmail)');
      } else {
        console.warn('⚠️ Configurações de e-mail não encontradas. Notificações desabilitadas.');
      }
    } catch (error) {
      console.warn('⚠️ Erro ao configurar e-mail:', error.message);
      this.transporter = null;
    }
  }

  startScheduler() {
    cron.schedule('*/5 * * * *', () => {
      this.checkUpcomingEvents();
    });
    console.log('📅 Scheduler de notificações iniciado');
  }

  async checkUpcomingEvents() {
    if (!this.transporter) return;

    try {
      const agora = new Date();
      const em30Minutos = new Date(agora.getTime() + (30 * 60 * 1000));

      const agendamentos = await AgendamentoProcesso.findAll({
        where: {
          start: {
            [Op.between]: [agora, em30Minutos]
          },
          email_sent: false,
          status: 'sincronizado'
        }
      });

      for (const agendamento of agendamentos) {
        await this.sendReminderEmail(agendamento);
      }
    } catch (error) {
      console.error('❌ Erro ao verificar eventos próximos:', error);
    }
  }

  async sendReminderEmail(agendamento) {
    try {
      const usuario = await Usuario.findByPk(agendamento.created_by);
      if (!usuario || !usuario.email) {
        console.warn(`⚠️ Usuário não encontrado para agendamento ${agendamento.id}`);
        return;
      }

      const dataFormatada = new Date(agendamento.start).toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        dateStyle: 'full',
        timeStyle: 'short'
      });

      const mailOptions = {
        from: `"NPJ Sistema" <${process.env.SMTP_FROM || process.env.SMTP_USER || process.env.NOTIFICATION_EMAIL}>`,
        to: usuario.email,
        subject: `🔔 Lembrete: ${agendamento.summary} em 30 minutos`,
        html: this.generateEmailTemplate(agendamento, usuario, dataFormatada)
      };

      if (agendamento.attendees) {
        try {
          const attendeesList = JSON.parse(agendamento.attendees);
          const emailList = attendeesList
            .filter(a => a.email && a.email !== usuario.email)
            .map(a => a.email);
          
          if (emailList.length > 0) {
            mailOptions.cc = emailList.join(',');
          }
        } catch (error) {
          console.warn('⚠️ Erro ao processar lista de participantes:', error);
        }
      }

      await this.transporter.sendMail(mailOptions);
      await agendamento.update({ email_sent: true });

      console.log(`✅ E-mail de lembrete enviado para agendamento ${agendamento.id}`);
    } catch (error) {
      console.error(`❌ Erro ao enviar e-mail para agendamento ${agendamento.id}:`, error);
    }
  }

  generateEmailTemplate(agendamento, usuario, dataFormatada) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; }
          .footer { background: #64748b; color: white; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; }
          .event-details { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
          .button { background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 Lembrete de Agendamento</h1>
          </div>
          
          <div class="content">
            <p>Olá, <strong>${usuario.nome}</strong>!</p>
            
            <p>Este é um lembrete de que você tem um agendamento em <strong>30 minutos</strong>:</p>
            
            <div class="event-details">
              <h3>📅 ${agendamento.summary || 'Agendamento'}</h3>
              <p><strong>📅 Data/Hora:</strong> ${dataFormatada}</p>
              ${agendamento.location ? `<p><strong>📍 Local:</strong> ${agendamento.location}</p>` : ''}
              ${agendamento.description ? `<p><strong>📝 Descrição:</strong> ${agendamento.description}</p>` : ''}
              <p><strong>🆔 Processo:</strong> #${agendamento.processo_id}</p>
            </div>

            ${agendamento.html_link ? `
              <p style="text-align: center;">
                <a href="${agendamento.html_link}" class="button">
                  📅 Abrir no Google Calendar
                </a>
              </p>
            ` : ''}

            <p><small>💡 <strong>Dica:</strong> Mantenha-se preparado e chegue pontualmente ao compromisso.</small></p>
          </div>
          
          <div class="footer">
            <p>📧 Este é um e-mail automático do Sistema NPJ<br>
            🕐 Enviado em ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async sendCustomNotification(agendamento, tipo = 'reminder', minutosAntes = 30) {
    if (!this.transporter) {
      console.warn('⚠️ Serviço de e-mail não configurado');
      return false;
    }

    try {
      await this.sendReminderEmail(agendamento);
      return true;
    } catch (error) {
      console.error('❌ Erro ao enviar notificação personalizada:', error);
      return false;
    }
  }

  isConfigured() {
    return !!this.transporter;
  }
}

module.exports = new EnhancedNotificationService();
