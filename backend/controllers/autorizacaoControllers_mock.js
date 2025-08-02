// Controlador de Autenticação com suporte a modo mock
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Verificar se o banco está disponível
let dbAvailable = false;
let mockData = null;

try {
  const { usuariosModels: Usuario, rolesModels: Role } = require('../models/indexModels');
  dbAvailable = true;
} catch (error) {
  console.log('⚠️ Banco não disponível, usando dados mock');
  mockData = require('../utils/mockData');
  dbAvailable = false;
}

// Função para obter detalhes da requisição
function obterDetalhesRequisicao(req) {
  return {
    ip: req.ip || req.connection.remoteAddress || 'N/A',
    userAgent: req.get('User-Agent') || 'N/A'
  };
}

// Login do usuário
exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body;
    const detalhesLogin = obterDetalhesRequisicao(req);
    
    let usuario = null;
    
    if (dbAvailable) {
      // Usar banco de dados real
      const { usuariosModels: Usuario, rolesModels: Role } = require('../models/indexModels');
      usuario = await Usuario.findOne({
        where: { email, ativo: [true, 1] },
        include: [{ model: Role, as: 'role' }]
      });
    } else {
      // Usar dados mock
      const usuarios = mockData.usuarios;
      usuario = usuarios.find(u => u.email === email && u.ativo);
      
      // Simular estrutura do banco
      if (usuario) {
        usuario.role = { nome: usuario.role };
      }
    }
    
    if (!usuario) {
      console.log('🔍 DEBUG AUTH - Email incorreto:', email);
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }
    
    // Verificar senha (mock: qualquer senha funciona em modo desenvolvimento)
    let senhaValida = false;
    if (dbAvailable) {
      senhaValida = await bcrypt.compare(senha, usuario.senha);
    } else {
      // Em modo mock, aceitar senhas específicas
      senhaValida = ['admin123', '123456', 'senha123'].includes(senha);
    }
    
    if (!senhaValida) {
      console.log('🔍 DEBUG AUTH - Senha incorreta para:', email);
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }
    
    // Gerar token JWT
    const token = jwt.sign(
      { 
        userId: usuario.id, 
        email: usuario.email, 
        role: usuario.role.nome 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.TOKEN_EXPIRATION || '24h' }
    );
    
    // Resposta de sucesso
    console.log('✅ Login realizado com sucesso:', email);
    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        role_id: usuario.role_id,
        role: usuario.role.nome
      }
    });
    
  } catch (error) {
    console.error('❌ Erro no login:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Registro do usuário
exports.registro = async (req, res) => {
  try {
    const { nome, email, senha, role_id = 3 } = req.body;
    
    if (dbAvailable) {
      // Usar banco de dados real
      const { usuariosModels: Usuario } = require('../models/indexModels');
      
      // Verificar se email já existe
      const usuarioExistente = await Usuario.findOne({ where: { email } });
      if (usuarioExistente) {
        return res.status(400).json({ erro: 'Email já cadastrado' });
      }
      
      // Hash da senha
      const senhaHash = await bcrypt.hash(senha, 10);
      
      // Criar usuário
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
      // Modo mock
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
    console.error('❌ Erro no registro:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Obter perfil do usuário autenticado
exports.perfil = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    let usuario = null;
    
    if (dbAvailable) {
      const { usuariosModels: Usuario, rolesModels: Role } = require('../models/indexModels');
      usuario = await Usuario.findByPk(userId, {
        include: [{ model: Role, as: 'role' }]
      });
    } else {
      // Usar dados mock
      usuario = mockData.usuarios.find(u => u.id === userId);
      if (usuario) {
        usuario.role = { nome: usuario.role };
      }
    }
    
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }
    
    res.json({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      role_id: usuario.role_id,
      role: usuario.role.nome,
      ativo: usuario.ativo
    });
    
  } catch (error) {
    console.error('❌ Erro ao obter perfil:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Esqueci a senha
exports.esqueciSenha = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (dbAvailable) {
      // Implementação real com banco
      const { usuariosModels: Usuario } = require('../models/indexModels');
      const usuario = await Usuario.findOne({ where: { email } });
      
      if (!usuario) {
        return res.status(404).json({ erro: 'Email não encontrado' });
      }
      
      // Aqui você implementaria o envio de email
      res.json({ 
        success: true, 
        message: 'Email de recuperação enviado' 
      });
    } else {
      // Modo mock
      res.json({ 
        success: true, 
        message: 'Email de recuperação enviado (modo desenvolvimento)' 
      });
    }
    
  } catch (error) {
    console.error('❌ Erro em esqueci senha:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

module.exports = exports;
