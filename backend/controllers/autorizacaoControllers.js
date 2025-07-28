// ...existing code...
const RefreshToken = require('../models/refreshTokenModels');
const { gerarRefreshToken, validarRefreshToken, logAuthEvent } = require('../utils/authUtils');
const { Op } = require('sequelize');

// Endpoint para refresh token
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ erro: 'Refresh token não fornecido.' });

    // Busca o refresh token no banco
    const tokenDoc = await RefreshToken.findOne({ where: { token: refreshToken, revoked: false, expires_at: { [Op.gt]: new Date() } } });
    if (!tokenDoc) return res.status(401).json({ erro: 'Refresh token inválido ou expirado.' });

    // Busca usuário
    const usuario = await require('../models/usuariosModels').findByPk(tokenDoc.user_id);
    if (!usuario) return res.status(401).json({ erro: 'Usuário não encontrado.' });

    // Gera novo JWT
    const jwtToken = require('../utils/authUtils').gerarToken(usuario);
    logAuthEvent('Refresh JWT', { user_id: usuario.id });
    return res.json({ token: jwtToken });
  } catch (error) {
    logAuthEvent('Erro no refresh', error);
    return res.status(500).json({ erro: 'Erro ao renovar token.' });
  }
};
const { usuariosModels: Usuario, rolesModels: Role } = require('../models/indexModels');
const { gerarHash, verificarSenha, gerarToken } = require('../utils/authUtils');
const { enviarEmailRecuperacao } = require('../services/emailService');
const verificarTokenReset = require('../middleware/resetPasswordMiddleware');
const RESET_TOKEN_EXPIRATION = '1h';

// Registrar um novo usuário
exports.registrar = async (req, res) => {
  try {
    const { nome, email, senha, role_id } = req.body;
    const usuarioExistente = await Usuario.findOne({ where: { email } });
    if (usuarioExistente) {
      return res.status(400).json({ erro: 'Email já está em uso' });
    }
    const senhaHash = await gerarHash(senha);
    const usuario = await Usuario.create({ nome, email, senha: senhaHash, role_id });
    res.status(201).json({ id: usuario.id });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
};

// Login de usuário
exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body;
    const usuario = await Usuario.findOne({ where: { email }, include: [{ model: Role, as: 'role' }] });
    if (!usuario) {
      return res.json({ success: false, message: 'E-mail não encontrado' });
    }
    const senhaValida = await verificarSenha(senha, usuario.senha);
    if (!senhaValida) {
      return res.json({ success: false, message: 'Senha incorreta' });
    }
    const token = gerarToken({
      id: usuario.id,
      role: usuario.role?.nome
    });
    
    // Gerar refresh token
    console.log('🔄 Gerando refresh token...');
    const { gerarRefreshToken } = require('../utils/authUtils');
    const refreshToken = gerarRefreshToken(usuario);
    console.log('🔄 Refresh token gerado:', refreshToken);
    const expiresAt = new Date(Date.now() + (parseInt(process.env.REFRESH_TOKEN_EXPIRATION || '7') * 24 * 60 * 60 * 1000));
    console.log('🔄 Salvando refresh token no banco...');
    await RefreshToken.create({ user_id: usuario.id, token: refreshToken, expires_at: expiresAt });
    console.log('🔄 Refresh token salvo com sucesso!');
    
    res.json({
      success: true,
      token,
      refreshToken,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role?.nome
      }
    });
  } catch (error) {
    console.error('❌ Erro no login:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Recuperação de senha
exports.solicitarRecuperacao = async (req, res) => {
  try {
    const { email } = req.body;
    const usuario = await Usuario.findOne({ where: { email } });
    
    // Mensagem genérica por segurança
    if (!usuario) {
      return res.status(200).json({ mensagem: 'Se o email existir, um link foi enviado' });
    }

    // Gerar token JWT com propósito específico
    const token = gerarToken(
      { 
        id: usuario.id,
        purpose: 'password_reset' 
      },
      RESET_TOKEN_EXPIRATION
    );
    
    await enviarEmailRecuperacao(email, token);
    res.json({ mensagem: 'Email enviado com sucesso' });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
};

// Redefinir senha
exports.redefinirSenha = [
  verificarTokenReset, // Middleware específico para redefinição
  async (req, res) => {
    try {
      const { novaSenha } = req.body;
      
      // Agora o usuário já está validado pelo middleware
      await Usuario.atualizarSenha(req.usuario.id, novaSenha);
      
      res.json({ mensagem: 'Senha redefinida com sucesso' });
    } catch (error) {
      res.status(500).json({ erro: error.message });
    }
  }
];

// Perfil do usuário
exports.perfil = async (req, res) => {
  try {
    const usuarioCompleto = await Usuario.usuarioCompleto(req.usuario.id);
    res.json({
      id: usuarioCompleto.id,
      nome: usuarioCompleto.nome,
      email: usuarioCompleto.email,
      role: usuarioCompleto.role ? usuarioCompleto.role.nome : undefined,
      // ... outros campos
    });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
};