// migrations/XXXXXXXX_0001_add_active_column.js
exports.up = function(knex) {
  return knex.schema.alterTable('usuarios', (table) => {
    table.boolean('ativo').defaultTo(true);
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('usuarios', (table) => {
    table.dropColumn('ativo');
  });
};