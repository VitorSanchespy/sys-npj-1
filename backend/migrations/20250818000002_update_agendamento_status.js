'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      console.log('🔄 Iniciando migration de status dos agendamentos...');
      
      // 1. Primeiro expandir o ENUM para incluir novos valores
      console.log('🔄 Expandindo ENUM para incluir novos valores...');
      await queryInterface.sequelize.query(`
        ALTER TABLE agendamentos 
        MODIFY COLUMN status ENUM('pendente', 'confirmado', 'concluido', 'cancelado', 'em_analise', 'enviando_convites', 'marcado', 'finalizado') 
        NOT NULL DEFAULT 'pendente'
      `);
      
      // 2. Migrar os dados existentes
      console.log('📋 Migrando dados existentes...');
      await queryInterface.sequelize.query(`
        UPDATE agendamentos 
        SET status = CASE 
          WHEN status = 'pendente' THEN 'em_analise'
          WHEN status = 'confirmado' THEN 'marcado'
          WHEN status = 'concluido' THEN 'finalizado'
          ELSE status
        END
      `);

      // 3. Agora limpar o ENUM para conter apenas os novos valores
      console.log('🔄 Finalizando ENUM com novos valores...');
      await queryInterface.sequelize.query(`
        ALTER TABLE agendamentos 
        MODIFY COLUMN status ENUM('em_analise', 'enviando_convites', 'marcado', 'cancelado', 'finalizado') 
        NOT NULL DEFAULT 'em_analise'
      `);

      // 4. Adicionar novos campos
      console.log('📋 Adicionando novos campos...');
      await queryInterface.addColumn('agendamentos', 'motivo_recusa', {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Motivo da recusa quando o responsável rejeita o agendamento'
      });

      await queryInterface.addColumn('agendamentos', 'aprovado_por', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'usuarios',
          key: 'id'
        },
        comment: 'Usuário que aprovou o agendamento'
      });

      await queryInterface.addColumn('agendamentos', 'data_aprovacao', {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Data em que o agendamento foi aprovado'
      });

      console.log('✅ Migration de melhoria do agendamento executada com sucesso');
    } catch (error) {
      console.error('❌ Erro na migration de agendamento:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      // Reverter campos
      await queryInterface.removeColumn('agendamentos', 'data_aprovacao');
      await queryInterface.removeColumn('agendamentos', 'aprovado_por');
      await queryInterface.removeColumn('agendamentos', 'motivo_recusa');

      // Reverter ENUM
      await queryInterface.sequelize.query(`
        ALTER TABLE agendamentos 
        MODIFY COLUMN status ENUM('pendente', 'confirmado', 'concluido', 'cancelado') 
        NOT NULL DEFAULT 'pendente'
      `);

      console.log('✅ Rollback da migration de agendamento executado com sucesso');
    } catch (error) {
      console.error('❌ Erro no rollback da migration de agendamento:', error);
      throw error;
    }
  }
};
