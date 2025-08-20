const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Adicionar campo lembrete_1h_enviado na tabela agendamentos
    await queryInterface.addColumn('agendamentos', 'lembrete_1h_enviado', {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Lembrete 1 hora antes foi enviado'
    });
    
    console.log('✅ Campo lembrete_1h_enviado adicionado à tabela agendamentos');
  },

  down: async (queryInterface, Sequelize) => {
    // Remover campo lembrete_1h_enviado
    await queryInterface.removeColumn('agendamentos', 'lembrete_1h_enviado');
    
    console.log('✅ Campo lembrete_1h_enviado removido da tabela agendamentos');
  }
};
