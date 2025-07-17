'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // bulkDelete removido para evitar erro de FK
    const assuntos = ['Cível', 'Penal', 'Trabalhista', 'Administrativo'];
    for (const nome of assuntos) {
      const [exists] = await queryInterface.sequelize.query(
        `SELECT id FROM materia_assunto WHERE nome = '${nome}' LIMIT 1;`,
        { type: Sequelize.QueryTypes.SELECT }
      );
      if (!exists) {
        await queryInterface.bulkInsert('materia_assunto', [{ nome }]);
      }
    }
  },
  down: async (queryInterface, Sequelize) => {
    // bulkDelete removido para evitar erro de FK
  }
};
