'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Alterar o ENUM da coluna tipo para corresponder ao modelo
    await queryInterface.changeColumn('agendamentos', 'tipo', {
      type: Sequelize.ENUM('audiencia', 'prazo', 'evento', 'reuniao', 'outros'),
      allowNull: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Reverter para o ENUM original
    await queryInterface.changeColumn('agendamentos', 'tipo', {
      type: Sequelize.ENUM('audiencia', 'prazo', 'reuniao', 'diligencia', 'outro'),
      allowNull: false
    });
  }
};
