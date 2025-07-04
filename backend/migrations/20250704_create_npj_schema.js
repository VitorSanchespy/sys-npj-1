// knex/migrations/20250704_create_npj_schema.js
exports.up = function(knex) {
  return knex.raw('CREATE DATABASE IF NOT EXISTS npjdatabase')
    .then(() => knex.raw('USE npjdatabase'))
    .then(() => knex.schema.createTable('roles', (table) => {
      table.increments('id').primary();
      table.string('nome', 50).unique().notNullable();
    }))
    .then(() => knex.schema.createTable('usuarios', (table) => {
      table.increments('id').primary();
      table.string('nome', 100).notNullable();
      table.string('email', 100).unique().notNullable();
      table.string('senha', 255).notNullable();
      table.integer('role_id').unsigned().notNullable()
           .references('id').inTable('roles')
           .onDelete('CASCADE');
      table.timestamp('criado_em').defaultTo(knex.fn.now());
    }))
    .then(() => knex.schema.createTable('processos', (table) => {
      table.increments('id').primary();
      table.string('numero_processo', 50).unique().notNullable();
      table.text('descricao');
      table.timestamp('criado_em').defaultTo(knex.fn.now());
    }))
    .then(() => knex.schema.createTable('alunos_processos', (table) => {
      table.increments('id').primary();
      table.integer('usuario_id').unsigned().notNullable()
           .references('id').inTable('usuarios')
           .onDelete('CASCADE');
      table.integer('processo_id').unsigned().notNullable()
           .references('id').inTable('processos')
           .onDelete('CASCADE');
      table.timestamp('data_atribuicao').defaultTo(knex.fn.now());
      table.unique(['usuario_id', 'processo_id']);
    }))
    .then(() => knex.schema.createTable('atualizacoes', (table) => {
      table.increments('id').primary();
      table.integer('usuario_id').unsigned().notNullable()
           .references('id').inTable('usuarios')
           .onDelete('CASCADE');
      table.integer('processo_id').unsigned().notNullable()
           .references('id').inTable('processos')
           .onDelete('CASCADE');
      table.text('descricao').notNullable();
      table.timestamp('data_atualizacao').defaultTo(knex.fn.now());
    }));
};

exports.down = function(knex) {
  return knex.raw('USE npjdatabase')
    .then(() => knex.schema
      .dropTableIfExists('atualizacoes')
      .dropTableIfExists('alunos_processos')
      .dropTableIfExists('processos')
      .dropTableIfExists('usuarios')
      .dropTableIfExists('roles')
    );
};
