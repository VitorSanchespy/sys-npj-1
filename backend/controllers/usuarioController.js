// Controller de Usuários
const bcrypt = require('bcrypt');
const { usuarioModel: Usuario, roleModel: Role } = require('../models/indexModel');

// Listar usuários
exports.listarUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      include: [{ model: Role, as: 'role' }],
      attributes: ['id', 'nome', 'email', 'role_id', 'ativo', 'criado_em', 'telefone']
    });
    
    res.json(usuarios);
    
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Obter usuário por ID
exports.obterUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    
    const usuario = await Usuario.findByPk(id, {
      include: [{ model: Role, as: 'role' }],
      attributes: ['id', 'nome', 'email', 'role_id', 'ativo', 'criado_em', 'telefone']
    });
    
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }
    
    res.json(usuario);
    
  } catch (error) {
    console.error('Erro ao obter usuário:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Criar usuário
exports.criarUsuario = async (req, res) => {
  try {
    const { nome, email, senha, role_id = 3, telefone } = req.body;
    
    // Validações básicas
    if (!nome || !email || !senha) {
      return res.status(400).json({ erro: 'Nome, email e senha são obrigatórios' });
    }
    
    // Verificar se email já existe
    const usuarioExistente = await Usuario.findOne({ where: { email } });
    if (usuarioExistente) {
      return res.status(400).json({ erro: 'Email já está em uso' });
    }
    
    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);
    
    // Criar usuário
    const novoUsuario = await Usuario.create({
      nome,
      email,
      senha: senhaHash,
      role_id,
      telefone,
      ativo: true
    });
    
    // Retornar sem a senha
    const { senha: _, ...usuarioSemSenha } = novoUsuario.toJSON();
    res.status(201).json(usuarioSemSenha);
    
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Atualizar usuário
exports.atualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const dadosAtualizacao = req.body;
    
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }
    
    // Se estiver atualizando senha, fazer hash
    if (dadosAtualizacao.senha) {
      dadosAtualizacao.senha = await bcrypt.hash(dadosAtualizacao.senha, 10);
    }
    
    await usuario.update(dadosAtualizacao);
    
    // Retornar sem a senha
    const { senha: _, ...usuarioAtualizado } = usuario.toJSON();
    res.json(usuarioAtualizado);
    
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Deletar usuário (desativar)
exports.deletarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }
    
    // Marcar como inativo ao invés de deletar
    await usuario.update({ ativo: false });
    res.json({ mensagem: 'Usuário desativado com sucesso' });
    
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Buscar usuários para vinculação (apenas alunos e professores ativos)
exports.buscarUsuariosParaVinculacao = async (req, res) => {
  try {
    const { search } = req.query;
    
    if (!search || search.length < 3) {
      return res.json([]);
    }
    
    const usuarios = await Usuario.findAll({
      where: {
        ativo: true,
        role_id: [2, 3], // Apenas alunos (2) e professores (3)
        [require('sequelize').Op.or]: [
          { nome: { [require('sequelize').Op.like]: `%${search}%` } },
          { email: { [require('sequelize').Op.like]: `%${search}%` } }
        ]
      },
      include: [{ model: Role, as: 'role' }],
      attributes: ['id', 'nome', 'email', 'role_id'],
      order: [['nome', 'ASC']],
      limit: 10
    });
    
    res.json(usuarios);
    
  } catch (error) {
    console.error('Erro ao buscar usuários para vinculação:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};
