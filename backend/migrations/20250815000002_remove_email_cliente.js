const { DataTypes } = require('sequelize');

/**
 * Migration: Remover campo email_cliente da tabela agendamentos
 * Data: 2025-08-15
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('🔄 Removendo campo email_cliente da tabela agendamentos...');
    
    try {
      // Verificar se o campo existe antes de tentar remover
      const tableDescription = await queryInterface.describeTable('agendamentos');
      
      if (tableDescription.email_cliente) {
        await queryInterface.removeColumn('agendamentos', 'email_cliente');
        console.log('✅ Campo email_cliente removido com sucesso');
      } else {
        console.log('ℹ️ Campo email_cliente não existe, pulando...');
      }
      
    } catch (error) {
      console.error('❌ Erro ao remover campo email_cliente:', error.message);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    console.log('🔄 Revertendo: Adicionando campo email_cliente...');
    
    try {
      await queryInterface.addColumn('agendamentos', 'email_cliente', {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Email do cliente (campo removido)'
      });
      
      console.log('✅ Campo email_cliente restaurado');
    } catch (error) {
      console.error('❌ Erro ao restaurar campo email_cliente:', error.message);
      throw error;
    }
  }
};
