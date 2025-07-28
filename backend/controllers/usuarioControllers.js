/**
 * @fileoverview Controladores para gerenciamento de usuários
 * @description CRUD completo para usuários com roles e autenticação
 * @version 1.0.0
 */

const { usuariosModels: Usuario, rolesModels: Role } = require('../models/indexModels');
const bcrypt = require('bcrypt');

/**
 * Lista todos os usuários ativos do sistema
 * @route GET /api/usuarios
 * @access Private (Admin)
 * @param {Object} req - Objeto de requisição Express
 * @param {Object} res - Objeto de resposta Express
 * @returns {Array} Lista de usuários ativos com roles
 */
exports.listarUsuarios = async (req, res) => {
  try {
    // Buscar apenas usuários ativos com suas roles
    const usuarios = await Usuario.findAll({
      where: { ativo: true },
      include: [{ model: Role, as: 'role' }]
    });
    res.json(usuarios);
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

/**
 * Cria novo usuário no sistema
 * @route POST /api/usuarios
 * @access Private (Admin)
 * @param {Object} req - Objeto de requisição Express
 * @param {string} req.body.nome - Nome do usuário
 * @param {string} req.body.email - Email do usuário
 * @param {string} req.body.senha - Senha do usuário
 * @param {number} req.body.role_id - ID da role do usuário
 * @param {Object} res - Objeto de resposta Express
 * @returns {Object} Dados do usuário criado
 */
exports.criarUsuario = async (req, res) => {
  try {
    const { nome, email, senha, role_id } = req.body;
    
    // Criptografar senha antes de salvar
    const senhaHash = await bcrypt.hash(senha, 10);
    
    const usuario = await Usuario.create({
      nome,
      email,
      senha: senhaHash,
      role_id,
      ativo: true
    });
    
    res.status(201).json({ id: usuario.id, nome, email, role_id });
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

/**
 * Atualiza dados de usuário existente
 * @route PUT /api/usuarios/:id
 * @access Private (Admin)
 * @param {Object} req - Objeto de requisição Express
 * @param {string} req.params.id - ID do usuário
 * @param {string} req.body.nome - Nome do usuário
 * @param {string} req.body.email - Email do usuário
 * @param {number} req.body.role_id - ID da role do usuário
 * @param {boolean} req.body.ativo - Status ativo do usuário
 * @param {Object} res - Objeto de resposta Express
 * @returns {Object} Mensagem de sucesso
 */
exports.atualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, role_id, ativo } = req.body;
    
    // Verificar se usuário existe
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }
    
    // Atualizar dados do usuário
    await usuario.update({ nome, email, role_id, ativo });
    res.json({ mensagem: 'Usuário atualizado' });
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

/**
 * Desativa usuário (exclusão lógica)
 * @route DELETE /api/usuarios/:id
 * @access Private (Admin)
 * @param {Object} req - Objeto de requisição Express
 * @param {string} req.params.id - ID do usuário
 * @param {Object} res - Objeto de resposta Express
 * @returns {Object} Mensagem de sucesso
 */
exports.excluirUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await Usuario.findByPk(id);
    
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }
    
    // Desativar usuário em vez de excluir
    await usuario.update({ ativo: false });
    res.json({ mensagem: 'Usuário desativado' });
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

/**
 * Busca usuário específico por ID
 * @route GET /api/usuarios/:id
 * @access Private (Admin)
 * @param {Object} req - Objeto de requisição Express
 * @param {string} req.params.id - ID do usuário
 * @param {Object} res - Objeto de resposta Express
 * @returns {Object} Dados do usuário com role
 */
exports.buscarUsuarioPorId = async (req, res) => {
  try {
    // Buscar usuário por ID com role incluída
    const usuario = await Usuario.findByPk(req.params.id, {
      include: [{ model: Role, as: 'role' }]
    });
    
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }
    
    res.json(usuario);
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

/**
 * Obtém perfil do usuário autenticado
 * @route GET /api/usuarios/perfil
 * @access Private (qualquer usuário autenticado)
 * @param {Object} req - Objeto de requisição Express
 * @param {Object} req.usuario - Dados do usuário autenticado (do middleware)
 * @param {Object} res - Objeto de resposta Express
 * @returns {Object} Dados do perfil do usuário
 */
exports.obterPerfil = async (req, res) => {
  try {
    // Buscar perfil do usuário autenticado
    const usuario = await Usuario.findByPk(req.usuario.id, {
      include: [{ model: Role, as: 'role' }]
    });
    res.json(usuario);
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Aliases para compatibilidade com código existente
exports.listarUsuariosDebug = exports.listarUsuarios;
exports.listarUsuariosParaVinculacao = exports.listarUsuarios;
