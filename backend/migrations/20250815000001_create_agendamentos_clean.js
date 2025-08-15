const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface, Sequelize) {
    // Remover tabelas antigas se existirem
    await queryInterface.dropTable('agendamentosprocesso').catch(() => {});
    await queryInterface.dropTable('agendamentos').catch(() => {});
    await queryInterface.dropTable('agendamentos_processos').catch(() => {});
    
    // Criar nova tabela única de agendamentos
    await queryInterface.createTable('agendamentos', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      processo_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'processos',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      titulo: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Título do agendamento'
      },
      descricao: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Descrição detalhada do agendamento'
      },
      data_inicio: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: 'Data e hora de início'
      },
      data_fim: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: 'Data e hora de fim'
      },
      local: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: 'Local do agendamento'
      },
      tipo: {
        type: DataTypes.ENUM('reuniao', 'audiencia', 'prazo', 'outro'),
        allowNull: false,
        defaultValue: 'reuniao',
        comment: 'Tipo do agendamento'
      },
      status: {
        type: DataTypes.ENUM('pendente', 'confirmado', 'concluido', 'cancelado'),
        allowNull: false,
        defaultValue: 'pendente',
        comment: 'Status do agendamento'
      },
      email_lembrete: {
        type: DataTypes.STRING(255),
        allowNull: true,
        validate: {
          isEmail: true
        },
        comment: 'Email para envio de lembrete'
      },
      lembrete_enviado: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Se o lembrete foi enviado'
      },
      criado_por: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'usuarios',
          key: 'id'
        },
        comment: 'Usuário que criou o agendamento'
      },
      observacoes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Observações adicionais'
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Criar índices para performance
    await queryInterface.addIndex('agendamentos', ['processo_id'], {
      name: 'idx_agendamentos_processo'
    });
    
    await queryInterface.addIndex('agendamentos', ['data_inicio', 'data_fim'], {
      name: 'idx_agendamentos_periodo'
    });
    
    await queryInterface.addIndex('agendamentos', ['status'], {
      name: 'idx_agendamentos_status'
    });
    
    await queryInterface.addIndex('agendamentos', ['criado_por'], {
      name: 'idx_agendamentos_usuario'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('agendamentos');
  }
};
