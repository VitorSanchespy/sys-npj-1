'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // 1. Criar tabela events
      await queryInterface.createTable('events', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false
        },
        title: {
          type: Sequelize.STRING(255),
          allowNull: false
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        start_at: {
          type: Sequelize.DATE,
          allowNull: false
        },
        end_at: {
          type: Sequelize.DATE,
          allowNull: false
        },
        status: {
          type: Sequelize.ENUM('requested', 'approved', 'rejected', 'canceled', 'completed'),
          allowNull: false,
          defaultValue: 'requested'
        },
        requester_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'usuarios',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        approver_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'usuarios',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        },
        rejection_reason: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
        }
      });

      // 2. Criar tabela event_participants
      await queryInterface.createTable('event_participants', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false
        },
        event_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'events',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'usuarios',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        email: {
          type: Sequelize.STRING(255),
          allowNull: false
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
        }
      });

      // 3. Criar tabela event_notifications
      await queryInterface.createTable('event_notifications', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false
        },
        event_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'events',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        type: {
          type: Sequelize.ENUM('approval_request', 'approved', 'rejected', 'daily_reminder', 'hourly_reminder'),
          allowNull: false
        },
        sent_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        meta: {
          type: Sequelize.JSON,
          allowNull: true
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
        }
      });

      // 4. Criar índices para performance
      await queryInterface.addIndex('events', ['requester_id']);
      await queryInterface.addIndex('events', ['approver_id']);
      await queryInterface.addIndex('events', ['status']);
      await queryInterface.addIndex('events', ['start_at']);
      await queryInterface.addIndex('events', ['end_at']);
      
      await queryInterface.addIndex('event_participants', ['event_id']);
      await queryInterface.addIndex('event_participants', ['user_id']);
      await queryInterface.addIndex('event_participants', ['email']);
      
      await queryInterface.addIndex('event_notifications', ['event_id']);
      await queryInterface.addIndex('event_notifications', ['type']);
      await queryInterface.addIndex('event_notifications', ['sent_at']);

      console.log('✅ Migration de events system executada com sucesso');
    } catch (error) {
      console.error('❌ Erro na migration de events system:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.dropTable('event_notifications');
      await queryInterface.dropTable('event_participants');
      await queryInterface.dropTable('events');
      
      console.log('✅ Rollback da migration de events system executado com sucesso');
    } catch (error) {
      console.error('❌ Erro no rollback da migration de events system:', error);
      throw error;
    }
  }
};
