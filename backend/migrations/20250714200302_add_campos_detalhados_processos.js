exports.up = function(knex) {
  return knex.schema.table('processos', function(table) {
    table.string('status', 30).nullable();
    table.string('tipo_processo', 50).nullable();
    // Aqui está o segredo:
    table.integer('idusuario_responsavel').unsigned().nullable()
      .references('id').inTable('usuarios').onDelete('SET NULL');
    table.timestamp('data_encerramento').nullable();
    table.text('observacoes').nullable();
  });
};

exports.down = function(knex) {
  return knex.schema.table('processos', function(table) {
    table.dropColumn('status');
    table.dropColumn('tipo_processo');
    table.dropColumn('idusuario_responsavel');
    table.dropColumn('data_encerramento');
    table.dropColumn('observacoes');
  });
};