exports.seed = function(knex) {
  return knex('roles').del()
    .then(() => {
      return knex('roles').insert([
        { nome: 'Admin' },
        { nome: 'Aluno' },
        { nome: 'Professor' }
      ]);
    });
};