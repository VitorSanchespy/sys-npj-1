/**
 * Controlador especializado para gestão de status de agendamentos
 * Substitui a funcionalidade de status do agendamentoController monolítico
 */

const { Op } = require('sequelize');
const AgendamentoModel = require('../../models/agendamentoModel');
const UsuarioModel = require('../../models/usuarioModel');

// Services
const AgendamentoValidationService = require('../../services/agendamento/AgendamentoValidationService');
const ConvidadoUtilsService = require('../../services/agendamento/ConvidadoUtilsService');
const AgendamentoStatusService = require('../../services/agendamento/AgendamentoStatusService');
const AgendamentoEmailTemplateService = require('../../services/agendamento/AgendamentoEmailTemplateService');
const emailService = require('../../services/emailService');
const logService = require('../../services/logService');

// Constants
const { 
  AGENDAMENTO_STATUS, 
  CONVIDADO_STATUS, 
  ERROR_MESSAGES,
  SUCCESS_MESSAGES
} = require('../../config/agendamento/constants');

class AgendamentoStatusController {

  /**
   * Altera status de um agendamento com validações e notificações
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async alterarStatus(req, res) {
    const transaction = await AgendamentoModel.sequelize.transaction();
    
    try {
      const { agendamentoId } = req.params;
      const { novoStatus, motivo, notificarConvidados = true } = req.body;
      const usuarioId = req.user?.id;

      // Validações básicas
      const validation = this.validateStatusChange(novoStatus, motivo);
      if (!validation.valid) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: validation.message,
          errors: validation.errors
        });
      }

      // Buscar agendamento atual
      const agendamento = await AgendamentoModel.findByPk(agendamentoId, {
        include: [{
          model: UsuarioModel,
          as: 'usuario',
          attributes: ['id', 'nome', 'email']
        }],
        transaction
      });

      if (!agendamento) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: ERROR_MESSAGES.AGENDAMENTO_NAO_ENCONTRADO
        });
      }

      // Validar transição de status
      const transitionValidation = this.validateStatusTransition(
        agendamento.status,
        novoStatus,
        agendamento
      );

      if (!transitionValidation.valid) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: transitionValidation.message
        });
      }

      // Preparar dados para atualização
      const updateData = {
        status: novoStatus,
        updated_at: new Date()
      };

      // Adicionar motivo se fornecido
      if (motivo) {
        updateData.observacoes = agendamento.observacoes 
          ? `${agendamento.observacoes}\n\n[${new Date().toLocaleString()}] Status alterado para ${novoStatus}: ${motivo}`
          : `[${new Date().toLocaleString()}] Status alterado para ${novoStatus}: ${motivo}`;
      }

      // Atualizar agendamento
      await agendamento.update(updateData, { transaction });

      // Registrar no histórico
      await this.registrarHistoricoStatus(agendamento.id, {
        statusAnterior: agendamento.status,
        statusNovo: novoStatus,
        motivo,
        usuarioId,
        transaction
      });

      await transaction.commit();

      // Notificar convidados se solicitado
      if (notificarConvidados && this.statusRequerNotificacao(novoStatus)) {
        this.notificarConvidadosAlteracaoStatus(agendamento, novoStatus, motivo)
          .catch(error => {
            logService.logError('Erro ao notificar convidados sobre alteração de status', error, {
              agendamentoId,
              novoStatus
            });
          });
      }

      // Log da atividade
      logService.logInfo('Status de agendamento alterado', {
        agendamentoId,
        statusAnterior: agendamento.status,
        statusNovo: novoStatus,
        usuarioId,
        motivo
      });

      res.json({
        success: true,
        message: SUCCESS_MESSAGES.STATUS_ALTERADO_SUCESSO,
        data: {
          agendamentoId: agendamento.id,
          statusAnterior: agendamento.status,
          statusNovo: novoStatus,
          dataAlteracao: new Date()
        }
      });

    } catch (error) {
      await transaction.rollback();
      logService.logError('Erro ao alterar status do agendamento', error, {
        agendamentoId: req.params.agendamentoId,
        novoStatus: req.body.novoStatus
      });

      res.status(500).json({
        success: false,
        message: ERROR_MESSAGES.ERRO_INTERNO_SERVIDOR
      });
    }
  }

  /**
   * Consulta histórico de alterações de status
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async consultarHistorico(req, res) {
    try {
      const { agendamentoId } = req.params;
      const { limite = 50, offset = 0 } = req.query;

      // Verificar se agendamento existe
      const agendamento = await AgendamentoModel.findByPk(agendamentoId);
      if (!agendamento) {
        return res.status(404).json({
          success: false,
          message: ERROR_MESSAGES.AGENDAMENTO_NAO_ENCONTRADO
        });
      }

      // Buscar histórico (implementação simplificada usando observacoes)
      const historico = this.extrairHistoricoObservacoes(agendamento.observacoes);

      res.json({
        success: true,
        data: {
          agendamentoId: agendamento.id,
          statusAtual: agendamento.status,
          historico: historico.slice(offset, offset + parseInt(limite)),
          total: historico.length
        }
      });

    } catch (error) {
      logService.logError('Erro ao consultar histórico de status', error, {
        agendamentoId: req.params.agendamentoId
      });

      res.status(500).json({
        success: false,
        message: ERROR_MESSAGES.ERRO_INTERNO_SERVIDOR
      });
    }
  }

  /**
   * Lista transições de status disponíveis para um agendamento
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async consultarTransicoesDisponiveis(req, res) {
    try {
      const { agendamentoId } = req.params;

      // Buscar agendamento
      const agendamento = await AgendamentoModel.findByPk(agendamentoId, {
        include: [{
          model: UsuarioModel,
          as: 'usuario',
          attributes: ['id', 'nome']
        }]
      });

      if (!agendamento) {
        return res.status(404).json({
          success: false,
          message: ERROR_MESSAGES.AGENDAMENTO_NAO_ENCONTRADO
        });
      }

      // Calcular transições disponíveis
      const transicoesDisponiveis = this.calcularTransicoesDisponiveis(agendamento);

      res.json({
        success: true,
        data: {
          agendamentoId: agendamento.id,
          statusAtual: agendamento.status,
          transicoesDisponiveis
        }
      });

    } catch (error) {
      logService.logError('Erro ao consultar transições disponíveis', error, {
        agendamentoId: req.params.agendamentoId
      });

      res.status(500).json({
        success: false,
        message: ERROR_MESSAGES.ERRO_INTERNO_SERVIDOR
      });
    }
  }

  /**
   * Atualiza status automaticamente baseado em regras de negócio
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async atualizarStatusAutomatico(req, res) {
    const transaction = await AgendamentoModel.sequelize.transaction();
    
    try {
      const { agendamentoId } = req.params;

      // Buscar agendamento
      const agendamento = await AgendamentoModel.findByPk(agendamentoId, {
        transaction
      });

      if (!agendamento) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: ERROR_MESSAGES.AGENDAMENTO_NAO_ENCONTRADO
        });
      }

      // Calcular novo status usando o service
      const statusUpdate = AgendamentoStatusService.updateAutomaticStatus(agendamento.dataValues);

      if (statusUpdate.statusAtualizado === agendamento.status) {
        await transaction.rollback();
        return res.json({
          success: true,
          message: 'Status já está atualizado',
          data: {
            agendamentoId: agendamento.id,
            statusAtual: agendamento.status,
            alteracaoNecessaria: false
          }
        });
      }

      // Atualizar status
      await agendamento.update({
        status: statusUpdate.statusAtualizado
      }, { transaction });

      // Registrar no histórico
      await this.registrarHistoricoStatus(agendamento.id, {
        statusAnterior: agendamento.status,
        statusNovo: statusUpdate.statusAtualizado,
        motivo: 'Atualização automática baseada em regras de negócio',
        usuarioId: req.user?.id,
        transaction
      });

      await transaction.commit();

      // Log da atividade
      logService.logInfo('Status atualizado automaticamente', {
        agendamentoId,
        statusAnterior: agendamento.status,
        statusNovo: statusUpdate.statusAtualizado,
        motivo: statusUpdate.motivo
      });

      res.json({
        success: true,
        message: SUCCESS_MESSAGES.STATUS_ATUALIZADO_AUTOMATICAMENTE,
        data: {
          agendamentoId: agendamento.id,
          statusAnterior: agendamento.status,
          statusNovo: statusUpdate.statusAtualizado,
          motivo: statusUpdate.motivo,
          alteracaoNecessaria: true
        }
      });

    } catch (error) {
      await transaction.rollback();
      logService.logError('Erro ao atualizar status automaticamente', error, {
        agendamentoId: req.params.agendamentoId
      });

      res.status(500).json({
        success: false,
        message: ERROR_MESSAGES.ERRO_INTERNO_SERVIDOR
      });
    }
  }

  // ========== MÉTODOS AUXILIARES ==========

  /**
   * Valida dados para alteração de status
   * @param {string} novoStatus 
   * @param {string} motivo 
   * @returns {Object} Resultado da validação
   */
  static validateStatusChange(novoStatus, motivo) {
    const errors = [];

    // Validar status
    if (!novoStatus || typeof novoStatus !== 'string') {
      errors.push('Novo status é obrigatório');
    } else if (!Object.values(AGENDAMENTO_STATUS).includes(novoStatus)) {
      errors.push('Status inválido');
    }

    // Validar motivo para certos status
    const statusQueRequeremMotivo = [
      AGENDAMENTO_STATUS.CANCELADO,
      AGENDAMENTO_STATUS.REAGENDADO
    ];

    if (statusQueRequeremMotivo.includes(novoStatus) && (!motivo || motivo.trim().length === 0)) {
      errors.push('Motivo é obrigatório para este status');
    }

    if (motivo && motivo.length > 500) {
      errors.push('Motivo não pode exceder 500 caracteres');
    }

    return {
      valid: errors.length === 0,
      errors,
      message: errors.length > 0 ? errors[0] : null
    };
  }

  /**
   * Valida se transição de status é permitida
   * @param {string} statusAtual 
   * @param {string} novoStatus 
   * @param {Object} agendamento 
   * @returns {Object} Resultado da validação
   */
  static validateStatusTransition(statusAtual, novoStatus, agendamento) {
    // Definir transições permitidas
    const transicoesPermitidas = {
      [AGENDAMENTO_STATUS.RASCUNHO]: [
        AGENDAMENTO_STATUS.EM_ANALISE,
        AGENDAMENTO_STATUS.CANCELADO
      ],
      [AGENDAMENTO_STATUS.EM_ANALISE]: [
        AGENDAMENTO_STATUS.MARCADO,
        AGENDAMENTO_STATUS.CANCELADO,
        AGENDAMENTO_STATUS.RASCUNHO
      ],
      [AGENDAMENTO_STATUS.MARCADO]: [
        AGENDAMENTO_STATUS.CONFIRMADO,
        AGENDAMENTO_STATUS.CANCELADO,
        AGENDAMENTO_STATUS.REAGENDADO
      ],
      [AGENDAMENTO_STATUS.CONFIRMADO]: [
        AGENDAMENTO_STATUS.FINALIZADO,
        AGENDAMENTO_STATUS.CANCELADO,
        AGENDAMENTO_STATUS.REAGENDADO
      ],
      [AGENDAMENTO_STATUS.REAGENDADO]: [
        AGENDAMENTO_STATUS.MARCADO,
        AGENDAMENTO_STATUS.CANCELADO
      ],
      // Status finais não permitem transições
      [AGENDAMENTO_STATUS.CANCELADO]: [],
      [AGENDAMENTO_STATUS.FINALIZADO]: []
    };

    const statusPermitidos = transicoesPermitidas[statusAtual] || [];

    if (!statusPermitidos.includes(novoStatus)) {
      return {
        valid: false,
        message: `Transição de ${statusAtual} para ${novoStatus} não é permitida`
      };
    }

    // Validações específicas por status
    if (novoStatus === AGENDAMENTO_STATUS.FINALIZADO) {
      const agora = new Date();
      const dataAgendamento = new Date(agendamento.data_inicio);
      
      if (dataAgendamento > agora) {
        return {
          valid: false,
          message: 'Não é possível finalizar agendamento que ainda não ocorreu'
        };
      }
    }

    return { valid: true };
  }

  /**
   * Calcula transições de status disponíveis
   * @param {Object} agendamento 
   * @returns {Array} Lista de transições disponíveis
   */
  static calcularTransicoesDisponiveis(agendamento) {
    const statusAtual = agendamento.status;
    const transicoes = [];

    // Usar a mesma lógica de validateStatusTransition
    const transicoesPermitidas = {
      [AGENDAMENTO_STATUS.RASCUNHO]: [
        { status: AGENDAMENTO_STATUS.EM_ANALISE, descricao: 'Enviar para análise' },
        { status: AGENDAMENTO_STATUS.CANCELADO, descricao: 'Cancelar agendamento' }
      ],
      [AGENDAMENTO_STATUS.EM_ANALISE]: [
        { status: AGENDAMENTO_STATUS.MARCADO, descricao: 'Confirmar agendamento' },
        { status: AGENDAMENTO_STATUS.CANCELADO, descricao: 'Cancelar agendamento' },
        { status: AGENDAMENTO_STATUS.RASCUNHO, descricao: 'Voltar para rascunho' }
      ],
      [AGENDAMENTO_STATUS.MARCADO]: [
        { status: AGENDAMENTO_STATUS.CONFIRMADO, descricao: 'Confirmar presença' },
        { status: AGENDAMENTO_STATUS.CANCELADO, descricao: 'Cancelar agendamento' },
        { status: AGENDAMENTO_STATUS.REAGENDADO, descricao: 'Reagendar' }
      ],
      [AGENDAMENTO_STATUS.CONFIRMADO]: [
        { status: AGENDAMENTO_STATUS.FINALIZADO, descricao: 'Finalizar agendamento' },
        { status: AGENDAMENTO_STATUS.CANCELADO, descricao: 'Cancelar agendamento' },
        { status: AGENDAMENTO_STATUS.REAGENDADO, descricao: 'Reagendar' }
      ],
      [AGENDAMENTO_STATUS.REAGENDADO]: [
        { status: AGENDAMENTO_STATUS.MARCADO, descricao: 'Marcar nova data' },
        { status: AGENDAMENTO_STATUS.CANCELADO, descricao: 'Cancelar definitivamente' }
      ],
      [AGENDAMENTO_STATUS.CANCELADO]: [],
      [AGENDAMENTO_STATUS.FINALIZADO]: []
    };

    const opcoes = transicoesPermitidas[statusAtual] || [];

    // Filtrar opções baseadas em validações específicas
    return opcoes.filter(opcao => {
      const validation = this.validateStatusTransition(statusAtual, opcao.status, agendamento);
      return validation.valid;
    });
  }

  /**
   * Registra histórico de alteração de status
   * @param {number} agendamentoId 
   * @param {Object} dados 
   */
  static async registrarHistoricoStatus(agendamentoId, dados) {
    const { statusAnterior, statusNovo, motivo, usuarioId, transaction } = dados;
    
    // Por simplicidade, vamos registrar no campo observacoes
    // Em um sistema mais robusto, haveria uma tabela dedicada para histórico
    const agendamento = await AgendamentoModel.findByPk(agendamentoId, { transaction });
    
    const registroHistorico = `\n[${new Date().toLocaleString()}] Status: ${statusAnterior} → ${statusNovo}${motivo ? ` (${motivo})` : ''}${usuarioId ? ` por usuário ${usuarioId}` : ''}`;
    
    const observacoesAtualizadas = (agendamento.observacoes || '') + registroHistorico;
    
    await agendamento.update({
      observacoes: observacoesAtualizadas
    }, { transaction });
  }

  /**
   * Extrai histórico de alterações das observações
   * @param {string} observacoes 
   * @returns {Array} Histórico de alterações
   */
  static extrairHistoricoObservacoes(observacoes) {
    if (!observacoes) return [];

    const linhas = observacoes.split('\n');
    const historico = [];

    for (const linha of linhas) {
      const match = linha.match(/^\[(.+?)\] Status: (.+?) → (.+?)(?: \((.+?)\))?(?: por usuário (\d+))?$/);
      if (match) {
        historico.push({
          dataHora: match[1],
          statusAnterior: match[2],
          statusNovo: match[3],
          motivo: match[4] || null,
          usuarioId: match[5] ? parseInt(match[5]) : null
        });
      }
    }

    return historico.reverse(); // Mais recentes primeiro
  }

  /**
   * Verifica se status requer notificação aos convidados
   * @param {string} status 
   * @returns {boolean}
   */
  static statusRequerNotificacao(status) {
    const statusComNotificacao = [
      AGENDAMENTO_STATUS.CONFIRMADO,
      AGENDAMENTO_STATUS.CANCELADO,
      AGENDAMENTO_STATUS.REAGENDADO,
      AGENDAMENTO_STATUS.FINALIZADO
    ];

    return statusComNotificacao.includes(status);
  }

  /**
   * Notifica convidados sobre alteração de status
   * @param {Object} agendamento 
   * @param {string} novoStatus 
   * @param {string} motivo 
   */
  static async notificarConvidadosAlteracaoStatus(agendamento, novoStatus, motivo) {
    try {
      const convidados = ConvidadoUtilsService.parseConvidados(agendamento.convidados);
      
      for (const convidado of convidados) {
        try {
          const template = AgendamentoEmailTemplateService.generateNotificacaoOrganizadorTemplate(
            agendamento,
            convidado,
            'alteracao_status',
            { novoStatus, motivo }
          );

          await emailService.sendEmail({
            to: convidado.email,
            subject: template.subject,
            html: template.html,
            text: template.text
          });

        } catch (error) {
          logService.logError('Erro ao notificar convidado sobre alteração de status', error, {
            agendamentoId: agendamento.id,
            convidadoEmail: convidado.email,
            novoStatus
          });
        }
      }

    } catch (error) {
      logService.logError('Erro geral ao notificar convidados sobre alteração de status', error, {
        agendamentoId: agendamento.id,
        novoStatus
      });
    }
  }
}

module.exports = AgendamentoStatusController;