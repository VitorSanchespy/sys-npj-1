'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // bulkDelete removido para evitar erro de FK
    const fases = ['Inicial', 'Instrução', 'Sentença', 'Recurso'];
    for (const nome of fases) {
      const [exists] = await queryInterface.sequelize.query(
        `SELECT id FROM fase WHERE nome = '${nome}' LIMIT 1;`,
        { type: Sequelize.QueryTypes.SELECT }
      );
      if (!exists) {
        await queryInterface.bulkInsert('fase', [{ nome }]);
      }
    }
  },
  down: async (queryInterface, Sequelize) => {
    // bulkDelete removido para evitar erro de FK
  }
};
