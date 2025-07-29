// Controlador de Usuários
const { usuariosModels: Usuario, rolesModels: Role } = require('../models/indexModels.js');
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
    
    const senhaHash = await bcrypt.hash(senha, 10);
    
    const usuario = await Usuario.create({
      nome,
      email,
      senha: senhaHash,
      role_id,
      ativo: true
    });
    
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
exports.deletarUsuario = async (req, res) => {
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

// Lista usuários por role
exports.listarUsuariosPorRole = async (req, res) => {
  try {
    const { roleName } = req.params;
    
    const usuarios = await Usuario.findAll({
      where: { ativo: true },
      include: [{
        model: Role,
        as: 'role',
        where: { nome: roleName }
      }]
    });
    
    res.json(usuarios);
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Reativar usuário
exports.reativarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await Usuario.findByPk(id);
    
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }
    
    await usuario.update({ ativo: true });
    res.json({ mensagem: 'Usuário reativado' });
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Atualizar perfil próprio
exports.atualizarPerfilProprio = async (req, res) => {
  try {
    const { nome, email } = req.body;
    const usuario = await Usuario.findByPk(req.usuario.id);
    
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }
    
    await usuario.update({ nome, email });
    res.json({ mensagem: 'Perfil atualizado' });
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Atualizar senha
exports.atualizarSenha = async (req, res) => {
  try {
    const { id } = req.params;
    const { senha } = req.body;
    
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }
    
    const senhaHash = await bcrypt.hash(senha, 10);
    await usuario.update({ senha: senhaHash });
    
    res.json({ mensagem: 'Senha atualizada' });
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Contar usuários
exports.contarUsuarios = async (req, res) => {
  try {
    const db = require('../utils/sequelize');
    
    // Contar usuários totais
    const [totalResult] = await db.query('SELECT COUNT(*) as total FROM usuarios WHERE ativo = true');
    
    // Contar usuários por tipo
    const [porTipoResult] = await db.query(`
      SELECT r.nome as tipo, COUNT(u.id) as quantidade
      FROM usuarios u 
      JOIN roles r ON u.role_id = r.id 
      WHERE u.ativo = true 
      GROUP BY r.nome
    `);
    
    const usuariosPorTipo = {};
    porTipoResult.forEach(item => {
      usuariosPorTipo[item.tipo.toLowerCase()] = parseInt(item.quantidade);
    });
    
    res.json({ 
      total: parseInt(totalResult[0].total),
      porTipo: usuariosPorTipo
    });
  } catch (error) {
    console.error('Erro ao contar usuários:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};