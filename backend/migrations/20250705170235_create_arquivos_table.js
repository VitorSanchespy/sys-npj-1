exports.up = function(knex) {
  return knex.schema.createTable('arquivos', (table) => {
    table.increments('id').primary();
    table.string('nome').notNullable();
    table.string('caminho').notNullable();
    table.integer('tamanho').notNullable();
    table.string('tipo').notNullable();
    table.integer('processo_id').notNullable().references('id').inTable('processos');
    table.integer('usuario_id').notNullable().references('id').inTable('usuarios');
    table.timestamp('criado_em').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('arquivos');
};