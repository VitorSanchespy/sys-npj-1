'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Adicionar campo email_cliente se não existir
      const emailClienteExists = await queryInterface.describeTable('agendamentos')
        .then(attributes => attributes.email_cliente !== undefined)
        .catch(() => false);

      if (!emailClienteExists) {
        await queryInterface.addColumn('agendamentos', 'email_cliente', {
          type: Sequelize.STRING(255),
          allowNull: true,
          comment: 'Email do cliente para envio de convites e lembretes'
        });
      }

      // Adicionar campo convidados se não existir
      const convidadosExists = await queryInterface.describeTable('agendamentos')
        .then(attributes => attributes.convidados !== undefined)
        .catch(() => false);

      if (!convidadosExists) {
        await queryInterface.addColumn('agendamentos', 'convidados', {
          type: Sequelize.JSON,
          allowNull: true,
          defaultValue: '[]',
          comment: 'Lista de convidados com status de resposta'
        });
      }

      console.log('✅ Migration de individualização de agendamentos executada com sucesso');
    } catch (error) {
      console.error('❌ Erro na migration de individualização de agendamentos:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      // Remover campos adicionados
      await queryInterface.removeColumn('agendamentos', 'email_cliente');
      await queryInterface.removeColumn('agendamentos', 'convidados');
      
      console.log('✅ Rollback da migration de individualização de agendamentos executado com sucesso');
    } catch (error) {
      console.error('❌ Erro no rollback da migration de individualização de agendamentos:', error);
      throw error;
    }
  }
};
