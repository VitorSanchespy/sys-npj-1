// Controller de Usuários simplificado
const bcrypt = require('bcrypt');

// Função utilitária para verificar disponibilidade do banco
function isDbAvailable() {
  return global.dbAvailable || false;
}

// Dados mock para desenvolvimento
const getMockData = () => {
  try {
    return require('../utils/mockData');
  } catch (error) {
    return {
      usuarios: [
        {
          id: 1,
          nome: 'Admin Sistema',
          email: 'admin@teste.com',
          role: 'Admin',
          ativo: true,
          data_criacao: new Date().toISOString()
        },
        {
          id: 2,
          nome: 'Professor Teste',
          email: 'professor@teste.com',
          role: 'Professor',
          ativo: true,
          data_criacao: new Date().toISOString()
        },
        {
          id: 3,
          nome: 'Aluno Teste',
          email: 'aluno@teste.com',
          role: 'Aluno',
          ativo: true,
          data_criacao: new Date().toISOString()
        }
      ]
    };
  }
};

// Listar usuários
exports.listarUsuarios = async (req, res) => {
  try {
    let usuarios = [];
    
    if (isDbAvailable()) {
      const { usuarioModel: Usuario, roleModel: Role } = require('../models/indexModel');
      usuarios = await Usuario.findAll({
        include: [{ model: Role, as: 'role' }],
        attributes: ['id', 'nome', 'email', 'role_id', 'ativo', 'data_criacao']
      });
    } else {
      const mockData = getMockData();
      usuarios = mockData.usuarios;
    }
    
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
    let usuario = null;
    
    if (isDbAvailable()) {
      const { usuarioModel: Usuario, roleModel: Role } = require('../models/indexModel');
      usuario = await Usuario.findByPk(id, {
        include: [{ model: Role, as: 'role' }]
      });
    } else {
      const mockData = getMockData();
      usuario = mockData.usuarios.find(u => u.id == id);
    }
    
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
    const { nome, email, senha, role_id = 3 } = req.body;
    
    if (!nome || !email || !senha) {
      return res.status(400).json({ erro: 'Nome, email e senha são obrigatórios' });
    }
    
    if (isDbAvailable()) {
      const { usuarioModel: Usuario } = require('../models/indexModel');
      
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
        id: novoUsuario.id,
        nome: novoUsuario.nome,
        email: novoUsuario.email,
        role_id: novoUsuario.role_id,
        ativo: novoUsuario.ativo
      });
      
    } else {
      // Modo mock
      const novoUsuario = {
        id: Date.now(),
        nome,
        email,
        role_id,
        ativo: true,
        data_criacao: new Date().toISOString()
      };
      
      res.status(201).json(novoUsuario);
    }
    
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
    
    if (isDbAvailable()) {
      const { usuarioModel: Usuario } = require('../models/indexModel');
      
      const usuario = await Usuario.findByPk(id);
      if (!usuario) {
        return res.status(404).json({ erro: 'Usuário não encontrado' });
      }
      
      // Se estiver atualizando senha, fazer hash
      if (dadosAtualizacao.senha) {
        dadosAtualizacao.senha = await bcrypt.hash(dadosAtualizacao.senha, 10);
      }
      
      await usuario.update(dadosAtualizacao);
      res.json(usuario);
      
    } else {
      // Modo mock
      res.json({
        id: parseInt(id),
        ...dadosAtualizacao,
        atualizado_em: new Date().toISOString()
      });
    }
    
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Deletar usuário
exports.deletarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (isDbAvailable()) {
      const { usuarioModel: Usuario } = require('../models/indexModel');
      
      const usuario = await Usuario.findByPk(id);
      if (!usuario) {
        return res.status(404).json({ erro: 'Usuário não encontrado' });
      }
      
      // Marcar como inativo ao invés de deletar
      await usuario.update({ ativo: false });
      res.json({ message: 'Usuário desativado com sucesso' });
      
    } else {
      // Modo mock
      res.json({ message: 'Usuário desativado com sucesso (modo desenvolvimento)' });
    }
    
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};
