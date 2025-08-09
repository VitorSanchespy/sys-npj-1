const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const NotificacaoService = require('../services/notificacaoService');

// Função utilitária para verificar disponibilidade do banco
const isDbAvailable = () => global.dbAvailable || false;

// Login
exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body;
    
    if (!email || !senha) {
      return res.status(400).json({ erro: 'Email e senha são obrigatórios' });
    }
    
    let usuario = null;
    
    if (isDbAvailable()) {
      try {
        const { usuarioModel: Usuario, roleModel: Role } = require('../models/indexModel');
        usuario = await Usuario.findOne({
          where: { email, ativo: true },
          include: [{ model: Role, as: 'role' }]
        });
        
        if (usuario && usuario.role) {
          usuario.role = usuario.role.nome;
        }
      } catch (dbError) {
        global.dbAvailable = false;
      }
    }
    
    if (!usuario) {
      // Notificar tentativa de login com email incorreto
      try {
        const notificacaoService = new NotificacaoService();
        const detalhesLogin = {
          ip: req.ip || req.connection.remoteAddress || 'N/A',
          userAgent: req.get('User-Agent') || 'N/A'
        };
        await notificacaoService.notificarEmailIncorreto(email, detalhesLogin);
      } catch (notificationError) {
        console.error('⚠️ Erro ao enviar notificação de email incorreto:', notificationError.message);
      }
      
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }
    
    // Verificar senha
    let senhaValida = false;
    if (isDbAvailable() && usuario.senha && usuario.senha.startsWith('$2b$')) {
      senhaValida = await bcrypt.compare(senha, usuario.senha);
    } else {
      return res.status(503).json({ erro: 'Banco de dados não disponível' });
    }
    
    if (!senhaValida) {
      // Notificar tentativa de login com senha incorreta
      try {
        const notificacaoService = new NotificacaoService();
        const detalhesLogin = {
          ip: req.ip || req.connection.remoteAddress || 'N/A',
          userAgent: req.get('User-Agent') || 'N/A'
        };
        await notificacaoService.notificarSenhaIncorreta(email, detalhesLogin);
      } catch (notificationError) {
        console.error('⚠️ Erro ao enviar notificação de senha incorreta:', notificationError.message);
      }
      
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }
    
    // Gerar token
    const token = jwt.sign(
      { 
        id: usuario.id,
        email: usuario.email,
        role: usuario.role
      },
      process.env.JWT_SECRET || 'seuSegredoSuperSecreto4321',
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role
      }
    });
    
  } catch (error) {
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Registro
exports.registro = async (req, res) => {
  try {
    const { nome, email, senha, role_id = 3 } = req.body;
    
    if (!nome || !email || !senha) {
      return res.status(400).json({ erro: 'Nome, email e senha são obrigatórios' });
    }
    
    if (isDbAvailable()) {
      const { usuarioModel: Usuario } = require('../models/indexModel');
      
      const usuarioExistente = await Usuario.findOne({ where: { email } });
      if (usuarioExistente) {
        return res.status(400).json({ erro: 'Email já cadastrado' });
      }
      
      const senhaHash = await bcrypt.hash(senha, 10);
      
      const novoUsuario = await Usuario.create({
        nome,
        email,
        senha: senhaHash,
        role_id,
        ativo: true
      });
      
      res.status(201).json({
        success: true,
        message: 'Usuário criado com sucesso',
        usuario: {
          id: novoUsuario.id,
          nome: novoUsuario.nome,
          email: novoUsuario.email,
          role_id: novoUsuario.role_id
        }
      });
      
    } else {
      res.status(201).json({
        success: true,
        message: 'Usuário criado com sucesso (modo desenvolvimento)',
        usuario: {
          id: Date.now(),
          nome,
          email,
          role_id
        }
      });
    }
    
  } catch (error) {
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Perfil
exports.perfil = async (req, res) => {
  try {
    const userId = req.user.id;
    let usuario = null;
    
    if (isDbAvailable()) {
      const { usuarioModel: Usuario, roleModel: Role } = require('../models/indexModel');
      usuario = await Usuario.findByPk(userId, {
        include: [{ model: Role, as: 'role' }]
      });
      
      if (usuario && usuario.role) {
        usuario.role = usuario.role.nome;
      }
    } else {
      return res.status(503).json({ erro: 'Banco de dados não disponível' });
    }
    
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }
    
    res.json({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      role: usuario.role,
      ativo: usuario.ativo
    });
    
  } catch (error) {
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Esqueci senha
exports.esqueciSenha = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ erro: 'Email é obrigatório' });
    }
    
    res.json({
      success: true,
      message: 'Se o email existir, você receberá instruções de recuperação'
    });
    
  } catch (error) {
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};
