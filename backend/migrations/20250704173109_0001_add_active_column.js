exports.up = async function(knex) {
  const hasColumn = await knex.schema.hasColumn('usuarios', 'ativo');
  
  if (!hasColumn) {
    return knex.schema.table('usuarios', table => {
      table.boolean('ativo').defaultTo(true);
    });
  }
  console.log('Coluna "ativo" já existe - pulando');
};

exports.down = function(knex) {
  return knex.schema.table('usuarios', table => {
    table.dropColumn('ativo');
  });
};