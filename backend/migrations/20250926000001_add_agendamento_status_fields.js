module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('agendamentos', 'cancelado_automaticamente', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Se foi cancelado automaticamente quando todos recusaram'
    });

    await queryInterface.addColumn('agendamentos', 'motivo_cancelamento', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Motivo do cancelamento (manual ou automático)'
    });

    await queryInterface.addColumn('agendamentos', 'situacao_mista', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Se há aceites e recusas simultaneamente (precisa ação admin)'
    });

    console.log('✅ Colunas de status do agendamento adicionadas com sucesso');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('agendamentos', 'cancelado_automaticamente');
    await queryInterface.removeColumn('agendamentos', 'motivo_cancelamento');
    await queryInterface.removeColumn('agendamentos', 'situacao_mista');
    
    console.log('✅ Colunas de status do agendamento removidas com sucesso');
  }
};