const cron = require('node-cron');
const { agendamentoModel: Agendamento, usuarioModel: Usuario, processoModel: Processo } = require('../models/indexModel');
const emailService = require('../services/emailService');

/**
 * Job para gerenciar automaticamente o ciclo de vida dos agendamentos
 */
class AgendamentoCronJobs {
  
  /**
   * Marcar agendamentos como "marcado" após 1 dia de aprovação
   */
  static async marcarAgendamentos() {
    try {
      console.log('🔄 Executando job para marcar agendamentos...');
      
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      
      // Buscar agendamentos em "enviando_convites" há mais de 1 dia
      const agendamentos = await Agendamento.findAll({
        where: {
          status: 'enviando_convites',
          data_aprovacao: {
            $lte: oneDayAgo
          }
        },
        include: [
          { model: Processo, as: 'processo' },
          { model: Usuario, as: 'usuario' }
        ]
      });
      
      for (const agendamento of agendamentos) {
        // Marcar como "marcado"
        agendamento.status = 'marcado';
        await agendamento.save();
        
        // Enviar notificação de confirmação
        try {
          await this.enviarNotificacaoAgendamentoMarcado(agendamento);
        } catch (emailError) {
          console.error(`Erro ao enviar notificação para agendamento ${agendamento.id}:`, emailError);
        }
      }
      
      console.log(`✅ ${agendamentos.length} agendamentos marcados como confirmados`);
    } catch (error) {
      console.error('❌ Erro no job de marcar agendamentos:', error);
    }
  }
  
  /**
   * Enviar lembretes no dia do agendamento
   */
  static async enviarLembretesDodia() {
    try {
      console.log('🔔 Executando job para lembretes do dia...');
      
      const hoje = new Date();
      const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
      const fimHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 23, 59, 59);
      
      // Buscar agendamentos marcados para hoje
      const agendamentos = await Agendamento.findAll({
        where: {
          status: 'marcado',
          data_inicio: {
            $between: [inicioHoje, fimHoje]
          }
        },
        include: [
          { model: Processo, as: 'processo' },
          { model: Usuario, as: 'usuario' }
        ]
      });
      
      for (const agendamento of agendamentos) {
        try {
          await this.enviarLembreteDodia(agendamento);
        } catch (emailError) {
          console.error(`Erro ao enviar lembrete para agendamento ${agendamento.id}:`, emailError);
        }
      }
      
      console.log(`✅ Lembretes enviados para ${agendamentos.length} agendamentos`);
    } catch (error) {
      console.error('❌ Erro no job de lembretes do dia:', error);
    }
  }
  
  /**
   * Finalizar agendamentos após o término
   */
  static async finalizarAgendamentos() {
    try {
      console.log('🏁 Executando job para finalizar agendamentos...');
      
      const agora = new Date();
      
      // Buscar agendamentos marcados que já passaram
      const agendamentos = await Agendamento.findAll({
        where: {
          status: 'marcado',
          data_fim: {
            $lt: agora
          }
        }
      });
      
      for (const agendamento of agendamentos) {
        agendamento.status = 'finalizado';
        await agendamento.save();
      }
      
      console.log(`✅ ${agendamentos.length} agendamentos finalizados`);
    } catch (error) {
      console.error('❌ Erro no job de finalizar agendamentos:', error);
    }
  }
  
  /**
   * Enviar notificação quando agendamento é marcado
   */
  static async enviarNotificacaoAgendamentoMarcado(agendamento) {
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #28a745;">✅ Agendamento Confirmado</h2>
        <p><strong>Título:</strong> ${agendamento.titulo}</p>
        <p><strong>Data/Hora:</strong> ${new Date(agendamento.data_inicio).toLocaleString('pt-BR')} - ${new Date(agendamento.data_fim).toLocaleString('pt-BR')}</p>
        <p><strong>Local:</strong> ${agendamento.local || 'Não informado'}</p>
        
        <div style="margin: 20px 0; padding: 15px; background-color: #d4edda; border-left: 4px solid #28a745;">
          <p><strong>Seu agendamento foi confirmado!</strong> Você receberá um lembrete no dia do evento.</p>
        </div>
        
        ${agendamento.processo ? `<p><strong>Processo:</strong> ${agendamento.processo.numero_processo} - ${agendamento.processo.titulo}</p>` : ''}
      </div>
    `;
    
    // Enviar para o solicitante
    await emailService.enviarEmail({
      to: [{ email: agendamento.usuario.email, name: agendamento.usuario.nome }],
      subject: `Agendamento Confirmado - ${agendamento.titulo}`,
      html
    });
    
    // Enviar para convidados
    if (agendamento.convidados && Array.isArray(agendamento.convidados)) {
      for (const convidado of agendamento.convidados) {
        if (convidado.email) {
          await emailService.enviarEmail({
            to: [{ email: convidado.email, name: convidado.nome }],
            subject: `Agendamento Confirmado - ${agendamento.titulo}`,
            html
          });
        }
      }
    }
  }
  
  /**
   * Enviar lembrete no dia do agendamento
   */
  static async enviarLembreteDodia(agendamento) {
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #ffc107;">🔔 Lembrete: Agendamento Hoje</h2>
        <p><strong>Título:</strong> ${agendamento.titulo}</p>
        <p><strong>Horário:</strong> ${new Date(agendamento.data_inicio).toLocaleString('pt-BR')} - ${new Date(agendamento.data_fim).toLocaleString('pt-BR')}</p>
        <p><strong>Local:</strong> ${agendamento.local || 'Não informado'}</p>
        
        <div style="margin: 20px 0; padding: 15px; background-color: #fff3cd; border-left: 4px solid #ffc107;">
          <p><strong>Não esqueça!</strong> Seu agendamento é hoje. Prepare-se e chegue no horário.</p>
        </div>
        
        ${agendamento.processo ? `<p><strong>Processo:</strong> ${agendamento.processo.numero_processo} - ${agendamento.processo.titulo}</p>` : ''}
      </div>
    `;
    
    // Enviar para o solicitante
    await emailService.enviarEmail({
      to: [{ email: agendamento.usuario.email, name: agendamento.usuario.nome }],
      subject: `Lembrete: ${agendamento.titulo} - Hoje`,
      html
    });
    
    // Enviar para convidados
    if (agendamento.convidados && Array.isArray(agendamento.convidados)) {
      for (const convidado of agendamento.convidados) {
        if (convidado.email) {
          await emailService.enviarEmail({
            to: [{ email: convidado.email, name: convidado.nome }],
            subject: `Lembrete: ${agendamento.titulo} - Hoje`,
            html
          });
        }
      }
    }
  }
  
  /**
   * Inicializar todos os cron jobs
   */
  static iniciar() {
    console.log('⚡ Iniciando cron jobs de agendamentos...');
    
    // Job para marcar agendamentos (executa a cada 6 horas)
    cron.schedule('0 */6 * * *', () => {
      this.marcarAgendamentos();
    });
    
    // Job para lembretes do dia (executa às 8h da manhã)
    cron.schedule('0 8 * * *', () => {
      this.enviarLembretesDodia();
    });
    
    // Job para finalizar agendamentos (executa a cada hora)
    cron.schedule('0 * * * *', () => {
      this.finalizarAgendamentos();
    });
    
    console.log('✅ Cron jobs de agendamentos iniciados com sucesso');
  }
  
  // Alias para compatibilidade
  static start() {
    return this.iniciar();
  }
}

module.exports = AgendamentoCronJobs;
