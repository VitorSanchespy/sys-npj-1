exports.up = async function(knex) {
  await knex.schema.table('atualizacoes', function(table) {
    table.string('tipo', 50).nullable();
    table.string('anexo', 255).nullable(); // caminho do arquivo
  });
};

exports.down = async function(knex) {
  await knex.schema.table('atualizacoes', function(table) {
    table.dropColumn('tipo');
    table.dropColumn('anexo');
  });
};
