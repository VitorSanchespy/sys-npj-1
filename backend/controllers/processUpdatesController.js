const AtualizacoesProcesso = require('../models/atualizacaoProcessoModels');

const createUpdate = async (req, res) => {
  try {
    const { processo_id, descricao, tipo_atualizacao, arquivos_id } = req.body;
    const usuario_id = req.user.id;

    if (!processo_id || !tipo_atualizacao) {
      return res.status(400).json({ error: 'processo_id e tipo_atualizacao são obrigatórios.' });
    }

    const update = await AtualizacoesProcesso.create({
      processo_id,
      usuario_id,
      tipo_atualizacao,
      descricao: tipo_atualizacao === 'informacao' ? descricao : null,
      arquivos_id: tipo_atualizacao === 'arquivo' ? arquivos_id : null
    });

    res.status(201).json(update);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar atualização.' });
  }
};

const listUpdates = async (req, res) => {
  try {
    const { processo_id } = req.params;
    const updates = await AtualizacoesProcesso.findAll({ where: { processo_id } });
    res.json(updates);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar atualizações.' });
  }
};

module.exports = {
  createUpdate,
  listUpdates,
};
