const Usuario = require('../models/userModels');
const { gerarHash, verificarSenha, gerarToken } = require('../utils/authUtils');
const { enviarEmailRecuperacao } = require('../services/emailService');
const verificarTokenReset = require('../middleware/resetPasswordMiddleware');
const RESET_TOKEN_EXPIRATION = '1h';

exports.registrar = async (req, res) => {
  try {
    const { nome, email, senha, role_id } = req.body;
    const usuarioExistente = await Usuario.buscarPorEmail(email);
    if (usuarioExistente) {
      return res.status(400).json({ erro: 'Email já está em uso' });
    }
    const usuarioId = await Usuario.criar({ nome, email, senha, role_id });
    res.status(201).json({ id: usuarioId });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body;
    const usuario = await Usuario.buscarPorEmail(email);
    if (!usuario) {
      return res.json({ success: false, message: 'E-mail não encontrado' });
    }
    const senhaValida = await verificarSenha(senha, usuario.senha);
    if (!senhaValida) {
      return res.json({ success: false, message: 'Senha incorreta' });
    }
    const token = gerarToken({
      id: usuario.id,
      role: usuario.role
    });
    res.json({
      success: true,
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.solicitarRecuperacao = async (req, res) => {
  try {
    const { email } = req.body;
    const usuario = await Usuario.buscarPorEmail(email);
    
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