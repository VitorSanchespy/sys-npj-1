exports.up = function(knex) {
  return knex.schema.withSchema('npjdatabase')
    .table('usuarios', (table) => {
      table.boolean('ativo').defaultTo(true);
    });
};

exports.down = function(knex) {
  return knex.schema.withSchema('npjdatabase')
    .table('usuarios', (table) => {
      table.dropColumn('ativo');
    });
};