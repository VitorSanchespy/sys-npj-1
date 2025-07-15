const processUpdatesModel = require('../models/processUpdatesModel');

const createUpdate = async (req, res) => {
  try {
    const { processo_id, descricao } = req.body;
    const user_id = req.user.id;
    if (!processo_id || !descricao) {
      return res.status(400).json({ error: 'processo_id e descricao são obrigatórios.' });
    }
    const update = await processUpdatesModel.createUpdate({ processo_id, user_id, descricao });
    res.status(201).json(update);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar atualização.' });
  }
};

const listUpdates = async (req, res) => {
  try {
    const { processo_id } = req.params;
    const updates = await processUpdatesModel.getUpdatesByProcess(processo_id);
    res.json(updates);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar atualizações.' });
  }
};

module.exports = {
  createUpdate,
  listUpdates,
};
