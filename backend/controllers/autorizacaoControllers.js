/**
 * @fileoverview Controladores de autorização para login, registro e refresh token
 * @description Sistema de autenticação JWT com bcrypt para senhas
 * @version 1.0.0
 */

const { usuariosModels: Usuario, rolesModels: Role } = require('../models/indexModels');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/**
 * Autentica usuário e gera token JWT
 * @route POST /api/auth/login
 * @access Public
 * @param {Object} req - Objeto de requisição Express
 * @param {string} req.body.email - Email do usuário
 * @param {string} req.body.senha - Senha do usuário
 * @param {Object} res - Objeto de resposta Express
 * @returns {Object} Token JWT e dados do usuário
 */
exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body;
    
    // Buscar usuário ativo por email com role
    const usuario = await Usuario.findOne({
      where: { email, ativo: [true, 1] },
      include: [{ model: Role, as: 'role' }]
    });
    
    if (!usuario) {
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }
    
    // Verificar senha com bcrypt
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }
    
    // Gerar token JWT com dados do usuário
    const token = jwt.sign(
      { 
        id: usuario.id, 
        role: usuario.role?.nome || 'Admin' 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.TOKEN_EXPIRATION || '24h' }
    );
    
    res.json({
      success: true,
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role?.nome || 'Admin'
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

/**
 * Registra novo usuário no sistema
 * @route POST /api/auth/registro
 * @access Public
 * @param {Object} req - Objeto de requisição Express
 * @param {string} req.body.nome - Nome do usuário
 * @param {string} req.body.email - Email do usuário
 * @param {string} req.body.senha - Senha do usuário
 * @param {Object} res - Objeto de resposta Express
 * @returns {Object} Dados do usuário criado
 */
exports.registro = async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    
    // Verificar se email já existe
    const usuarioExiste = await Usuario.findOne({ where: { email } });
    if (usuarioExiste) {
      return res.status(400).json({ erro: 'Email já cadastrado' });
    }
    
    // Criptografar senha com bcrypt
    const senhaHash = await bcrypt.hash(senha, 10);
    
    // Criar novo usuário
    const usuario = await Usuario.create({
      nome,
      email,
      senha: senhaHash,
      role_id: 1, // Admin por padrão
      ativo: true
    });
    
    res.status(201).json({
      mensagem: 'Usuário criado com sucesso',
      usuario: { id: usuario.id, nome, email }
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

/**
 * Atualiza token JWT (funcionalidade não implementada)
 * @route POST /api/auth/refresh
 * @access Private
 * @param {Object} req - Objeto de requisição Express
 * @param {Object} res - Objeto de resposta Express
 * @returns {Object} Mensagem de erro (não implementado)
 */
exports.refreshToken = async (req, res) => {
  try {
    res.status(501).json({ erro: 'Não implementado - use login novamente' });
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};
