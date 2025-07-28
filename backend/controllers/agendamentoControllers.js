/**
 * @fileoverview Controller de Agendamentos do Sistema NPJ
 * @description Gerencia operações CRUD para agendamentos e eventos
 * @author Sistema NPJ
 * @version 2.0.0
 * @since 2025-07-28
 */

const { agendamentoModels: Agendamento } = require('../models/indexModels');

/**
 * Lista todos os agendamentos ordenados por data do evento
 * @route GET /api/agendamentos
 * @access Private (requer autenticação)
 * @param {Object} req - Objeto de requisição Express
 * @param {Object} res - Objeto de resposta Express
 * @returns {Array} Lista de agendamentos
 */
exports.listarAgendamentos = async (req, res) => {
  try {
    const agendamentos = await Agendamento.findAll({
      order: [['data_evento', 'ASC']]
    });
    res.json(agendamentos);
  } catch (error) {
    console.error('Erro ao listar agendamentos:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

/**
 * Cria um novo agendamento no sistema
 * @route POST /api/agendamentos
 * @access Private (requer autenticação)
 * @param {Object} req - Objeto de requisição Express
 * @param {Object} req.body - Dados do agendamento
 * @param {number} req.body.processo_id - ID do processo relacionado (opcional)
 * @param {string} req.body.tipo_evento - Tipo do evento (audiencia, reuniao, etc)
 * @param {string} req.body.titulo - Título do agendamento
 * @param {string} req.body.descricao - Descrição detalhada (opcional)
 * @param {string} req.body.data_evento - Data e hora do evento
 * @param {string} req.body.local - Local do evento (opcional)
 * @param {boolean} req.body.lembrete_1_dia - Ativar lembrete 1 dia antes
 * @param {boolean} req.body.lembrete_2_dias - Ativar lembrete 2 dias antes
 * @param {boolean} req.body.lembrete_1_semana - Ativar lembrete 1 semana antes
 * @param {Object} res - Objeto de resposta Express
 * @returns {Object} Agendamento criado
 */
exports.criarAgendamento = async (req, res) => {
  try {
    const {
      processo_id,
      tipo_evento,
      titulo,
      descricao,
      data_evento,
      local,
      lembrete_1_dia,
      lembrete_2_dias,
      lembrete_1_semana
    } = req.body;
    
    // Criar agendamento com dados padronizados
    const agendamento = await Agendamento.create({
      processo_id: processo_id || null,
      usuario_id: req.usuario.id,
      tipo_evento,
      titulo,
      descricao: descricao || null,
      data_evento: new Date(data_evento),
      local: local || null,
      status: 'agendado',
      lembrete_1_dia: lembrete_1_dia !== undefined ? lembrete_1_dia : true,
      lembrete_2_dias: lembrete_2_dias !== undefined ? lembrete_2_dias : true,
      lembrete_1_semana: lembrete_1_semana !== undefined ? lembrete_1_semana : false
    });

    res.status(201).json(agendamento);
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

/**
 * Atualiza um agendamento existente
 * @route PUT /api/agendamentos/:id
 * @access Private (requer autenticação)
 * @param {Object} req - Objeto de requisição Express
 * @param {string} req.params.id - ID do agendamento a ser atualizado
 * @param {Object} req.body - Novos dados do agendamento
 * @param {Object} res - Objeto de resposta Express
 * @returns {Object} Agendamento atualizado
 */
exports.atualizarAgendamento = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscar agendamento existente
    const agendamento = await Agendamento.findByPk(id);
    if (!agendamento) {
      return res.status(404).json({ erro: 'Agendamento não encontrado' });
    }
    
    // Atualizar com novos dados
    await agendamento.update(req.body);
    res.json(agendamento);
  } catch (error) {
    console.error('Erro ao atualizar agendamento:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

/**
 * Remove um agendamento do sistema
 * @route DELETE /api/agendamentos/:id
 * @access Private (requer autenticação)
 * @param {Object} req - Objeto de requisição Express
 * @param {string} req.params.id - ID do agendamento a ser removido
 * @param {Object} res - Objeto de resposta Express
 * @returns {Object} Confirmação de remoção
 */
exports.excluirAgendamento = async (req, res) => {
  try {
    const { id } = req.params;
    const agendamento = await Agendamento.findByPk(id);
    
    if (!agendamento) {
      return res.status(404).json({ erro: 'Agendamento não encontrado' });
    }
    
    await agendamento.destroy();
    res.json({ mensagem: 'Agendamento excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir agendamento:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

/**
 * Busca agendamento específico por ID
 * @route GET /api/agendamentos/:id
 * @access Private (requer autenticação)
 * @param {Object} req - Objeto de requisição Express
 * @param {string} req.params.id - ID do agendamento
 * @param {Object} res - Objeto de resposta Express
 * @returns {Object} Dados do agendamento encontrado
 */
exports.buscarAgendamentoPorId = async (req, res) => {
  try {
    // Buscar agendamento por ID primário
    const agendamento = await Agendamento.findByPk(req.params.id);
    
    if (!agendamento) {
      return res.status(404).json({ erro: 'Agendamento não encontrado' });
    }
    
    res.json(agendamento);
  } catch (error) {
    console.error('Erro ao buscar agendamento:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};
