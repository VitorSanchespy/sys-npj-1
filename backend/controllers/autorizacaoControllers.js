// Controlador de Autenticação
const { usuariosModels: Usuario, rolesModels: Role } = require('../models/indexModels');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Login do usuário
// Login do usuário
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

// Registro de novo usuário
// Registro de novo usuário
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

// Refresh token (não implementado)
// Refresh token (não implementado)
exports.refreshToken = async (req, res) => {
  try {
    res.status(501).json({ erro: 'Não implementado - use login novamente' });
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};


// ROTAS
const express = require('express');
const router = express.Router();
const authController = require('../controllers/autorizacaoControllers');
const { validate,  handleValidation } = require('../middleware/validationMiddleware');
const verificarToken = require('../middleware/authMiddleware');
const verificarTokenReset = require('../middleware/resetPasswordMiddleware');

// registrar novo usuário
router.post('/registrar', [
  validate('registrarUsuario'),
  handleValidation
], authController.registrar);

// Login de usuário
router.post('/login', [
  validate('loginUsuario'),
  handleValidation
], authController.login);

// Compatível com frontend: POST /auth/esqueci-senha
router.post('/esqueci-senha', authController.solicitarRecuperacao);
router.post('/solicitar-recuperacao', authController.solicitarRecuperacao);
router.post('/redefinir-senha', verificarTokenReset, authController.redefinirSenha);

// perfil do usuário autenticado 
router.get('/perfil', verificarToken, authController.perfil);

// Endpoint para refresh token
router.post('/refresh', authController.refreshToken);

module.exports = router;