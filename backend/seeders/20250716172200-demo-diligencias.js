'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Popula tabela diligencia
    const diligencias = [
      { nome: 'Intimação' },
      { nome: 'Citação' },
      { nome: 'Audiência' }
    ];
    for (const diligencia of diligencias) {
      const [exists] = await queryInterface.sequelize.query(
        `SELECT id FROM diligencia WHERE nome = '${diligencia.nome}' LIMIT 1;`,
        { type: Sequelize.QueryTypes.SELECT }
      );
      if (!exists) {
        await queryInterface.bulkInsert('diligencia', [diligencia]);
      }
    }
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('diligencia', null, {});
  }
};
