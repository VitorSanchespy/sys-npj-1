'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Popula tabela materia_assunto
    const assuntos = [
      { nome: 'Cível' },
      { nome: 'Penal' },
      { nome: 'Trabalhista' },
      { nome: 'Administrativo' }
    ];
    for (const assunto of assuntos) {
      const [exists] = await queryInterface.sequelize.query(
        `SELECT id FROM materia_assunto WHERE nome = '${assunto.nome}' LIMIT 1;`,
        { type: Sequelize.QueryTypes.SELECT }
      );
      if (!exists) {
        await queryInterface.bulkInsert('materia_assunto', [assunto]);
      }
    }
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('materia_assunto', null, {});
  }
};
