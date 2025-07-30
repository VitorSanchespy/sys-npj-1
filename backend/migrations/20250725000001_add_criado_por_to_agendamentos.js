'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('agendamentos', 'criado_por', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1, // Valor padrão temporário para registros existentes
      references: {
        model: 'usuarios',
        key: 'id'
      },
      onDelete: 'CASCADE'
    });

    // Adicionar índice para a nova coluna
    await queryInterface.addIndex('agendamentos', ['criado_por']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('agendamentos', 'criado_por');
  }
};
