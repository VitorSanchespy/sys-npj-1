const { notificacaoModels: Notificacao } = require('../models/indexModels');
const { enviarEmailAgendamentoCriado, enviarEmailAgendamentoConfirmado, enviarEmailAgendamentoCancelado } = require('./emailService');

class NotificacaoService {
  constructor(io) {
    this.io = io;
  }

  // Notifica todos inscritos em um canal de processo
  enviarParaProcesso(processoId, mensagem) {
    this.io.to(`processo_${processoId}`).emit('notificacao', {
      processoId,
      mensagem,
      data: new Date()
    });
  }

  // Notifica um usuário específico
  enviarParaUsuario(usuarioId, mensagem) {
    this.io.to(`usuario_${usuarioId}`).emit('notificacao_pessoal', {
      mensagem,
      data: new Date()
    });
  }

  // Criar notificação no banco de dados
  async criarNotificacao(usuarioId, tipo, titulo, mensagem, dadosAdicionais = {}) {
    try {
      // Mapear tipos para o enum existente
      const tipoMapeado = this.mapearTipoNotificacao(tipo);
      
      console.log(`🔍 DEBUG Notificação:`, {
        tipoOriginal: tipo,
        tipoMapeado: tipoMapeado,
        usuarioId,
        titulo
      });
      
      const notificacao = await Notificacao.create({
        usuario_id: usuarioId,
        processo_id: dadosAdicionais.processo_id || null,
        agendamento_id: dadosAdicionais.agendamento_id || null,
        tipo: tipoMapeado,
        titulo,
        mensagem,
        canal: 'ambos', // email + sistema
        status: 'pendente',
        data_envio: new Date(),
        tentativas: 0,
        criado_em: new Date()
      });

      // Enviar notificação em tempo real
      this.enviarParaUsuario(usuarioId, {
        id: notificacao.id,
        tipo: tipoMapeado,
        titulo,
        mensagem,
        data: notificacao.criado_em
      });

      return notificacao;
    } catch (error) {
      console.error('Erro ao criar notificação:', error);
      return null;
    }
  }

  // Mapear tipos de notificação para o enum existente
  mapearTipoNotificacao(tipo) {
    const mapeamento = {
      'agendamento_criado': 'informacao',
      'agendamento_confirmado': 'informacao', 
      'agendamento_cancelado': 'alerta',
      'agendamento_cancelado_confirmacao': 'informacao',
      'agendamento_atualizado': 'informacao',
      'agendamento_atualizado_confirmacao': 'informacao'
    };
    
    return mapeamento[tipo] || 'informacao';
  }

  // Notificações específicas para agendamentos
  async notificarAgendamentoCriado(agendamento, criador, destinatario) {
    try {
      console.log('📧 Enviando notificações para agendamento criado...');

      // Notificação para o destinatário do agendamento
      if (destinatario && destinatario.id !== criador.id) {
        await this.criarNotificacao(
          destinatario.id,
          'agendamento_criado',
          'Novo Agendamento',
          `${criador.nome} criou um agendamento para você: ${agendamento.titulo}`,
          {
            agendamento_id: agendamento.id,
            processo_id: agendamento.processo_id,
            criador_id: criador.id,
            data_evento: agendamento.data_evento
          }
        );

        // Enviar email para o destinatário
        if (destinatario.email) {
          await enviarEmailAgendamentoCriado(destinatario.email, agendamento, criador);
        }
      }

      // Notificação de confirmação para o criador
      await this.criarNotificacao(
        criador.id,
        'agendamento_criado',
        'Agendamento Criado',
        `Seu agendamento "${agendamento.titulo}" foi criado com sucesso`,
        {
          agendamento_id: agendamento.id,
          processo_id: agendamento.processo_id,
          data_evento: agendamento.data_evento
        }
      );

      // Email de confirmação para o criador
      if (criador.email) {
        await enviarEmailAgendamentoConfirmado(criador.email, agendamento);
      }

      console.log('✅ Notificações de agendamento enviadas com sucesso');
      return true;
    } catch (error) {
      console.error('❌ Erro ao enviar notificações de agendamento:', error);
      return false;
    }
  }

  // Notificar cancelamento de agendamento
  async notificarAgendamentoCancelado(agendamento, usuarioCancelou, destinatario, motivo = '') {
    try {
      console.log('📧 Enviando notificações para agendamento cancelado...');

      // Notificar o destinatário se for diferente de quem cancelou
      if (destinatario && destinatario.id !== usuarioCancelou.id) {
        await this.criarNotificacao(
          destinatario.id,
          'agendamento_cancelado',
          'Agendamento Cancelado',
          `${usuarioCancelou.nome} cancelou o agendamento: ${agendamento.titulo}`,
          {
            agendamento_id: agendamento.id,
            cancelado_por: usuarioCancelou.id,
            motivo
          }
        );

        // Email para o destinatário
        if (destinatario.email) {
          await enviarEmailAgendamentoCancelado(destinatario.email, agendamento, motivo);
        }
      }

      // Confirmação para quem cancelou
      await this.criarNotificacao(
        usuarioCancelou.id,
        'agendamento_cancelado',
        'Cancelamento Confirmado',
        `Agendamento "${agendamento.titulo}" foi cancelado com sucesso`,
        {
          agendamento_id: agendamento.id,
          motivo
        }
      );

      console.log('✅ Notificações de cancelamento enviadas com sucesso');
      return true;
    } catch (error) {
      console.error('❌ Erro ao enviar notificações de cancelamento:', error);
      return false;
    }
  }

  // Notificar atualização de agendamento
  async notificarAgendamentoAtualizado(agendamento, usuarioAtualizou, destinatario) {
    try {
      console.log('📧 Enviando notificações para agendamento atualizado...');

      // Notificar o destinatário se for diferente de quem atualizou
      if (destinatario && destinatario.id !== usuarioAtualizou.id) {
        await this.criarNotificacao(
          destinatario.id,
          'agendamento_atualizado',
          'Agendamento Atualizado',
          `${usuarioAtualizou.nome} atualizou o agendamento: ${agendamento.titulo}`,
          {
            agendamento_id: agendamento.id,
            atualizado_por: usuarioAtualizou.id,
            data_evento: agendamento.data_evento
          }
        );
      }

      // Confirmação para quem atualizou
      await this.criarNotificacao(
        usuarioAtualizou.id,
        'agendamento_atualizado',
        'Atualização Confirmada',
        `Agendamento "${agendamento.titulo}" foi atualizado com sucesso`,
        {
          agendamento_id: agendamento.id
        }
      );

      console.log('✅ Notificações de atualização enviadas com sucesso');
      return true;
    } catch (error) {
      console.error('❌ Erro ao enviar notificações de atualização:', error);
      return false;
    }
  }
}

module.exports = NotificacaoService;