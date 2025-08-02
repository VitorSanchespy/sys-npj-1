// Controller de Usuários com suporte a modo mock
let dbAvailable = false;
let mockData = null;

try {
  const sequelize = require('../utils/sequelize');
  sequelize.authenticate().then(() => {
    dbAvailable = true;
  }).catch(() => {
    dbAvailable = false;
    mockData = require('../utils/mockData');
  });
} catch (error) {
  mockData = require('../utils/mockData');
  dbAvailable = false;
}

if (!mockData) {
  mockData = require('../utils/mockData');
}

// Listar usuários
exports.listarUsuarios = async (req, res) => {
  try {
    if (!dbAvailable) {
      // Usar dados mock
      return res.json(mockData.usuarios.map(u => ({
        id: u.id,
        nome: u.nome,
        email: u.email,
        role_id: u.role_id,
        role: u.role,
        ativo: u.ativo,
        data_criacao: u.data_criacao
      })));
    } else {
      // Usar banco real
      const { usuariosModels: Usuario, rolesModels: Role } = require('../models/indexModels');
      const usuarios = await Usuario.findAll({
        include: [{ model: Role, as: 'role' }],
        attributes: ['id', 'nome', 'email', 'role_id', 'ativo', 'data_criacao']
      });
      return res.json(usuarios);
    }
  } catch (error) {
    console.error('❌ Erro ao listar usuários:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Obter usuário por ID
exports.obterUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!dbAvailable) {
      const usuario = mockData.usuarios.find(u => u.id === parseInt(id));
      if (!usuario) {
        return res.status(404).json({ erro: 'Usuário não encontrado' });
      }
      return res.json(usuario);
    } else {
      const { usuariosModels: Usuario } = require('../models/indexModels');
      const usuario = await Usuario.findByPk(id);
      if (!usuario) {
        return res.status(404).json({ erro: 'Usuário não encontrado' });
      }
      return res.json(usuario);
    }
  } catch (error) {
    console.error('❌ Erro ao obter usuário:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Criar usuário
exports.criarUsuario = async (req, res) => {
  try {
    const { nome, email, senha, role_id = 3 } = req.body;
    
    if (!dbAvailable) {
      const novoUsuario = {
        id: Date.now(),
        nome,
        email,
        role_id,
        role: role_id === 1 ? 'Administrador' : role_id === 2 ? 'Professor' : 'Aluno',
        ativo: true,
        data_criacao: new Date(),
        data_atualizacao: new Date()
      };
      mockData.usuarios.push(novoUsuario);
      return res.status(201).json(novoUsuario);
    } else {
      const { usuariosModels: Usuario } = require('../models/indexModels');
      const bcrypt = require('bcrypt');
      const senhaHash = await bcrypt.hash(senha, 10);
      
      const novoUsuario = await Usuario.create({
        nome,
        email,
        senha: senhaHash,
        role_id,
        ativo: true
      });
      
      return res.status(201).json(novoUsuario);
    }
  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Atualizar usuário
exports.atualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const dadosAtualizacao = req.body;
    
    if (!dbAvailable) {
      const index = mockData.usuarios.findIndex(u => u.id === parseInt(id));
      if (index === -1) {
        return res.status(404).json({ erro: 'Usuário não encontrado' });
      }
      
      mockData.usuarios[index] = {
        ...mockData.usuarios[index],
        ...dadosAtualizacao,
        data_atualizacao: new Date()
      };
      
      return res.json(mockData.usuarios[index]);
    } else {
      const { usuariosModels: Usuario } = require('../models/indexModels');
      const usuario = await Usuario.findByPk(id);
      if (!usuario) {
        return res.status(404).json({ erro: 'Usuário não encontrado' });
      }
      
      await usuario.update(dadosAtualizacao);
      return res.json(usuario);
    }
  } catch (error) {
    console.error('❌ Erro ao atualizar usuário:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Deletar usuário
exports.deletarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!dbAvailable) {
      const index = mockData.usuarios.findIndex(u => u.id === parseInt(id));
      if (index === -1) {
        return res.status(404).json({ erro: 'Usuário não encontrado' });
      }
      
      mockData.usuarios.splice(index, 1);
      return res.json({ message: 'Usuário deletado com sucesso' });
    } else {
      const { usuariosModels: Usuario } = require('../models/indexModels');
      const usuario = await Usuario.findByPk(id);
      if (!usuario) {
        return res.status(404).json({ erro: 'Usuário não encontrado' });
      }
      
      await usuario.destroy();
      return res.json({ message: 'Usuário deletado com sucesso' });
    }
  } catch (error) {
    console.error('❌ Erro ao deletar usuário:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

module.exports = exports;
