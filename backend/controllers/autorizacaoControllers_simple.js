const { usuariosModels: Usuario, rolesModels: Role } = require('../models/indexModels');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Login
exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body;
    
    const usuario = await Usuario.findOne({
      where: { email, ativo: [true, 1] },
      include: [{ model: Role, as: 'role' }]
    });
    
    if (!usuario) {
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }
    
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }
    
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

// Registro
exports.registro = async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    
    const usuarioExiste = await Usuario.findOne({ where: { email } });
    if (usuarioExiste) {
      return res.status(400).json({ erro: 'Email já cadastrado' });
    }
    
    const senhaHash = await bcrypt.hash(senha, 10);
    
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

// Refresh token (simplificado)
exports.refreshToken = async (req, res) => {
  try {
    res.status(501).json({ erro: 'Não implementado - use login novamente' });
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};
