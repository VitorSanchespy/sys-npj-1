// Controlador de Usuários
const { usuariosModels: Usuario, rolesModels: Role } = require('../models/indexModels');
const bcrypt = require('bcrypt');

// Lista usuários ativos
exports.listarUsuarios = async (req, res) => {
  try {
    // Buscar apenas usuários ativos com suas roles
    const usuarios = await Usuario.findAll({
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

// Lista usuários para vinculação com busca
exports.listarUsuariosParaVinculacao = async (req, res) => {
  try {
    const { search, page = 1 } = req.query;
    const limit = 10;
    const offset = (page - 1) * limit;
    
    let whereClause = { ativo: true };
    
    // Adicionar filtro de busca se fornecido
    if (search) {
      whereClause = {
        ...whereClause,
        [require('sequelize').Op.or]: [
          { nome: { [require('sequelize').Op.like]: `%${search}%` } },
          { email: { [require('sequelize').Op.like]: `%${search}%` } }
        ]
      };
    }
    
    const { count, rows: usuarios } = await Usuario.findAndCountAll({
      where: whereClause,
      include: [{ model: Role, as: 'role' }],
      limit,
      offset,
      order: [['nome', 'ASC']]
    });
    
    res.json({
      usuarios,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
        limit
      }
    });
  } catch (error) {
    console.error('Erro ao listar usuários para vinculação:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Aliases para compatibilidade com código existente
exports.listarUsuariosDebug = exports.listarUsuarios;

// Lista usuários por role
exports.listarUsuariosPorRole = async (req, res) => {
  try {
    const { roleName } = req.params;
    
    const usuarios = await Usuario.findAll({
      include: [{
        model: Role,
        as: 'role',
        where: { nome: roleName }
      }],
      where: { ativo: true },
      order: [['nome', 'ASC']]
    });
    
    res.json(usuarios);
  } catch (error) {
    console.error('Erro ao listar usuários por role:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Reativar usuário
exports.reativarUsuarios = async (req, res) => {
  try {
    const { id } = req.params;
    
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }
    
    await usuario.update({ ativo: true });
    res.json({ mensagem: 'Usuário reativado com sucesso' });
  } catch (error) {
    console.error('Erro ao reativar usuário:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Atualizar senha do usuário
exports.atualizarSenhaUsuarios = async (req, res) => {
  try {
    const { id } = req.params;
    const { novaSenha } = req.body;
    
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }
    
    const senhaHash = await bcrypt.hash(novaSenha, 10);
    await usuario.update({ senha: senhaHash });
    
    res.json({ mensagem: 'Senha atualizada com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar senha:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Soft delete usuário
exports.softDeleteUsuarios = async (req, res) => {
  try {
    const { id } = req.params;
    
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }
    
    await usuario.update({ ativo: false });
    res.json({ mensagem: 'Usuário desativado com sucesso' });
  } catch (error) {
    console.error('Erro ao desativar usuário:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Contar usuários para dashboard
exports.contarUsuariosDashboard = async (req, res) => {
  try {
    const total = await Usuario.count({ where: { ativo: true } });
    const totalPorRole = await Usuario.findAll({
      attributes: [
        [require('sequelize').fn('COUNT', require('sequelize').col('usuarios.id')), 'count']
      ],
      include: [{
        model: Role,
        as: 'role',
        attributes: ['nome']
      }],
      where: { ativo: true },
      group: ['role.id', 'role.nome']
    });
    
    res.json({
      total,
      porRole: totalPorRole.map(item => ({
        role: item.role.nome,
        count: parseInt(item.dataValues.count)
      }))
    });
  } catch (error) {
    console.error('Erro ao contar usuários:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};


