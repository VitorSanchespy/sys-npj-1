// Migração para adicionar campos do sistema melhorado de agendamentos
const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Verificar se a tabela de agendamentos existe
      const tableInfo = await queryInterface.describeTable('agendamentos');
      
      // Adicionar status 'pendente' ao enum se não existir
      if (tableInfo.status) {
        await queryInterface.sequelize.query(`
          ALTER TABLE agendamentos 
          MODIFY COLUMN status ENUM('em_analise', 'pendente', 'enviando_convites', 'marcado', 'cancelado', 'finalizado') 
          NOT NULL DEFAULT 'em_analise'
        `, { transaction });
      }
      
      // Adicionar novos campos se não existirem
      const camposParaAdicionar = [
        {
          nome: 'data_convites_enviados',
          definicao: {
            type: DataTypes.DATE,
            allowNull: true,
            comment: 'Data quando os convites foram enviados para calcular expiração de 24h'
          }
        },
        {
          nome: 'admin_notificado_rejeicoes',
          definicao: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            comment: 'Se admin já foi notificado sobre rejeições'
          }
        },
        {
          nome: 'cancelado_por',
          definicao: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'ID do usuário que cancelou o agendamento'
          }
        }
      ];
      
      for (const campo of camposParaAdicionar) {
        if (!tableInfo[campo.nome]) {
          await queryInterface.addColumn('agendamentos', campo.nome, campo.definicao, { transaction });
          console.log(`✅ Campo ${campo.nome} adicionado à tabela agendamentos`);
        } else {
          console.log(`ℹ️ Campo ${campo.nome} já existe na tabela agendamentos`);
        }
      }
      
      // Criar tabela de logs se não existir
      const logTableExists = await queryInterface.showAllTables().then(tables => 
        tables.includes('logs_acoes')
      );
      
      if (!logTableExists) {
        await queryInterface.createTable('logs_acoes', {
          id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
          },
          usuario_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
              model: 'usuarios',
              key: 'id'
            }
          },
          acao: {
            type: DataTypes.STRING(100),
            allowNull: false
          },
          recurso: {
            type: DataTypes.STRING(50),
            allowNull: false
          },
          recurso_id: {
            type: DataTypes.INTEGER,
            allowNull: true
          },
          detalhes: {
            type: DataTypes.TEXT,
            allowNull: true
          },
          ip_address: {
            type: DataTypes.STRING(45),
            allowNull: true
          },
          user_agent: {
            type: DataTypes.TEXT,
            allowNull: true
          },
          data_acao: {
            type: DataTypes.DATE,
            allowNull: false
          },
          created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
          },
          updated_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
          }
        }, { transaction });
        
        console.log('✅ Tabela logs_acoes criada com sucesso');
      } else {
        console.log('ℹ️ Tabela logs_acoes já existe');
      }
      
      await transaction.commit();
      console.log('✅ Migração do sistema melhorado aplicada com sucesso');
      
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Erro ao aplicar migração:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Remover campos adicionados
      const tableInfo = await queryInterface.describeTable('agendamentos');
      
      const camposParaRemover = [
        'data_convites_enviados',
        'admin_notificado_rejeicoes', 
        'cancelado_por'
      ];
      
      for (const campo of camposParaRemover) {
        if (tableInfo[campo]) {
          await queryInterface.removeColumn('agendamentos', campo, { transaction });
          console.log(`✅ Campo ${campo} removido da tabela agendamentos`);
        }
      }
      
      // Reverter enum do status
      await queryInterface.sequelize.query(`
        ALTER TABLE agendamentos 
        MODIFY COLUMN status ENUM('em_analise', 'enviando_convites', 'marcado', 'cancelado', 'finalizado') 
        NOT NULL DEFAULT 'em_analise'
      `, { transaction });
      
      // Remover tabela de logs
      await queryInterface.dropTable('logs_acoes', { transaction });
      console.log('✅ Tabela logs_acoes removida');
      
      await transaction.commit();
      console.log('✅ Migração revertida com sucesso');
      
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Erro ao reverter migração:', error);
      throw error;
    }
  }
};
