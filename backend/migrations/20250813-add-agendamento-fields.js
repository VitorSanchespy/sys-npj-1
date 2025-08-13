'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Adicionar novos campos na tabela AgendamentosProcesso
    await queryInterface.addColumn('AgendamentosProcesso', 'tipo_evento', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: 'Reunião',
      comment: 'Tipo do evento (Reunião, Audiência, etc.)'
    });

    await queryInterface.addColumn('AgendamentosProcesso', 'description', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Descrição detalhada do agendamento'
    });

    await queryInterface.addColumn('AgendamentosProcesso', 'location', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Local do agendamento'
    });

    await queryInterface.addColumn('AgendamentosProcesso', 'created_by', {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'ID do usuário que criou o agendamento'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remover campos adicionados
    await queryInterface.removeColumn('AgendamentosProcesso', 'tipo_evento');
    await queryInterface.removeColumn('AgendamentosProcesso', 'description');
    await queryInterface.removeColumn('AgendamentosProcesso', 'location');
    await queryInterface.removeColumn('AgendamentosProcesso', 'created_by');
  }
};
