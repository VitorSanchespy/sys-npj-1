// Padronização de imports
const MateriaAssunto = require('../models/materiaAssuntoModels');
const Fase = require('../models/faseModels');
const Diligencia = require('../models/diligenciaModels');
const LocalTramitacao = require('../models/localTramitacaoModels');

// Centralização de models auxiliares
const modelMap = {
  materia_assunto: MateriaAssunto,
  fase: Fase,
  diligencia: Diligencia,
  local_tramitacao: LocalTramitacao
};

exports.listar = (table) => async (req, res) => {
  try {
    const Model = modelMap[table];
    if (!Model) return res.status(400).json({ erro: 'Tabela inválida.' });
    const items = await Model.findAll();
    res.json(items);
  } catch (err) {
    // Log detalhado para debug
    console.error(`[AUX TABLES] Erro ao listar ${table}:`, err?.message, err?.stack);
    res.status(500).json({ erro: 'Erro ao listar.', detalhe: process.env.NODE_ENV === 'development' ? err.message : undefined });
  }
};

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
      console.log(`[DEBUG] Item duplicado encontrado:`, existingItem);
      return res.status(409).json({ erro: 'Item já existe.' });
    }

    const item = await Model.create({ nome });
    console.log(`[DEBUG] Item criado com sucesso:`, item);
    res.status(201).json(item);
  } catch (err) {
    console.error(`[DEBUG] Erro ao adicionar em ${table}:`, err?.message, err?.stack);
    res.status(500).json({ erro: 'Erro ao adicionar.', detalhe: process.env.NODE_ENV === 'development' ? err.message : undefined });
  }
};

exports.buscarPorNome = (table) => async (req, res) => {
  try {
    const { nome } = req.query;
    if (!nome) return res.status(400).json({ erro: 'Nome é obrigatório.' });
    const Model = modelMap[table];
    if (!Model) return res.status(400).json({ erro: 'Tabela inválida.' });
    const items = await Model.findAll({ where: { nome: { [require('sequelize').Op.like]: `%${nome}%` } } });
    res.json(items);
  } catch (err) {
    // Log detalhado para debug
    console.error(`[AUX TABLES] Erro ao buscar em ${table}:`, err?.message, err?.stack);
    res.status(500).json({ erro: 'Erro ao buscar.', detalhe: process.env.NODE_ENV === 'development' ? err.message : undefined });
  }
};
