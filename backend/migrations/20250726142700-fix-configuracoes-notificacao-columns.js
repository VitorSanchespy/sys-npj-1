'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Verificar se a tabela existe
      const tables = await queryInterface.showAllTables();
      if (!tables.includes('configuracoes_notificacao')) {
        console.log('Tabela configuracoes_notificacao não existe, criando...');
        await queryInterface.createTable('configuracoes_notificacao', {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
          },
          usuario_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            unique: true,
            references: {
              model: 'usuarios',
              key: 'id'
            },
            onDelete: 'CASCADE'
          },
          email_lembretes: {
            type: Sequelize.BOOLEAN,
            defaultValue: true
          },
          email_alertas: {
            type: Sequelize.BOOLEAN,
            defaultValue: true
          },
          email_atualizacoes: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
          },
          sistema_lembretes: {
            type: Sequelize.BOOLEAN,
            defaultValue: true
          },
          sistema_alertas: {
            type: Sequelize.BOOLEAN,
            defaultValue: true
          },
          sistema_atualizacoes: {
            type: Sequelize.BOOLEAN,
            defaultValue: true
          },
          dias_alerta_sem_atualizacao: {
            type: Sequelize.INTEGER,
            defaultValue: 30
          },
          horario_preferido_email: {
            type: Sequelize.TIME,
            defaultValue: '09:00:00'
          },
          criado_em: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
          },
          atualizado_em: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
          }
        });
        return;
      }

      // Verificar e adicionar colunas que podem estar faltando
      const tableInfo = await queryInterface.describeTable('configuracoes_notificacao');
      
      const columnsToAdd = [
        {
          name: 'email_atualizacoes',
          definition: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
          }
        },
        {
          name: 'sistema_atualizacoes',
          definition: {
            type: Sequelize.BOOLEAN,
            defaultValue: true
          }
        }
      ];

      for (const column of columnsToAdd) {
        if (!tableInfo[column.name]) {
          console.log(`Adicionando coluna ${column.name}...`);
          await queryInterface.addColumn('configuracoes_notificacao', column.name, column.definition);
        } else {
          console.log(`Coluna ${column.name} já existe.`);
        }
      }
    } catch (error) {
      console.error('Erro na migração:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      const tableInfo = await queryInterface.describeTable('configuracoes_notificacao');
      
      if (tableInfo.email_atualizacoes) {
        await queryInterface.removeColumn('configuracoes_notificacao', 'email_atualizacoes');
      }
      
      if (tableInfo.sistema_atualizacoes) {
        await queryInterface.removeColumn('configuracoes_notificacao', 'sistema_atualizacoes');
      }
    } catch (error) {
      console.error('Erro no rollback da migração:', error);
      throw error;
    }
  }
};
