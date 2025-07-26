'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Renomear tipo_evento para tipo
    await queryInterface.renameColumn('agendamentos', 'tipo_evento', 'tipo');
    
    // Adicionar colunas que podem estar faltando
    await queryInterface.addColumn('agendamentos', 'hora_evento', {
      type: Sequelize.TIME,
      allowNull: true
    });
    
    await queryInterface.addColumn('agendamentos', 'local_evento', {
      type: Sequelize.STRING(255),
      allowNull: true
    });
    
    // Adicionar colunas de notificação
    await queryInterface.addColumn('agendamentos', 'notificacao_por_email', {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    });
    
    await queryInterface.addColumn('agendamentos', 'notificacao_por_sistema', {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    });
    
    // Verificar se a coluna local existe e renomear para local_evento se necessário
    try {
      await queryInterface.renameColumn('agendamentos', 'local', 'local_evento');
    } catch (error) {
      // Coluna local pode não existir
      console.log('Coluna local não encontrada, ignorando renomeação');
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Reverter as mudanças
    await queryInterface.renameColumn('agendamentos', 'tipo', 'tipo_evento');
    await queryInterface.removeColumn('agendamentos', 'hora_evento');
    await queryInterface.removeColumn('agendamentos', 'local_evento');
  }
};
