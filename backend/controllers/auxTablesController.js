const db = require('../config/db');

// Listar, adicionar e buscar para materia_assunto, fase e diligencia

exports.listar = (table) => async (req, res) => {
  try {
    const items = await db(table).select('*');
    res.json(items);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao listar.' });
  }
};

exports.adicionar = (table) => async (req, res) => {
  try {
    const { nome } = req.body;
    if (!nome) return res.status(400).json({ erro: 'Nome é obrigatório.' });
    const [id] = await db(table).insert({ nome });
    const item = await db(table).where({ id }).first();
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao adicionar.' });
  }
};

exports.buscarPorNome = (table) => async (req, res) => {
  try {
    const { nome } = req.query;
    if (!nome) return res.status(400).json({ erro: 'Nome é obrigatório.' });
    const items = await db(table).where('nome', 'like', `%${nome}%`).select('*');
    res.json(items);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar.' });
  }
};
