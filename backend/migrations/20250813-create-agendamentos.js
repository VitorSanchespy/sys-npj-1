'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('AgendamentosProcesso', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      processo_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Processos',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      google_event_id: {
        type: Sequelize.STRING,
        allowNull: true
      },
      start: {
        type: Sequelize.DATE,
        allowNull: false
      },
      end: {
        type: Sequelize.DATE,
        allowNull: false
      },
      summary: {
        type: Sequelize.STRING,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('pendente', 'sincronizado', 'cancelado'),
        allowNull: false,
        defaultValue: 'pendente'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Adicionar índices para melhor performance
    await queryInterface.addIndex('AgendamentosProcesso', ['processo_id']);
    await queryInterface.addIndex('AgendamentosProcesso', ['google_event_id']);
    await queryInterface.addIndex('AgendamentosProcesso', ['status']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('AgendamentosProcesso');
  }
};
