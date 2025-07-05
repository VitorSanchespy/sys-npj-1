const Usuario = require('../models/userModels');
const { gerarHash, verificarSenha, gerarToken } = require('../utils/authUtils');

exports.registrar = async (req, res) => {
  try {
    const { nome, email, senha, role_id } = req.body;
    // Verificar se email já existe
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
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }

    const senhaValida = await verificarSenha(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }

    const token = gerarToken({
      id: usuario.id,
      role: usuario.role
    });

    res.json({ 
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role
      }
    });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
};

exports.perfil = async (req, res) => {
  try {
    const usuarioCompleto = await Usuario.usuarioCompleto(req.usuario.id);

    res.json({
      id: usuarioCompleto.id,
      nome: usuarioCompleto.nome,
      email: usuarioCompleto.email,
      role: usuarioCompleto.role,
      criado_em: usuarioCompleto.criado_em,
      // Outros campos seguros para exibir
    });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
};