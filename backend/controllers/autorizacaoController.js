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
          // Manter role_id do usuário e adicionar role.nome
          const roleNome = usuario.role.nome;
          usuario.role = roleNome;
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
    
    // Gerar token principal e refresh token
    const token = jwt.sign(
      { 
        id: usuario.id,
        email: usuario.email,
        role: usuario.role,
        role_id: usuario.role_id
      },
      process.env.JWT_SECRET || 'seuSegredoSuperSecreto4321',
      { expiresIn: '24h' }
    );

    // Gerar refresh token
    const refreshToken = jwt.sign(
      { 
        id: usuario.id,
        type: 'refresh'
      },
      process.env.JWT_REFRESH_SECRET || 'refreshSecretoSuperSecreto9876',
      { expiresIn: '7d' }
    );

    // Salvar refresh token no banco (se disponível)
    if (isDbAvailable()) {
      try {
        const { refreshTokenModel: RefreshToken } = require('../models/indexModel');
        await RefreshToken.create({
          token: refreshToken,
          usuario_id: usuario.id,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 dias
        });
      } catch (error) {
        // Error saving refresh token - non-critical
      }
    }

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      token,
      refreshToken,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role,
        role_id: usuario.role_id
      }
    });
    
  } catch (error) {
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Registro - sempre cria usuários com role "Aluno" por padrão
exports.registro = async (req, res) => {
  try {
    const { nome, email, senha, telefone, role_id = 3 } = req.body; // Padrão: role_id = 3 (Aluno)
    
    if (!nome || !email || !senha) {
      return res.status(400).json({ erro: 'Nome, email e senha são obrigatórios' });
    }
    
    // Validação de email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ erro: 'Formato de email inválido' });
    }
    
    // Validação de senha
    if (senha.length < 6) {
      return res.status(400).json({ erro: 'Senha deve ter pelo menos 6 caracteres' });
    }
    
    if (isDbAvailable()) {
      const { usuarioModel: Usuario } = require('../models/indexModel');
      
      const usuarioExistente = await Usuario.findOne({ where: { email } });
      if (usuarioExistente) {
        return res.status(400).json({ erro: 'Este email já está cadastrado no sistema' });
      }
      
      const senhaHash = await bcrypt.hash(senha, 10);
      
      const novoUsuario = await Usuario.create({
        nome,
        email,
        senha: senhaHash,
        telefone,
        role_id: 3, // Forçar sempre como Aluno (role_id = 3)
        ativo: true
      });
      
      res.status(201).json({
        success: true,
        message: 'Usuário criado com sucesso como Aluno',
        usuario: {
          id: novoUsuario.id,
          nome: novoUsuario.nome,
          email: novoUsuario.email,
          role_id: novoUsuario.role_id,
          role: 'Aluno'
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
          role_id: 3 // Forçar como Aluno mesmo em modo desenvolvimento
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
      telefone: usuario.telefone,
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

// Refresh Token
exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ erro: 'Refresh token é obrigatório' });
    }
    
    // Verificar o refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'refreshSecretoSuperSecreto9876');
    } catch (jwtError) {
      return res.status(401).json({ erro: 'Refresh token inválido ou expirado' });
    }
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json({ erro: 'Token inválido' });
    }
    
    // Verificar se o refresh token existe no banco e ainda é válido
    if (isDbAvailable()) {
      try {
        const { refreshTokenModel: RefreshToken } = require('../models/indexModel');
        const storedToken = await RefreshToken.findOne({
          where: { 
            token: refreshToken,
            usuario_id: decoded.id
          }
        });
        
        if (!storedToken || new Date() > storedToken.expires_at) {
          return res.status(401).json({ erro: 'Refresh token expirado ou inválido' });
        }
      } catch (error) {
        console.error('⚠️ Erro ao verificar refresh token no banco:', error.message);
      }
    }
    
    // Buscar usuário
    let usuario = null;
    if (isDbAvailable()) {
      const { usuarioModel: Usuario, roleModel: Role } = require('../models/indexModel');
      usuario = await Usuario.findOne({
        where: { id: decoded.id, ativo: true },
        include: [{ model: Role, as: 'role' }]
      });
      
      if (usuario && usuario.role) {
        usuario.role = usuario.role.nome;
      }
    }
    
    if (!usuario) {
      return res.status(401).json({ erro: 'Usuário não encontrado ou inativo' });
    }
    
    // Gerar novo token
    const newToken = jwt.sign(
      { 
        id: usuario.id,
        email: usuario.email,
        role: usuario.role,
        role_id: usuario.role_id
      },
      process.env.JWT_SECRET || 'seuSegredoSuperSecreto4321',
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      message: 'Token renovado com sucesso',
      token: newToken
    });
    
  } catch (error) {
    console.error('Erro ao renovar token:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};
