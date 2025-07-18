module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('atualizacoes_processo', 'tipo_atualizacao', {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        isIn: [['informacao', 'arquivo']]
      }
    });

    await queryInterface.addColumn('atualizacoes_processo', 'descricao', {
      type: Sequelize.TEXT,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('atualizacoes_processo', 'tipo_atualizacao');
    await queryInterface.removeColumn('atualizacoes_processo', 'descricao');
  }
};
