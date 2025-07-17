'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Popula tabela fase
    const fases = [
      { nome: 'Inicial' },
      { nome: 'Instrução' },
      { nome: 'Sentença' },
      { nome: 'Recurso' }
    ];
    for (const fase of fases) {
      const [exists] = await queryInterface.sequelize.query(
        `SELECT id FROM fase WHERE nome = '${fase.nome}' LIMIT 1;`,
        { type: Sequelize.QueryTypes.SELECT }
      );
      if (!exists) {
        await queryInterface.bulkInsert('fase', [fase]);
      }
    }
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('fase', null, {});
  }
};
