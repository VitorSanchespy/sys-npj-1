/**
 * Controlador especializado para gestão CRUD de agendamentos
 * Substitui a funcionalidade de gerenciamento básico do agendamentoController monolítico
 */

const { Op } = require('sequelize');
const AgendamentoModel = require('../../models/agendamentoModel');
const UsuarioModel = require('../../models/usuarioModel');
const ProcessoModel = require('../../models/processoModel');

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
  SUCCESS_MESSAGES,
  AGENDAMENTO_LIMITS
} = require('../../config/agendamento/constants');

class AgendamentoManagementController {

  /**
   * Cria um novo agendamento
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async criar(req, res) {
    const transaction = await AgendamentoModel.sequelize.transaction();
    
    try {
      const usuarioId = req.user?.id;
      let dadosAgendamento = req.body;

      // Sanitizar dados de entrada
      dadosAgendamento = AgendamentoValidationService.sanitizeData(dadosAgendamento);

      // Validações básicas
      const validation = AgendamentoValidationService.validateBasicData(dadosAgendamento);
      if (!validation.isValid) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: validation.errors
        });
      }

      // Validar convidados se fornecidos
      if (dadosAgendamento.convidados && dadosAgendamento.convidados.length > 0) {
        const convidadosValidation = AgendamentoValidationService.validateConvidados(dadosAgendamento.convidados);
        if (!convidadosValidation.isValid) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message: 'Lista de convidados inválida',
            errors: convidadosValidation.errors
          });
        }
      }

      // Verificar se processo existe (se informado)
      if (dadosAgendamento.processo_id) {
        const processo = await ProcessoModel.findByPk(dadosAgendamento.processo_id);
        if (!processo) {
          await transaction.rollback();
          return res.status(404).json({
            success: false,
            message: ERROR_MESSAGES.PROCESSO_NAO_ENCONTRADO
          });
        }
      }

      // Preparar dados para criação
      const dadosCriacao = {
        ...dadosAgendamento,
        criado_por: usuarioId,
        status: AGENDAMENTO_STATUS.RASCUNHO,
        convidados: dadosAgendamento.convidados ? 
          ConvidadoUtilsService.processConvidadosInput(dadosAgendamento.convidados) : 
          []
      };

      // Criar agendamento
      const agendamento = await AgendamentoModel.create(dadosCriacao, { transaction });

      // Buscar agendamento completo com relacionamentos
      const agendamentoCompleto = await AgendamentoModel.findByPk(agendamento.id, {
        include: [
          {
            model: UsuarioModel,
            as: 'usuario',
            attributes: ['id', 'nome', 'email']
          },
          {
            model: ProcessoModel,
            as: 'processo',
            attributes: ['id', 'numero_processo', 'titulo'],
            required: false
          }
        ],
        transaction
      });

      await transaction.commit();

      // Log da atividade
      logService.logInfo('Agendamento criado', {
        agendamentoId: agendamento.id,
        usuarioId,
        titulo: agendamento.titulo
      });

      res.status(201).json({
        success: true,
        message: SUCCESS_MESSAGES.AGENDAMENTO_CRIADO,
        data: agendamentoCompleto
      });

    } catch (error) {
      await transaction.rollback();
      logService.logError('Erro ao criar agendamento', error, {
        usuarioId: req.user?.id,
        dadosAgendamento: req.body
      });

      res.status(500).json({
        success: false,
        message: ERROR_MESSAGES.ERRO_INTERNO_SERVIDOR
      });
    }
  }

  /**
   * Atualiza um agendamento existente
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async atualizar(req, res) {
    const transaction = await AgendamentoModel.sequelize.transaction();
    
    try {
      const { agendamentoId } = req.params;
      const usuarioId = req.user?.id;
      let dadosAtualizacao = req.body;

      // Buscar agendamento existente
      const agendamento = await AgendamentoModel.findByPk(agendamentoId, {
        include: [
          {
            model: UsuarioModel,
            as: 'usuario',
            attributes: ['id', 'nome', 'email']
          },
          {
            model: ProcessoModel,
            as: 'processo',
            attributes: ['id', 'numero_processo', 'titulo'],
            required: false
          }
        ],
        transaction
      });

      if (!agendamento) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: ERROR_MESSAGES.AGENDAMENTO_NAO_ENCONTRADO
        });
      }

      // Verificar permissões de edição
      if (!this.podeEditar(agendamento, usuarioId)) {
        await transaction.rollback();
        return res.status(403).json({
          success: false,
          message: ERROR_MESSAGES.USUARIO_NAO_AUTORIZADO
        });
      }

      // Sanitizar dados de entrada
      dadosAtualizacao = AgendamentoValidationService.sanitizeData(dadosAtualizacao);

      // Validações básicas
      const validation = AgendamentoValidationService.validateBasicData(dadosAtualizacao);
      if (!validation.isValid) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: validation.errors
        });
      }

      // Validar convidados se fornecidos
      if (dadosAtualizacao.convidados) {
        const convidadosValidation = AgendamentoValidationService.validateConvidados(dadosAtualizacao.convidados);
        if (!convidadosValidation.isValid) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message: 'Lista de convidados inválida',
            errors: convidadosValidation.errors
          });
        }

        // Processar convidados mantendo respostas existentes se aplicável
        dadosAtualizacao.convidados = ConvidadoUtilsService.mergeConvidadosUpdate(
          agendamento.convidados,
          dadosAtualizacao.convidados
        );
      }

      // Verificar se processo existe (se informado)
      if (dadosAtualizacao.processo_id && dadosAtualizacao.processo_id !== agendamento.processo_id) {
        const processo = await ProcessoModel.findByPk(dadosAtualizacao.processo_id);
        if (!processo) {
          await transaction.rollback();
          return res.status(404).json({
            success: false,
            message: ERROR_MESSAGES.PROCESSO_NAO_ENCONTRADO
          });
        }
      }

      // Atualizar agendamento
      await agendamento.update(dadosAtualizacao, { transaction });

      // Buscar agendamento atualizado com relacionamentos
      const agendamentoAtualizado = await AgendamentoModel.findByPk(agendamento.id, {
        include: [
          {
            model: UsuarioModel,
            as: 'usuario',
            attributes: ['id', 'nome', 'email']
          },
          {
            model: ProcessoModel,
            as: 'processo',
            attributes: ['id', 'numero_processo', 'titulo'],
            required: false
          }
        ],
        transaction
      });

      await transaction.commit();

      // Log da atividade
      logService.logInfo('Agendamento atualizado', {
        agendamentoId,
        usuarioId,
        alteracoes: Object.keys(dadosAtualizacao)
      });

      res.json({
        success: true,
        message: SUCCESS_MESSAGES.AGENDAMENTO_ATUALIZADO,
        data: agendamentoAtualizado
      });

    } catch (error) {
      await transaction.rollback();
      logService.logError('Erro ao atualizar agendamento', error, {
        agendamentoId: req.params.agendamentoId,
        usuarioId: req.user?.id
      });

      res.status(500).json({
        success: false,
        message: ERROR_MESSAGES.ERRO_INTERNO_SERVIDOR
      });
    }
  }

  /**
   * Lista agendamentos com filtros e paginação
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async listar(req, res) {
    try {
      const usuarioId = req.user?.id;
      const {
        page = 1,
        limit = 20,
        status,
        data_inicio,
        data_fim,
        processo_id,
        busca,
        meus_agendamentos,
        incluir_convidados
      } = req.query;

      // Construir filtros
      const where = {};
      const include = [
        {
          model: UsuarioModel,
          as: 'usuario',
          attributes: ['id', 'nome', 'email']
        }
      ];

      // Filtro por status
      if (status) {
        where.status = status;
      }

      // Filtro por data
      if (data_inicio && data_fim) {
        where.data_inicio = {
          [Op.between]: [new Date(data_inicio), new Date(data_fim)]
        };
      } else if (data_inicio) {
        where.data_inicio = {
          [Op.gte]: new Date(data_inicio)
        };
      } else if (data_fim) {
        where.data_inicio = {
          [Op.lte]: new Date(data_fim)
        };
      }

      // Filtro por processo
      if (processo_id) {
        where.processo_id = processo_id;
        include.push({
          model: ProcessoModel,
          as: 'processo',
          attributes: ['id', 'numero_processo', 'titulo']
        });
      }

      // Filtro por usuário (meus agendamentos)
      if (meus_agendamentos === 'true') {
        where[Op.or] = [
          { criado_por: usuarioId },
          // Agendamentos onde é convidado
          {
            convidados: {
              [Op.like]: `%${req.user.email}%`
            }
          }
        ];
      }

      // Busca textual
      if (busca) {
        where[Op.or] = [
          { titulo: { [Op.like]: `%${busca}%` } },
          { descricao: { [Op.like]: `%${busca}%` } },
          { local: { [Op.like]: `%${busca}%` } }
        ];
      }

      // Incluir dados de convidados se solicitado
      if (incluir_convidados === 'true') {
        // Adicionar lógica para incluir informações de convidados
      }

      // Calcular offset para paginação
      const offset = (parseInt(page) - 1) * parseInt(limit);

      // Buscar agendamentos
      const { count, rows: agendamentos } = await AgendamentoModel.findAndCountAll({
        where,
        include,
        limit: parseInt(limit),
        offset,
        order: [['data_inicio', 'ASC']],
        distinct: true
      });

      // Calcular informações de paginação
      const totalPages = Math.ceil(count / parseInt(limit));
      const hasNextPage = parseInt(page) < totalPages;
      const hasPrevPage = parseInt(page) > 1;

      res.json({
        success: true,
        data: {
          agendamentos,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalItems: count,
            itemsPerPage: parseInt(limit),
            hasNextPage,
            hasPrevPage
          }
        }
      });

    } catch (error) {
      logService.logError('Erro ao listar agendamentos', error, {
        usuarioId: req.user?.id,
        filtros: req.query
      });

      res.status(500).json({
        success: false,
        message: ERROR_MESSAGES.ERRO_INTERNO_SERVIDOR
      });
    }
  }

  /**
   * Busca um agendamento por ID
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async buscarPorId(req, res) {
    try {
      const { agendamentoId } = req.params;
      const usuarioId = req.user?.id;

      const agendamento = await AgendamentoModel.findByPk(agendamentoId, {
        include: [
          {
            model: UsuarioModel,
            as: 'usuario',
            attributes: ['id', 'nome', 'email']
          },
          {
            model: ProcessoModel,
            as: 'processo',
            attributes: ['id', 'numero_processo', 'titulo'],
            required: false
          }
        ]
      });

      if (!agendamento) {
        return res.status(404).json({
          success: false,
          message: ERROR_MESSAGES.AGENDAMENTO_NAO_ENCONTRADO
        });
      }

      // Verificar se usuário tem permissão para visualizar
      if (!this.podeVisualizar(agendamento, usuarioId, req.user?.email)) {
        return res.status(403).json({
          success: false,
          message: ERROR_MESSAGES.USUARIO_NAO_AUTORIZADO
        });
      }

      // Enriquecer dados do agendamento
      const agendamentoEnriquecido = {
        ...agendamento.toJSON(),
        permissoes: {
          pode_editar: this.podeEditar(agendamento, usuarioId),
          pode_excluir: this.podeExcluir(agendamento, usuarioId),
          pode_alterar_status: this.podeAlterarStatus(agendamento, usuarioId)
        },
        estatisticas: this.calcularEstatisticasConvidados(agendamento.convidados)
      };

      res.json({
        success: true,
        data: agendamentoEnriquecido
      });

    } catch (error) {
      logService.logError('Erro ao buscar agendamento', error, {
        agendamentoId: req.params.agendamentoId,
        usuarioId: req.user?.id
      });

      res.status(500).json({
        success: false,
        message: ERROR_MESSAGES.ERRO_INTERNO_SERVIDOR
      });
    }
  }

  /**
   * Exclui um agendamento
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async excluir(req, res) {
    const transaction = await AgendamentoModel.sequelize.transaction();
    
    try {
      const { agendamentoId } = req.params;
      const usuarioId = req.user?.id;
      const { motivo } = req.body;

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

      // Verificar permissões
      if (!this.podeExcluir(agendamento, usuarioId)) {
        await transaction.rollback();
        return res.status(403).json({
          success: false,
          message: ERROR_MESSAGES.USUARIO_NAO_AUTORIZADO
        });
      }

      // Registrar motivo da exclusão se fornecido
      if (motivo) {
        await agendamento.update({
          observacoes: (agendamento.observacoes || '') + 
            `\n[${new Date().toLocaleString()}] Motivo da exclusão: ${motivo}`
        }, { transaction });
      }

      // Notificar convidados se necessário
      if (agendamento.status !== AGENDAMENTO_STATUS.RASCUNHO && agendamento.convidados?.length > 0) {
        this.notificarConvidadosExclusao(agendamento, motivo)
          .catch(error => {
            logService.logError('Erro ao notificar convidados sobre exclusão', error, {
              agendamentoId
            });
          });
      }

      // Excluir agendamento
      await agendamento.destroy({ transaction });

      await transaction.commit();

      // Log da atividade
      logService.logInfo('Agendamento excluído', {
        agendamentoId,
        usuarioId,
        titulo: agendamento.titulo,
        motivo
      });

      res.json({
        success: true,
        message: SUCCESS_MESSAGES.AGENDAMENTO_EXCLUIDO_SUCESSO
      });

    } catch (error) {
      await transaction.rollback();
      logService.logError('Erro ao excluir agendamento', error, {
        agendamentoId: req.params.agendamentoId,
        usuarioId: req.user?.id
      });

      res.status(500).json({
        success: false,
        message: ERROR_MESSAGES.ERRO_INTERNO_SERVIDOR
      });
    }
  }

  // ========== MÉTODOS AUXILIARES ==========

  /**
   * Verifica se usuário pode editar o agendamento
   * @param {Object} agendamento 
   * @param {number} usuarioId 
   * @returns {boolean}
   */
  static podeEditar(agendamento, usuarioId) {
    // Criador pode editar
    if (agendamento.criado_por === usuarioId) {
      return true;
    }

    // Admin pode editar
    // TODO: Implementar verificação de role de admin
    
    // Não pode editar agendamentos finalizados ou cancelados
    const statusNaoEditaveis = [AGENDAMENTO_STATUS.FINALIZADO, AGENDAMENTO_STATUS.CANCELADO];
    if (statusNaoEditaveis.includes(agendamento.status)) {
      return false;
    }

    return false;
  }

  /**
   * Verifica se usuário pode visualizar o agendamento
   * @param {Object} agendamento 
   * @param {number} usuarioId 
   * @param {string} emailUsuario 
   * @returns {boolean}
   */
  static podeVisualizar(agendamento, usuarioId, emailUsuario) {
    // Criador pode visualizar
    if (agendamento.criado_por === usuarioId) {
      return true;
    }

    // Convidado pode visualizar
    if (emailUsuario && agendamento.convidados) {
      const convidados = ConvidadoUtilsService.parseConvidados(agendamento.convidados);
      const isConvidado = convidados.some(c => c.email === emailUsuario);
      if (isConvidado) {
        return true;
      }
    }

    // Admin pode visualizar
    // TODO: Implementar verificação de role de admin

    return false;
  }

  /**
   * Verifica se usuário pode excluir o agendamento
   * @param {Object} agendamento 
   * @param {number} usuarioId 
   * @returns {boolean}
   */
  static podeExcluir(agendamento, usuarioId) {
    // Criador pode excluir
    if (agendamento.criado_por === usuarioId) {
      return true;
    }

    // Admin pode excluir
    // TODO: Implementar verificação de role de admin

    // Não pode excluir agendamentos finalizados
    if (agendamento.status === AGENDAMENTO_STATUS.FINALIZADO) {
      return false;
    }

    return false;
  }

  /**
   * Verifica se usuário pode alterar status do agendamento
   * @param {Object} agendamento 
   * @param {number} usuarioId 
   * @returns {boolean}
   */
  static podeAlterarStatus(agendamento, usuarioId) {
    // Usar mesma lógica de edição por enquanto
    return this.podeEditar(agendamento, usuarioId);
  }

  /**
   * Calcula estatísticas dos convidados
   * @param {Array} convidados 
   * @returns {Object}
   */
  static calcularEstatisticasConvidados(convidados) {
    if (!convidados || convidados.length === 0) {
      return {
        total: 0,
        aceitos: 0,
        recusados: 0,
        pendentes: 0,
        taxa_resposta: 0
      };
    }

    const parsedConvidados = ConvidadoUtilsService.parseConvidados(convidados);
    const statusAnalysis = ConvidadoUtilsService.analyzeConvidadosStatus(parsedConvidados);

    return {
      total: parsedConvidados.length,
      aceitos: statusAnalysis.aceitos,
      recusados: statusAnalysis.recusados,
      pendentes: statusAnalysis.pendentes,
      taxa_resposta: Math.round(((statusAnalysis.aceitos + statusAnalysis.recusados) / parsedConvidados.length) * 100)
    };
  }

  /**
   * Notifica convidados sobre exclusão do agendamento
   * @param {Object} agendamento 
   * @param {string} motivo 
   */
  static async notificarConvidadosExclusao(agendamento, motivo) {
    try {
      const convidados = ConvidadoUtilsService.parseConvidados(agendamento.convidados);
      
      for (const convidado of convidados) {
        try {
          const template = AgendamentoEmailTemplateService.generateNotificacaoOrganizadorTemplate(
            agendamento,
            convidado,
            'agendamento_excluido',
            { motivo }
          );

          await emailService.sendEmail({
            to: convidado.email,
            subject: template.subject,
            html: template.html,
            text: template.text
          });

        } catch (error) {
          logService.logError('Erro ao notificar convidado sobre exclusão', error, {
            agendamentoId: agendamento.id,
            convidadoEmail: convidado.email
          });
        }
      }

    } catch (error) {
      logService.logError('Erro geral ao notificar convidados sobre exclusão', error, {
        agendamentoId: agendamento.id
      });
    }
  }
}

module.exports = AgendamentoManagementController;