'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('arquivos', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      nome: {
        type: Sequelize.STRING,
        allowNull: false
      },
      caminho: {
        type: Sequelize.STRING,
        allowNull: false
      },
      criado_em: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
      // Adicione outros campos conforme necessário
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('arquivos');
  }
};