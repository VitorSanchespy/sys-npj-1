const { notificacaoModels: Notificacao } = require('../models/indexModels');
const { 
  enviarEmailAgendamentoCriado, 
  enviarEmailAgendamentoConfirmado, 
  enviarEmailAgendamentoCancelado,
  enviarEmailLoginSuspeito,
  enviarEmailContaBloqueada,
  enviarEmailBemVindo,
  enviarEmailProcessoCriado,
  enviarEmailProcessoAtualizado
} = require('./emailService');

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
      // Agendamentos
      'agendamento_criado': 'informacao',
      'agendamento_confirmado': 'informacao', 
      'agendamento_cancelado': 'alerta',
      'agendamento_atualizado': 'informacao',
      
      // Autenticação
      'login_sucesso': 'informacao',
      'login_falhou': 'alerta',
      'senha_incorreta': 'alerta',
      'email_incorreto': 'alerta',
      'conta_bloqueada': 'alerta',
      'logout': 'informacao',
      
      // Processos
      'processo_criado': 'informacao',
      'processo_atualizado': 'informacao',
      'processo_arquivado': 'informacao',
      'processo_reativado': 'informacao',
      
      // Usuários
      'usuario_criado': 'informacao',
      'usuario_atualizado': 'informacao',
      'perfil_alterado': 'informacao',
      
      // Arquivos
      'arquivo_upload': 'informacao',
      'arquivo_removido': 'alerta',
      'arquivo_erro': 'alerta',
      
      // Sistema
      'sistema_manutencao': 'sistema',
      'backup_realizado': 'sistema',
      'erro_sistema': 'alerta'
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

  // === NOTIFICAÇÕES DE AUTENTICAÇÃO ===

  // Notificar login bem-sucedido
  async notificarLoginSucesso(usuario, detalhesLogin = {}) {
    try {
      await this.criarNotificacao(
        usuario.id,
        'login_sucesso',
        'Login Realizado',
        `Login realizado com sucesso em ${new Date().toLocaleString('pt-BR')}`,
        {
          ip: detalhesLogin.ip || 'N/A',
          userAgent: detalhesLogin.userAgent || 'N/A'
        }
      );
      return true;
    } catch (error) {
      console.error('❌ Erro ao notificar login sucesso:', error);
      return false;
    }
  }

  // Notificar tentativa de login com senha incorreta
  async notificarSenhaIncorreta(email, detalhesLogin = {}) {
    try {
      // Buscar usuário pelo email para enviar notificação
      const { usuariosModels: Usuario } = require('../models/indexModels');
      const usuario = await Usuario.findOne({ where: { email } });
      
      if (usuario) {
        await this.criarNotificacao(
          usuario.id,
          'senha_incorreta',
          'Tentativa de Login com Senha Incorreta',
          `Tentativa de login com senha incorreta detectada em ${new Date().toLocaleString('pt-BR')}`,
          {
            ip: detalhesLogin.ip || 'N/A',
            userAgent: detalhesLogin.userAgent || 'N/A'
          }
        );
      }
      return true;
    } catch (error) {
      console.error('❌ Erro ao notificar senha incorreta:', error);
      return false;
    }
  }

  // Notificar tentativa de login com email incorreto
  async notificarEmailIncorreto(email, detalhesLogin = {}) {
    try {
      // Log de segurança (não notifica usuário pois email não existe)
      console.log(`🔐 Tentativa de login com email inexistente: ${email} em ${new Date().toLocaleString('pt-BR')}`);
      return true;
    } catch (error) {
      console.error('❌ Erro ao notificar email incorreto:', error);
      return false;
    }
  }

  // Notificar conta bloqueada por tentativas excessivas
  async notificarContaBloqueada(usuario, detalhesLogin = {}) {
    try {
      await this.criarNotificacao(
        usuario.id,
        'conta_bloqueada',
        'Conta Temporariamente Bloqueada',
        `Sua conta foi temporariamente bloqueada devido a múltiplas tentativas de login incorretas. Tente novamente em 1 hora.`,
        {
          ip: detalhesLogin.ip || 'N/A',
          userAgent: detalhesLogin.userAgent || 'N/A',
          tentativas: detalhesLogin.tentativas || 0
        }
      );
      return true;
    } catch (error) {
      console.error('❌ Erro ao notificar conta bloqueada:', error);
      return false;
    }
  }

  // === NOTIFICAÇÕES DE PROCESSOS ===

  // Notificar criação de processo
  async notificarProcessoCriado(processo, criador, destinatarios = []) {
    try {
      console.log('📧 Enviando notificações para processo criado...');

      // Notificar destinatários
      for (const destinatario of destinatarios) {
        if (destinatario.id !== criador.id) {
          await this.criarNotificacao(
            destinatario.id,
            'processo_criado',
            'Novo Processo Criado',
            `${criador.nome} criou um novo processo: ${processo.numero_processo}`,
            {
              processo_id: processo.id,
              criador_id: criador.id
            }
          );
        }
      }

      // Confirmação para o criador
      await this.criarNotificacao(
        criador.id,
        'processo_criado',
        'Processo Criado com Sucesso',
        `Processo ${processo.numero_processo} foi criado com sucesso`,
        {
          processo_id: processo.id
        }
      );

      console.log('✅ Notificações de processo criado enviadas');
      return true;
    } catch (error) {
      console.error('❌ Erro ao notificar processo criado:', error);
      return false;
    }
  }

  // Notificar atualização de processo
  async notificarProcessoAtualizado(processo, usuarioAtualizou, destinatarios = []) {
    try {
      console.log('📧 Enviando notificações para processo atualizado...');

      // Notificar destinatários
      for (const destinatario of destinatarios) {
        if (destinatario.id !== usuarioAtualizou.id) {
          await this.criarNotificacao(
            destinatario.id,
            'processo_atualizado',
            'Processo Atualizado',
            `${usuarioAtualizou.nome} atualizou o processo: ${processo.numero_processo}`,
            {
              processo_id: processo.id,
              atualizado_por: usuarioAtualizou.id
            }
          );
        }
      }

      // Confirmação para quem atualizou
      await this.criarNotificacao(
        usuarioAtualizou.id,
        'processo_atualizado',
        'Processo Atualizado com Sucesso',
        `Processo ${processo.numero_processo} foi atualizado com sucesso`,
        {
          processo_id: processo.id
        }
      );

      console.log('✅ Notificações de processo atualizado enviadas');
      return true;
    } catch (error) {
      console.error('❌ Erro ao notificar processo atualizado:', error);
      return false;
    }
  }

  // === NOTIFICAÇÕES DE USUÁRIOS ===

  // Notificar criação de usuário
  async notificarUsuarioCriado(usuario, criador) {
    try {
      await this.criarNotificacao(
        usuario.id,
        'usuario_criado',
        'Bem-vindo ao Sistema NPJ',
        `Sua conta foi criada com sucesso. Você pode fazer login no sistema.`,
        {
          criador_id: criador.id
        }
      );

      console.log('✅ Notificação de usuário criado enviada');
      return true;
    } catch (error) {
      console.error('❌ Erro ao notificar usuário criado:', error);
      return false;
    }
  }

  // === NOTIFICAÇÕES DE ARQUIVOS ===

  // Notificar upload de arquivo
  async notificarArquivoUpload(arquivo, usuario, processo = null) {
    try {
      await this.criarNotificacao(
        usuario.id,
        'arquivo_upload',
        'Arquivo Enviado com Sucesso',
        `Arquivo "${arquivo.nome_original}" foi enviado com sucesso`,
        {
          arquivo_id: arquivo.id,
          processo_id: processo?.id || null
        }
      );

      console.log('✅ Notificação de arquivo upload enviada');
      return true;
    } catch (error) {
      console.error('❌ Erro ao notificar arquivo upload:', error);
      return false;
    }
  }

  // Notificar remoção de arquivo
  async notificarArquivoRemovido(arquivo, usuario, processo = null) {
    try {
      await this.criarNotificacao(
        usuario.id,
        'arquivo_removido',
        'Arquivo Removido',
        `Arquivo "${arquivo.nome_original}" foi removido`,
        {
          arquivo_id: arquivo.id,
          processo_id: processo?.id || null
        }
      );

      console.log('✅ Notificação de arquivo removido enviada');
      return true;
    } catch (error) {
      console.error('❌ Erro ao notificar arquivo removido:', error);
      return false;
    }
  }
}

module.exports = NotificacaoService;