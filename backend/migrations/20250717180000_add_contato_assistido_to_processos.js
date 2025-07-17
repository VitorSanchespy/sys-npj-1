module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('processos', 'contato_assistido', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('processos', 'contato_assistido');
  },
};
