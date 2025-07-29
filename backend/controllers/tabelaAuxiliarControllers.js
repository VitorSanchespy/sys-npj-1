// Controlador para Tabelas Auxiliares
const {
  materiaAssuntoModels: MateriaAssunto,
  faseModels: Fase,
  diligenciaModels: Diligencia,
  localTramitacaoModels: LocalTramitacao
} = require('../models/indexModels');

// Centralização de models auxiliares
const modelMap = {
  materia_assunto: MateriaAssunto,
  fase: Fase,
  diligencia: Diligencia,
  local_tramitacao: LocalTramitacao
};

// Listar tabelas auxiliares
exports.listar = (table) => async (req, res) => {
  try {
    const Model = modelMap[table];
    if (!Model) return res.status(400).json({ erro: 'Tabela inválida.' });
    const items = await Model.findAll();
    res.json(items);
  } catch (err) {
    console.error(`[AUX TABLES] Erro ao listar ${table}:`, err?.message, err?.stack);
    res.status(500).json({ erro: 'Erro ao listar.', detalhe: process.env.NODE_ENV === 'development' ? err.message : undefined });
  }
};

// Adicionar item a uma tabela auxiliar
exports.adicionar = (table) => async (req, res) => {
  try {
    const { nome } = req.body;
    console.log(`[DEBUG] Dados recebidos para adicionar:`, { table, nome });

    if (!nome) {
      console.log(`[DEBUG] Nome não fornecido.`);
      return res.status(400).json({ erro: 'Nome é obrigatório.' });
    }

    const Model = modelMap[table];
    if (!Model) {
      console.log(`[DEBUG] Tabela inválida:`, table);
      return res.status(400).json({ erro: 'Tabela inválida.' });
    }

    // Check for duplicate entries
    const existingItem = await Model.findOne({ where: { nome } });
    if (existingItem) {
      console.log(`[DEBUG] Item já existe:`, nome);
      return res.status(400).json({ erro: 'Item já existe.' });
    }

    const newItem = await Model.create({ nome });
    console.log(`[DEBUG] Item criado com sucesso:`, newItem);
    res.status(201).json(newItem);
  } catch (err) {
    console.error(`[AUX TABLES] Erro ao adicionar item em ${table}:`, err?.message, err?.stack);
    res.status(500).json({ erro: 'Erro ao adicionar item.', detalhe: process.env.NODE_ENV === 'development' ? err.message : undefined });
  }
};

// Buscar por nome
exports.buscarPorNome = (table) => async (req, res) => {
  try {
    const { nome } = req.query;
    const Model = modelMap[table];
    if (!Model) return res.status(400).json({ erro: 'Tabela inválida.' });
    
    const items = await Model.findAll({
      where: { nome: { [require('sequelize').Op.like]: `%${nome}%` } }
    });
    res.json(items);
  } catch (err) {
    console.error(`[AUX TABLES] Erro ao buscar em ${table}:`, err?.message, err?.stack);
    res.status(500).json({ erro: 'Erro ao buscar.', detalhe: process.env.NODE_ENV === 'development' ? err.message : undefined });
  }
};

// Funções específicas para cada tabela
exports.listarMaterias = async (req, res) => {
  try {
    const Model = modelMap['materia_assunto'];
    const items = await Model.findAll();
    res.json(items);
  } catch (err) {
    console.error('[AUX TABLES] Erro ao listar matérias:', err?.message);
    res.status(500).json({ erro: 'Erro ao listar matérias.' });
  }
};

exports.listarFases = async (req, res) => {
  try {
    const Model = modelMap['fase'];
    const items = await Model.findAll();
    res.json(items);
  } catch (err) {
    console.error('[AUX TABLES] Erro ao listar fases:', err?.message);
    res.status(500).json({ erro: 'Erro ao listar fases.' });
  }
};

exports.listarDiligencias = async (req, res) => {
  try {
    const Model = modelMap['diligencia'];
    const items = await Model.findAll();
    res.json(items);
  } catch (err) {
    console.error('[AUX TABLES] Erro ao listar diligências:', err?.message);
    res.status(500).json({ erro: 'Erro ao listar diligências.' });
  }
};

exports.listarLocais = async (req, res) => {
  try {
    const Model = modelMap['local_tramitacao'];
    const items = await Model.findAll();
    res.json(items);
  } catch (err) {
    console.error('[AUX TABLES] Erro ao listar locais:', err?.message);
    res.status(500).json({ erro: 'Erro ao listar locais.' });
  }
};
