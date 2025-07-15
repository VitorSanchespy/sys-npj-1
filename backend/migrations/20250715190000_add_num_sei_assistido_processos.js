exports.up = async function(knex) {
  await knex.schema.table('processos', function(table) {
    table.string('num_processo_sei', 100);
    table.string('assistido', 100);
  });
};

exports.down = async function(knex) {
  await knex.schema.table('processos', function(table) {
    table.dropColumn('num_processo_sei');
    table.dropColumn('assistido');
  });
};
