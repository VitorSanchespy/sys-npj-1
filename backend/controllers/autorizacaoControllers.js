// Controlador de Autenticação
const { usuariosModels: Usuario, rolesModels: Role } = require('../models/indexModels');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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
    
    // Buscar usuário ativo por email com role
    const usuario = await Usuario.findOne({
      where: { email, ativo: [true, 1] },
      include: [{ model: Role, as: 'role' }]
    });
    
    if (!usuario) {
      // Notificar tentativa com email incorreto
      console.log('🔍 DEBUG AUTH - Email incorreto:', email);
      if (global.notificacaoService) {
        await global.notificacaoService.notificarEmailIncorreto(email, detalhesLogin);
        console.log('✅ Notificação email incorreto enviada');
      } else {
        console.log('❌ Serviço de notificação não disponível');
      }
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }
    
    // Verificar senha com bcrypt
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      // Notificar tentativa com senha incorreta
      console.log('🔍 DEBUG AUTH - Senha incorreta para:', email);
      if (global.notificacaoService) {
        await global.notificacaoService.notificarSenhaIncorreta(email, detalhesLogin);
        console.log('✅ Notificação senha incorreta enviada');
      } else {
        console.log('❌ Serviço de notificação não disponível');
      }
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
    
    // Debug para verificar os dados do usuário
    console.log('🔍 DEBUG AUTH - Dados do usuário:', {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      role_id: usuario.role_id,
      role: usuario.role?.nome
    });
    
    // Notificar login bem-sucedido
    console.log('🔍 DEBUG AUTH - Login bem-sucedido para:', usuario.nome);
    if (global.notificacaoService) {
      await global.notificacaoService.notificarLoginSucesso(usuario, detalhesLogin);
      console.log('✅ Notificação login sucesso enviada');
    } else {
      console.log('❌ Serviço de notificação não disponível');
    }
    
    res.json({
      success: true,
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role?.nome || 'Admin',
        role_id: usuario.role_id
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

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
exports.refreshToken = async (req, res) => {
  try {
    res.status(501).json({ erro: 'Não implementado - use login novamente' });
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};
