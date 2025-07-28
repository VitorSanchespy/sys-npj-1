/**
 * @fileoverview Controladores para gerenciamento de processos jurídicos
 * @description CRUD completo para processos com vinculação de usuários responsáveis
 * @version 1.0.0
 */

const {
  processoModels: Processo,
  usuariosModels: Usuario,
  usuariosProcessoModels: UsuariosProcesso
} = require('../models/indexModels');

/**
 * Lista todos os processos do sistema
 * @route GET /api/processos
 * @access Private
 * @param {Object} req - Objeto de requisição Express
 * @param {Object} res - Objeto de resposta Express
 * @returns {Array} Lista de processos com usuários responsáveis
 */
exports.listarProcessos = async (req, res) => {
  try {
    // Buscar todos os processos com seus usuários responsáveis
    const processos = await Processo.findAll({
      include: [{ model: Usuario, as: 'responsavel' }]
    });
    res.json(processos);
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

/**
 * Cria novo processo no sistema
 * @route POST /api/processos
 * @access Private
 * @param {Object} req - Objeto de requisição Express
 * @param {string} req.body.numero_processo - Número do processo judicial
 * @param {string} req.body.descricao - Descrição do processo
 * @param {string} req.body.assistido - Nome do assistido
 * @param {string} req.body.contato_assistido - Contato do assistido
 * @param {Object} req.usuario - Dados do usuário autenticado
 * @param {Object} res - Objeto de resposta Express
 * @returns {Object} Dados do processo criado
 */
exports.criarProcesso = async (req, res) => {
  try {
    const { numero_processo, descricao, assistido, contato_assistido } = req.body;
    
    // Criar processo com usuário autenticado como responsável
    const processo = await Processo.create({
      numero_processo,
      descricao,
      assistido,
      contato_assistido,
      idusuario_responsavel: req.usuario.id,
      status: 'ativo'
    });
    
    res.status(201).json(processo);
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

/**
 * Atualiza dados de processo existente
 * @route PUT /api/processos/:processo_id
 * @access Private
 * @param {Object} req - Objeto de requisição Express
 * @param {string} req.params.processo_id - ID do processo
 * @param {Object} req.body - Dados a serem atualizados
 * @param {Object} res - Objeto de resposta Express
 * @returns {Object} Dados do processo atualizado
 */
exports.atualizarProcessos = async (req, res) => {
  try {
    const { processo_id } = req.params;
    const processo = await Processo.findByPk(processo_id);
    
    if (!processo) {
      return res.status(404).json({ erro: 'Processo não encontrado' });
    }
    
    // Atualizar processo com dados fornecidos
    await processo.update(req.body);
    res.json(processo);
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

/**
 * Busca processo específico por ID
 * @route GET /api/processos/:id
 * @access Private
 * @param {Object} req - Objeto de requisição Express
 * @param {string} req.params.id - ID do processo
 * @param {Object} res - Objeto de resposta Express
 * @returns {Object} Dados do processo com usuário responsável
 */
exports.buscarProcessoPorId = async (req, res) => {
  try {
    // Buscar processo por ID com usuário responsável
    const processo = await Processo.findByPk(req.params.id, {
      include: [{ model: Usuario, as: 'responsavel' }]
    });
    
    if (!processo) {
      return res.status(404).json({ erro: 'Processo não encontrado' });
    }
    
    res.json(processo);
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

/**
 * Vincula usuário a um processo
 * @route POST /api/processos/vincular-usuario
 * @access Private
 * @param {Object} req - Objeto de requisição Express
 * @param {number} req.body.processo_id - ID do processo
 * @param {number} req.body.usuario_id - ID do usuário
 * @param {Object} res - Objeto de resposta Express
 * @returns {Object} Dados do vínculo criado
 */
exports.vincularUsuario = async (req, res) => {
  try {
    const { processo_id, usuario_id } = req.body;
    
    // Criar vínculo entre usuário e processo
    const vinculo = await UsuariosProcesso.create({
      processo_id,
      usuario_id
    });
    
    res.status(201).json(vinculo);
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

/**
 * Exclui processo do sistema
 * @route DELETE /api/processos/:id
 * @access Private (Admin)
 * @param {Object} req - Objeto de requisição Express
 * @param {string} req.params.id - ID do processo
 * @param {Object} res - Objeto de resposta Express
 * @returns {Object} Mensagem de confirmação
 */
exports.excluirProcesso = async (req, res) => {
  try {
    const processo = await Processo.findByPk(req.params.id);
    if (!processo) {
      return res.status(404).json({ erro: 'Processo não encontrado' });
    }
    
    // Remover processo definitivamente
    await processo.destroy();
    res.json({ mensagem: 'Processo excluído' });
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};
