const MateriaAssunto = require('../models/materiaAssuntoModel');
const Fase = require('../models/faseModel');
const Diligencia = require('../models/diligenciaModel');
const LocalTramitacao = require('../models/localTramitacaoModel');
const { validationResult } = require('express-validator');

// Função auxiliar para verificar se é Admin
const isAdmin = (user) => {
  const userRole = user.role?.nome || user.role;
  return userRole === 'Admin';
};

// MATÉRIA/ASSUNTO
exports.listarMaterias = async function(req, res) {
  try {
    const materias = await MateriaAssunto.findAll({
      order: [['nome', 'ASC']]
    });
    res.json({ success: true, data: materias });
  } catch (error) {
    console.error('❌ Erro ao listar matérias:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
};

exports.criarMateria = async function(req, res) {
  try {
    // Verificar se é Admin
    if (!isAdmin(req.user)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Apenas administradores podem criar matérias/assuntos' 
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Dados inválidos', errors: errors.array() });
    }

    const { nome, descricao } = req.body;
    
    // Verificar se já existe
    const existente = await MateriaAssunto.findOne({ where: { nome } });
    if (existente) {
      return res.status(409).json({ success: false, message: 'Matéria/Assunto já existe' });
    }
    
    const materia = await MateriaAssunto.create({ nome, descricao });
    res.status(201).json({ success: true, data: materia, message: 'Matéria/Assunto criada com sucesso' });
  } catch (error) {
    console.error('❌ Erro ao criar matéria:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
};

exports.excluirMateria = async function(req, res) {
  try {
    // Verificar se é Admin
    if (!isAdmin(req.user)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Apenas administradores podem excluir matérias/assuntos' 
      });
    }

    const { id } = req.params;
    const materia = await MateriaAssunto.findByPk(id);
    
    if (!materia) {
      return res.status(404).json({ success: false, message: 'Matéria/Assunto não encontrada' });
    }
    
    await materia.destroy();
    res.json({ success: true, message: 'Matéria/Assunto excluída com sucesso' });
  } catch (error) {
    console.error('❌ Erro ao excluir matéria:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
};

// FASE
exports.listarFases = async function(req, res) {
  try {
    const fases = await Fase.findAll({
      order: [['nome', 'ASC']]
    });
    res.json({ success: true, data: fases });
  } catch (error) {
    console.error('❌ Erro ao listar fases:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
};

exports.criarFase = async function(req, res) {
  try {
    // Verificar se é Admin
    if (!isAdmin(req.user)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Apenas administradores podem criar fases' 
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Dados inválidos', errors: errors.array() });
    }

    const { nome, descricao } = req.body;
    
    // Verificar se já existe
    const existente = await Fase.findOne({ where: { nome } });
    if (existente) {
      return res.status(409).json({ success: false, message: 'Fase já existe' });
    }
    
    const fase = await Fase.create({ nome, descricao });
    res.status(201).json({ success: true, data: fase, message: 'Fase criada com sucesso' });
  } catch (error) {
    console.error('❌ Erro ao criar fase:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
};

exports.excluirFase = async function(req, res) {
  try {
    // Verificar se é Admin
    if (!isAdmin(req.user)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Apenas administradores podem excluir fases' 
      });
    }

    const { id } = req.params;
    const fase = await Fase.findByPk(id);
    
    if (!fase) {
      return res.status(404).json({ success: false, message: 'Fase não encontrada' });
    }
    
    await fase.destroy();
    res.json({ success: true, message: 'Fase excluída com sucesso' });
  } catch (error) {
    console.error('❌ Erro ao excluir fase:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
};

// DILIGÊNCIA
exports.listarDiligencias = async function(req, res) {
  try {
    const diligencias = await Diligencia.findAll({
      order: [['nome', 'ASC']]
    });
    res.json({ success: true, data: diligencias });
  } catch (error) {
    console.error('❌ Erro ao listar diligências:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
};

exports.criarDiligencia = async function(req, res) {
  try {
    // Verificar se é Admin
    if (!isAdmin(req.user)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Apenas administradores podem criar diligências' 
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Dados inválidos', errors: errors.array() });
    }

    const { nome, descricao } = req.body;
    
    // Verificar se já existe
    const existente = await Diligencia.findOne({ where: { nome } });
    if (existente) {
      return res.status(409).json({ success: false, message: 'Diligência já existe' });
    }
    
    const diligencia = await Diligencia.create({ nome, descricao });
    res.status(201).json({ success: true, data: diligencia, message: 'Diligência criada com sucesso' });
  } catch (error) {
    console.error('❌ Erro ao criar diligência:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
};

exports.excluirDiligencia = async function(req, res) {
  try {
    // Verificar se é Admin
    if (!isAdmin(req.user)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Apenas administradores podem excluir diligências' 
      });
    }

    const { id } = req.params;
    const diligencia = await Diligencia.findByPk(id);
    
    if (!diligencia) {
      return res.status(404).json({ success: false, message: 'Diligência não encontrada' });
    }
    
    await diligencia.destroy();
    res.json({ success: true, message: 'Diligência excluída com sucesso' });
  } catch (error) {
    console.error('❌ Erro ao excluir diligência:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
};

// LOCAL DE TRAMITAÇÃO
exports.listarLocaisTramitacao = async function(req, res) {
  try {
    const locais = await LocalTramitacao.findAll({
      order: [['nome', 'ASC']]
    });
    res.json({ success: true, data: locais });
  } catch (error) {
    console.error('❌ Erro ao listar locais de tramitação:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
};

exports.criarLocalTramitacao = async function(req, res) {
  try {
    // Verificar se é Admin
    if (!isAdmin(req.user)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Apenas administradores podem criar locais de tramitação' 
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Dados inválidos', errors: errors.array() });
    }

    const { nome, descricao } = req.body;
    
    // Verificar se já existe
    const existente = await LocalTramitacao.findOne({ where: { nome } });
    if (existente) {
      return res.status(409).json({ success: false, message: 'Local de tramitação já existe' });
    }
    
    const local = await LocalTramitacao.create({ nome, descricao });
    res.status(201).json({ success: true, data: local, message: 'Local de tramitação criado com sucesso' });
  } catch (error) {
    console.error('❌ Erro ao criar local de tramitação:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
};

exports.excluirLocalTramitacao = async function(req, res) {
  try {
    // Verificar se é Admin
    if (!isAdmin(req.user)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Apenas administradores podem excluir locais de tramitação' 
      });
    }

    const { id } = req.params;
    const local = await LocalTramitacao.findByPk(id);
    
    if (!local) {
      return res.status(404).json({ success: false, message: 'Local de tramitação não encontrado' });
    }
    
    await local.destroy();
    res.json({ success: true, message: 'Local de tramitação excluído com sucesso' });
  } catch (error) {
    console.error('❌ Erro ao excluir local de tramitação:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
};
