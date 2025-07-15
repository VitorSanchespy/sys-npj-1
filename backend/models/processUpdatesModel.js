const db = require('../config/db');

const createUpdate = async ({ processo_id, user_id, descricao }) => {
  const [id] = await db('process_updates').insert({ processo_id, user_id, descricao });
  return getUpdateById(id);
};

const getUpdatesByProcess = async (processo_id) => {
  return db('process_updates')
    .join('usuarios', 'process_updates.user_id', 'usuarios.id')
    .select(
      'process_updates.*',
      'usuarios.nome as usuario_nome',
      'usuarios.email as usuario_email'
    )
    .where('process_updates.processo_id', processo_id)
    .orderBy('process_updates.created_at', 'desc');
};

const getUpdateById = async (id) => {
  return db('process_updates')
    .join('usuarios', 'process_updates.user_id', 'usuarios.id')
    .select(
      'process_updates.*',
      'usuarios.nome as usuario_nome',
      'usuarios.email as usuario_email'
    )
    .where('process_updates.id', id)
    .first();
};

module.exports = {
  createUpdate,
  getUpdatesByProcess,
  getUpdateById,
};
