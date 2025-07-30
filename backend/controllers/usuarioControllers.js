// Controlador de Usuários
const { usuariosModels: Usuario, rolesModels: Role } = require('../models/indexModels');
const bcrypt = require('bcrypt');

// Lista usuários ativos
exports.listarUsuarios = async (req, res) => {
  try {
    // Buscar apenas usuários ativos com suas roles
    const usuarios = await Usuario.findAll({
      where: { ativo: true },
      include: [{ model: Role, as: 'role' }]
    });
    res.json(usuarios);
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Cria novo usuário
exports.criarUsuario = async (req, res) => {
  try {
    const { nome, email, senha, role_id } = req.body;
    const usuarioLogado = req.usuario;
    
    const senhaHash = await bcrypt.hash(senha, 10);
    
    const usuario = await Usuario.create({
      nome,
      email,
      senha: senhaHash,
      role_id,
      ativo: true
    });
    
    // Notificar usuário criado
    if (global.notificacaoService) {
      await global.notificacaoService.notificarUsuarioCriado(usuario, usuarioLogado);
    }
    
    res.status(201).json({ id: usuario.id, nome, email, role_id });
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Atualiza usuário
exports.atualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, role_id, ativo } = req.body;
    
    // Verificar se usuário existe
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }
    
    // Atualizar dados do usuário
    await usuario.update({ nome, email, role_id, ativo });
    res.json({ mensagem: 'Usuário atualizado' });
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Desativa usuário (soft delete)
exports.excluirUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await Usuario.findByPk(id);
    
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }
    
    // Desativar usuário em vez de excluir
    await usuario.update({ ativo: false });
    res.json({ mensagem: 'Usuário desativado' });
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Busca usuário por ID
exports.buscarUsuarioPorId = async (req, res) => {
  try {
    // Buscar usuário por ID com role incluída
    const usuario = await Usuario.findByPk(req.params.id, {
      include: [{ model: Role, as: 'role' }]
    });
    
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }
    
    res.json(usuario);
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Obtém perfil do usuário logado
exports.obterPerfil = async (req, res) => {
  try {
    // Buscar perfil do usuário autenticado
    const usuario = await Usuario.findByPk(req.usuario.id, {
      include: [{ model: Role, as: 'role' }]
    });
    res.json(usuario);
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Aliases para compatibilidade com código existente
exports.listarUsuariosDebug = exports.listarUsuarios;
exports.listarUsuariosParaVinculacao = exports.listarUsuarios;


