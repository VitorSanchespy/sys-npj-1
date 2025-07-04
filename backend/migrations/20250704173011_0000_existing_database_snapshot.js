// migrations/XXXXXXXX_0000_existing_database_snapshot.js
exports.up = function(knex) {
  // Intencionalmente vazio - representa o estado atual do banco
  return Promise.resolve();
};

exports.down = function(knex) {
  // Não faz nada pois não queremos perder o banco existente
  return Promise.resolve();
};