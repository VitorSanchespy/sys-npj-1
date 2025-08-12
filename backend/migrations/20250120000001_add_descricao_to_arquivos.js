'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('arquivos', 'descricao', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Descrição do arquivo fornecida pelo usuário'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('arquivos', 'descricao');
  }
};
