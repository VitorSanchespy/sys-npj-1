exports.up = async function(knex) {
  // 1. Adicionar telefone em usuarios
  await knex.schema.table('usuarios', function(table) {
    table.string('telefone', 20);
  });

  // 2. Adicionar local_tramitacao em processos
  await knex.schema.table('processos', function(table) {
    table.string('local_tramitacao', 100);
  });

  // 3. Adicionar sistema (Físico, PEA, PJE) em processos
  await knex.schema.table('processos', function(table) {
    table.enu('sistema', ['Físico', 'PEA', 'PJE']).defaultTo('Físico');
  });

  // 4. Criar tabela materia_assunto
  await knex.schema.createTable('materia_assunto', function(table) {
    table.increments('id').primary();
    table.string('nome', 100).notNullable().unique();
  });
  // Adicionar campo materia_assunto_id em processos
  await knex.schema.table('processos', function(table) {
    table.integer('materia_assunto_id').unsigned().references('id').inTable('materia_assunto');
  });

  // 5. Criar tabela fase
  await knex.schema.createTable('fase', function(table) {
    table.increments('id').primary();
    table.string('nome', 100).notNullable().unique();
  });
  // Adicionar campo fase_id em processos
  await knex.schema.table('processos', function(table) {
    table.integer('fase_id').unsigned().references('id').inTable('fase');
  });

  // 6. Criar tabela diligencia
  await knex.schema.createTable('diligencia', function(table) {
    table.increments('id').primary();
    table.string('nome', 100).notNullable().unique();
  });
  // Adicionar campo diligencia_id em processos
  await knex.schema.table('processos', function(table) {
    table.integer('diligencia_id').unsigned().references('id').inTable('diligencia');
  });

  // Inserir valores padrão em materia_assunto, fase e diligencia
  await knex('materia_assunto').insert([
    { nome: 'Cível' },
    { nome: 'Penal' },
    { nome: 'Trabalhista' },
    { nome: 'Administrativo' }
  ]);
  await knex('fase').insert([
    { nome: 'Inicial' },
    { nome: 'Instrução' },
    { nome: 'Sentença' },
    { nome: 'Recurso' }
  ]);
  await knex('diligencia').insert([
    { nome: 'Audiência' },
    { nome: 'Intimação' },
    { nome: 'Citação' },
    { nome: 'Perícia' }
  ]);
};

exports.down = async function(knex) {
  await knex.schema.table('usuarios', t => t.dropColumn('telefone'));
  await knex.schema.table('processos', t => t.dropColumn('local_tramitacao'));
  await knex.schema.table('processos', t => t.dropColumn('sistema'));
  await knex.schema.table('processos', t => t.dropColumn('materia_assunto_id'));
  await knex.schema.table('processos', t => t.dropColumn('fase_id'));
  await knex.schema.table('processos', t => t.dropColumn('diligencia_id'));
  await knex.schema.dropTableIfExists('materia_assunto');
  await knex.schema.dropTableIfExists('fase');
  await knex.schema.dropTableIfExists('diligencia');
};
