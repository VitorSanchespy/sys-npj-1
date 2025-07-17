'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // bulkDelete removido para evitar erro de FK
    const diligencias = ['Intimação', 'Citação', 'Audiência'];
    for (const nome of diligencias) {
      const [exists] = await queryInterface.sequelize.query(
        `SELECT id FROM diligencia WHERE nome = '${nome}' LIMIT 1;`,
        { type: Sequelize.QueryTypes.SELECT }
      );
      if (!exists) {
        await queryInterface.bulkInsert('diligencia', [{ nome }]);
      }
    }
  },
  down: async (queryInterface, Sequelize) => {
    // bulkDelete removido para evitar erro de FK
  }
};
