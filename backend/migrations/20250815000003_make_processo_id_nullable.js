const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      console.log('📝 Alterando processo_id para permitir NULL...');
      
      // Alterar a coluna processo_id para permitir NULL
      await queryInterface.changeColumn('agendamentos', 'processo_id', {
        type: DataTypes.INTEGER,
        allowNull: true
      });
      
      console.log('✅ Processo_id alterado para permitir NULL com sucesso');
    } catch (error) {
      console.error('❌ Erro ao alterar processo_id:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      console.log('📝 Desfazendo alteração em processo_id...');
      
      // Restaurar a coluna processo_id para NOT NULL
      await queryInterface.changeColumn('agendamentos', 'processo_id', {
        type: DataTypes.INTEGER,
        allowNull: false
      });
      
      console.log('✅ Processo_id restaurado para NOT NULL');
    } catch (error) {
      console.error('❌ Erro ao restaurar processo_id:', error);
      throw error;
    }
  }
};
