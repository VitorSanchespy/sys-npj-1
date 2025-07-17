'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Popula tabela roles
    const roles = [
      { nome: 'Admin' },
      { nome: 'Aluno' },
      { nome: 'Professor' }
    ];
    for (const role of roles) {
      const [exists] = await queryInterface.sequelize.query(
        `SELECT id FROM roles WHERE nome = '${role.nome}' LIMIT 1;`,
        { type: Sequelize.QueryTypes.SELECT }
      );
      if (!exists) {
        await queryInterface.bulkInsert('roles', [role]);
      }
    }
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('roles', null, {});
  }
};
