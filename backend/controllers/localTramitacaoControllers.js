const { localTramitacaoModels: LocalTramitacao } = require('../models/indexModels');

// Controlador para obter todos os locais de tramitação
const getLocalTramitacoes = async (req, res) => {
  try {
    const locais = await LocalTramitacao.findAll();
    res.status(200).json(locais);
  } catch (error) {
    console.error('Erro ao buscar locais de tramitação:', error);
    res.status(500).json({ error: 'Erro ao buscar locais de tramitação' });
  }
};

// Controlador para adicionar um novo local de tramitação
const addLocalTramitacao = async (req, res) => {
  try {
    const { nome } = req.body;
    if (!nome) {
      return res.status(400).json({ error: 'Nome é obrigatório' });
    }

    const local = await LocalTramitacao.create({ nome });
    res.status(201).json(local);
  } catch (error) {
    console.error('Erro ao adicionar local de tramitação:', error);
    res.status(500).json({ error: 'Erro ao adicionar local de tramitação' });
  }
};

module.exports = {
  getLocalTramitacoes,
  addLocalTramitacao,
};
