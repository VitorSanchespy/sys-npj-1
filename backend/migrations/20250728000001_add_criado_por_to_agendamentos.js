'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Adiciona coluna criado_por
    await queryInterface.addColumn('agendamentos', 'criado_por', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1, // Valor padrão temporário
      references: {
        model: 'usuarios',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });

    // Remove o valor padrão após criar a coluna
    await queryInterface.changeColumn('agendamentos', 'criado_por', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'usuarios',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('agendamentos', 'criado_por');
  }
};
