/**
 * Controlador especializado para gestão de convites de agendamentos
 * Substitui a funcionalidade de convites do agendamentoController monolítico
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

class AgendamentoConviteController {

  /**
   * Envia convites para os convidados de um agendamento
   * @param{number} agendamentoId - ID do agendamento
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async enviarConvites(req, res) {
    const transaction = await AgendamentoModel.sequelize.transaction();
    
    try {
      const { agendamentoId } = req.params;
      const usuarioId = req.user.id;

      // Validar parâmetros
      if (!agendamentoId || isNaN(agendamentoId)) {
        return res.status(400).json({
          success: false,
          message: ERROR_MESSAGES.ID_AGENDAMENTO_INVALIDO
        });
      }

      // Buscar agendamento
      const agendamento = await AgendamentoModel.findOne({
        where: { 
          id: agendamentoId,
          usuario_id: usuarioId // Apenas o criador pode enviar convites
        },
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

      // Validar se agendamento pode ter convites enviados
      const validationResult = this.validateConvitesSending(agendamento);
      if (!validationResult.valid) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: validationResult.message
        });
      }

      const convidados = ConvidadoUtilsService.parseConvidados(agendamento.convidados);
      
      if (convidados.length === 0) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: ERROR_MESSAGES.NENHUM_CONVIDADO_ENCONTRADO
        });
      }

      // Atualizar status do agendamento
      await agendamento.update({
        status: AGENDAMENTO_STATUS.ENVIANDO_CONVITES,
        data_convite: new Date()
      }, { transaction });

      await transaction.commit();

      // Enviar emails em background (não bloquear resposta)
      this.processarEnvioEmails(agendamento, convidados)
        .catch(error => {
          logService.logError('Erro no envio de convites em background', error, { agendamentoId });
        });

      res.json({
        success: true,
        message: SUCCESS_MESSAGES.CONVITES_ENVIADOS,
        data: {
          agendamentoId: agendamento.id,
          totalConvidados: convidados.length,
          status: AGENDAMENTO_STATUS.ENVIANDO_CONVITES
        }
      });

    } catch (error) {
      await transaction.rollback();
      logService.logError('Erro ao enviar convites', error, { agendamentoId: req.params.agendamentoId });
      
      res.status(500).json({
        success: false,
        message: ERROR_MESSAGES.ERRO_INTERNO_SERVIDOR
      });
    }
  }

  /**
   * Responde a um convite (aceitar/recusar)
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async responderConvite(req, res) {
    const transaction = await AgendamentoModel.sequelize.transaction();
    
    try {
      const { agendamentoId, email, resposta } = req.params;
      const { justificativa } = req.body;

      // Validações básicas
      const validation = AgendamentoValidationService.validateRespostaConvite(
        resposta,
        justificativa
      );

      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message: validation.message,
          errors: validation.errors
        });
      }

      // Buscar agendamento
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

      // Validar se convite ainda pode ser respondido
      try {
        ConvidadoUtilsService.validateEmailOperation(
          ConvidadoUtilsService.parseConvidados(agendamento.convidados),
          email,
          agendamento.data_convite
        );
      } catch (validationError) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: validationError.message
        });
      }

      // Atualizar resposta do convidado
      const convidados = ConvidadoUtilsService.parseConvidados(agendamento.convidados);
      const novoStatus = resposta === 'aceito' ? CONVIDADO_STATUS.ACEITO : CONVIDADO_STATUS.RECUSADO;
      
      const convidadosAtualizados = ConvidadoUtilsService.updateConvidadoStatus(
        convidados,
        email,
        novoStatus,
        justificativa
      );

      // Determinar novo status do agendamento
      const statusUpdate = AgendamentoStatusService.updateAutomaticStatus({
        ...agendamento.dataValues,
        convidados: JSON.stringify(convidadosAtualizados)
      });

      // Atualizar agendamento
      await agendamento.update({
        convidados: JSON.stringify(convidadosAtualizados),
        status: statusUpdate.statusAtualizado
      }, { transaction });

      await transaction.commit();

      // Encontrar dados do convidado que respondeu
      const convidado = ConvidadoUtilsService.findConvidadoByEmail(convidadosAtualizados, email);

      // Enviar confirmação para o convidado
      this.enviarConfirmacaoResposta(agendamento, convidado, resposta)
        .catch(error => {
          logService.logError('Erro ao enviar confirmação de resposta', error, { agendamentoId, email });
        });

      // Notificar organizador
      this.notificarOrganizadorResposta(agendamento, convidado, resposta)
        .catch(error => {
          logService.logError('Erro ao notificar organizador', error, { agendamentoId, email });
        });

      // Log da atividade
      logService.logInfo('Resposta de convite registrada', {
        agendamentoId,
        email,
        resposta,
        novoStatusAgendamento: statusUpdate.statusAtualizado
      });

      res.json({
        success: true,
        message: resposta === 'aceito' ? SUCCESS_MESSAGES.CONVITE_ACEITO : SUCCESS_MESSAGES.CONVITE_RECUSADO,
        data: {
          agendamentoId: agendamento.id,
          convidado: {
            email: convidado.email,
            nome: convidado.nome,
            status: convidado.status,
            dataResposta: convidado.data_resposta
          },
          agendamento: {
            status: statusUpdate.statusAtualizado,
            mudancaStatus: statusUpdate.houveMudanca,
            motivoMudanca: statusUpdate.motivoMudanca
          }
        }
      });

    } catch (error) {
      await transaction.rollback();
      logService.logError('Erro ao responder convite', error, { 
        agendamentoId: req.params.agendamentoId, 
        email: req.params.email 
      });
      
      res.status(500).json({
        success: false,
        message: ERROR_MESSAGES.ERRO_INTERNO_SERVIDOR
      });
    }
  }

  /**
   * Busca status de convites de um agendamento
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async getStatusConvites(req, res) {
    try {
      const { agendamentoId } = req.params;
      const usuarioId = req.user.id;

      // Buscar agendamento
      const agendamento = await AgendamentoModel.findOne({
        where: { 
          id: agendamentoId,
          usuario_id: usuarioId
        },
        attributes: ['id', 'titulo', 'status', 'data_convite', 'convidados', 'data_hora']
      });

      if (!agendamento) {
        return res.status(404).json({
          success: false,
          message: ERROR_MESSAGES.AGENDAMENTO_NAO_ENCONTRADO
        });
      }

      const convidados = ConvidadoUtilsService.parseConvidados(agendamento.convidados);
      const stats = ConvidadoUtilsService.analyzeConvidadosStatus(convidados);
      
      // Verificar se convites expiraram
      const convitesExpiraram = ConvidadoUtilsService.checkConvitesExpiraram(agendamento.data_convite);
      
      // Calcular prioridade
      const prioridade = AgendamentoStatusService.calculatePriorityScore(agendamento);
      
      // Obter ações recomendadas
      const acoesRecomendadas = AgendamentoStatusService.getRecommendedActions(agendamento);

      res.json({
        success: true,
        data: {
          agendamento: {
            id: agendamento.id,
            titulo: agendamento.titulo,
            status: agendamento.status,
            dataConvite: agendamento.data_convite,
            dataAgendamento: agendamento.data_hora,
            prioridade
          },
          estatisticas: stats,
          convitesExpiraram,
          acoesRecomendadas,
          convidados: convidados.map(c => ({
            email: c.email,
            nome: c.nome,
            status: c.status,
            dataConvite: c.data_convite,
            dataResposta: c.data_resposta,
            justificativa: c.justificativa,
            respostaAutomatica: c.resposta_automatica
          }))
        }
      });

    } catch (error) {
      logService.logError('Erro ao buscar status de convites', error, { agendamentoId: req.params.agendamentoId });
      
      res.status(500).json({
        success: false,
        message: ERROR_MESSAGES.ERRO_INTERNO_SERVIDOR
      });
    }
  }

  /**
   * Reenvia convites para convidados pendentes
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async reenviarConvites(req, res) {
    try {
      const { agendamentoId } = req.params;
      const { emails } = req.body; // Opcionalmente específicos emails
      const usuarioId = req.user.id;

      // Buscar agendamento
      const agendamento = await AgendamentoModel.findOne({
        where: { 
          id: agendamentoId,
          usuario_id: usuarioId
        },
        include: [{
          model: UsuarioModel,
          as: 'usuario',
          attributes: ['id', 'nome', 'email']
        }]
      });

      if (!agendamento) {
        return res.status(404).json({
          success: false,
          message: ERROR_MESSAGES.AGENDAMENTO_NAO_ENCONTRADO
        });
      }

      const convidados = ConvidadoUtilsService.parseConvidados(agendamento.convidados);
      
      // Filtrar convidados pendentes
      let convidadosParaReenvio = convidados.filter(c => c.status === CONVIDADO_STATUS.PENDENTE);
      
      // Se emails específicos foram fornecidos, filtrar por eles
      if (emails && emails.length > 0) {
        convidadosParaReenvio = convidadosParaReenvio.filter(c => 
          emails.includes(c.email.toLowerCase())
        );
      }

      if (convidadosParaReenvio.length === 0) {
        return res.status(400).json({
          success: false,
          message: ERROR_MESSAGES.NENHUM_CONVIDADO_PENDENTE
        });
      }

      // Verificar se convites não expiraram
      if (ConvidadoUtilsService.checkConvitesExpiraram(agendamento.data_convite)) {
        return res.status(400).json({
          success: false,
          message: ERROR_MESSAGES.CONVITES_EXPIRADOS
        });
      }

      // Processar reenvio
      const resultadoEnvio = await this.processarReenvioEmails(agendamento, convidadosParaReenvio);

      res.json({
        success: true,
        message: SUCCESS_MESSAGES.CONVITES_REENVIADOS,
        data: {
          agendamentoId: agendamento.id,
          totalReenviados: resultadoEnvio.enviados,
          falhas: resultadoEnvio.falhas
        }
      });

    } catch (error) {
      logService.logError('Erro ao reenviar convites', error, { agendamentoId: req.params.agendamentoId });
      
      res.status(500).json({
        success: false,
        message: ERROR_MESSAGES.ERRO_INTERNO_SERVIDOR
      });
    }
  }

  // ==================
  // MÉTODOS AUXILIARES
  // ==================

  /**
   * Valida se convites podem ser enviados
   * @param {Object} agendamento 
   * @returns {Object} { valid: boolean, message?: string }
   */
  static validateConvitesSending(agendamento) {
    // Verificar se agendamento já passou
    if (new Date(agendamento.data_hora) < new Date()) {
      return {
        valid: false,
        message: ERROR_MESSAGES.AGENDAMENTO_JA_PASSOU
      };
    }

    // Verificar status do agendamento
    const statusPermitidos = [
      AGENDAMENTO_STATUS.EM_ANALISE,
      AGENDAMENTO_STATUS.MARCADO
    ];

    if (!statusPermitidos.includes(agendamento.status)) {
      return {
        valid: false,
        message: ERROR_MESSAGES.STATUS_NAO_PERMITE_ENVIO_CONVITES
      };
    }

    return { valid: true };
  }

  /**
   * Valida dados de resposta de convite
   * @param {string} resposta - Resposta do convite (aceito/recusado)
   * @param {string} justificativa - Justificativa opcional
   * @returns {Object} Resultado da validação
   */
  static validateRespostaConvite(resposta, justificativa) {
    return AgendamentoValidationService.validateRespostaConvite(resposta, justificativa);
  }

  /**
   * Processa envio de emails para todos os convidados
   * @param {Object} agendamento 
   * @param {Array} convidados 
   */
  static async processarEnvioEmails(agendamento, convidados) {
    const resultados = {
      enviados: 0,
      falhas: 0,
      detalhes: []
    };

    for (const convidado of convidados) {
      try {
        const linkResposta = this.gerarLinkResposta(agendamento.id, convidado.email);
        const template = AgendamentoEmailTemplateService.generateConviteTemplate(
          agendamento,
          convidado,
          linkResposta
        );

        await emailService.sendEmail({
          to: convidado.email,
          subject: template.subject,
          html: template.html,
          text: template.text
        });

        resultados.enviados++;
        resultados.detalhes.push({
          email: convidado.email,
          status: 'enviado'
        });

      } catch (error) {
        resultados.falhas++;
        resultados.detalhes.push({
          email: convidado.email,
          status: 'falha',
          erro: error.message
        });
        
        logService.logError('Falha no envio de convite individual', error, {
          agendamentoId: agendamento.id,
          email: convidado.email
        });
      }
    }

    // Atualizar status do agendamento após envios
    await this.atualizarStatusAposEnvio(agendamento.id, resultados);

    logService.logInfo('Envio de convites concluído', {
      agendamentoId: agendamento.id,
      enviados: resultados.enviados,
      falhas: resultados.falhas
    });

    return resultados;
  }

  /**
   * Processa reenvio de emails para convidados específicos
   * @param {Object} agendamento 
   * @param {Array} convidados 
   */
  static async processarReenvioEmails(agendamento, convidados) {
    const resultados = {
      enviados: 0,
      falhas: 0,
      detalhes: []
    };

    for (const convidado of convidados) {
      try {
        const linkResposta = this.gerarLinkResposta(agendamento.id, convidado.email);
        const template = AgendamentoEmailTemplateService.generateLembreteTemplate(
          agendamento,
          convidado,
          '24h'
        );

        await emailService.sendEmail({
          to: convidado.email,
          subject: `[LEMBRETE] ${template.subject}`,
          html: template.html,
          text: template.text
        });

        resultados.enviados++;
        resultados.detalhes.push({
          email: convidado.email,
          status: 'reenviado'
        });

      } catch (error) {
        resultados.falhas++;
        resultados.detalhes.push({
          email: convidado.email,
          status: 'falha',
          erro: error.message
        });
      }
    }

    return resultados;
  }

  /**
   * Envia confirmação de resposta para o convidado
   * @param {Object} agendamento 
   * @param {Object} convidado 
   * @param {string} resposta 
   */
  static async enviarConfirmacaoResposta(agendamento, convidado, resposta) {
    try {
      const template = AgendamentoEmailTemplateService.generateConfirmacaoTemplate(
        agendamento,
        convidado,
        resposta
      );

      await emailService.sendEmail({
        to: convidado.email,
        subject: template.subject,
        html: template.html,
        text: template.text
      });

    } catch (error) {
      logService.logError('Erro ao enviar confirmação de resposta', error, {
        agendamentoId: agendamento.id,
        email: convidado.email
      });
    }
  }

  /**
   * Notifica organizador sobre resposta recebida
   * @param {Object} agendamento 
   * @param {Object} convidado 
   * @param {string} resposta 
   */
  static async notificarOrganizadorResposta(agendamento, convidado, resposta) {
    try {
      const template = AgendamentoEmailTemplateService.generateNotificacaoOrganizadorTemplate(
        agendamento,
        agendamento.usuario,
        'resposta_recebida',
        { convidado, resposta }
      );

      await emailService.sendEmail({
        to: agendamento.usuario.email,
        subject: template.subject,
        html: template.html,
        text: template.text
      });

    } catch (error) {
      logService.logError('Erro ao notificar organizador', error, {
        agendamentoId: agendamento.id,
        organizadorEmail: agendamento.usuario.email
      });
    }
  }

  /**
   * Gera link para resposta de convite
   * @param {number} agendamentoId 
   * @param {string} email 
   * @returns {string} Link de resposta
   */
  static gerarLinkResposta(agendamentoId, email) {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const encodedEmail = encodeURIComponent(email);
    return `${baseUrl}/convite/${agendamentoId}/${encodedEmail}`;
  }

  /**
   * Atualiza status do agendamento após envio de convites
   * @param {number} agendamentoId 
   * @param {Object} resultados 
   */
  static async atualizarStatusAposEnvio(agendamentoId, resultados) {
    try {
      const novoStatus = resultados.falhas === 0 ? 
        AGENDAMENTO_STATUS.PENDENTE : 
        AGENDAMENTO_STATUS.EM_ANALISE;

      await AgendamentoModel.update({
        status: novoStatus
      }, {
        where: { id: agendamentoId }
      });

    } catch (error) {
      logService.logError('Erro ao atualizar status após envio', error, { agendamentoId });
    }
  }
}

module.exports = AgendamentoConviteController;