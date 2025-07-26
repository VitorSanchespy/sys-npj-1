'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Verificar se a coluna existe antes de tentar adicioná-la
    const tableDescription = await queryInterface.describeTable('configuracoes_notificacao');
    
    if (!tableDescription.horario_preferido_email) {
      await queryInterface.addColumn('configuracoes_notificacao', 'horario_preferido_email', {
        type: Sequelize.TIME,
        allowNull: true,
        comment: 'Horário preferido para receber emails de notificação'
      });
    }
  },

  async down (queryInterface, Sequelize) {
    // Verificar se a coluna existe antes de tentar removê-la
    const tableDescription = await queryInterface.describeTable('configuracoes_notificacao');
    
    if (tableDescription.horario_preferido_email) {
      await queryInterface.removeColumn('configuracoes_notificacao', 'horario_preferido_email');
    }
  }
};
