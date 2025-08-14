const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Adicionar novos campos para integração completa com Google Calendar
      await queryInterface.addColumn('AgendamentosProcesso', 'html_link', {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Link do evento no Google Calendar'
      });

      await queryInterface.addColumn('AgendamentosProcesso', 'attendees', {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Participantes do evento (JSON)'
      });

      await queryInterface.addColumn('AgendamentosProcesso', 'reminders_config', {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Configuração de lembretes (JSON)'
      });

      await queryInterface.addColumn('AgendamentosProcesso', 'email_sent', {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Se o e-mail de lembrete foi enviado'
      });

      console.log('✅ Campos do Google Calendar adicionados com sucesso');
    } catch (error) {
      console.error('❌ Erro na migração:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn('AgendamentosProcesso', 'html_link');
      await queryInterface.removeColumn('AgendamentosProcesso', 'attendees');
      await queryInterface.removeColumn('AgendamentosProcesso', 'reminders_config');
      await queryInterface.removeColumn('AgendamentosProcesso', 'email_sent');
      
      console.log('✅ Campos do Google Calendar removidos com sucesso');
    } catch (error) {
      console.error('❌ Erro no rollback da migração:', error);
      throw error;
    }
  }
};
