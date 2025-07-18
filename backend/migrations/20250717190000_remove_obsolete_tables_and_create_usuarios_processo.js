module.exports = {
  async up(queryInterface, Sequelize) {
    // Remover tabelas obsoletas
    await queryInterface.dropTable('SequelizeMeta', { force: true }).catch(() => {});
    await queryInterface.dropTable('alunos_processos', { force: true }).catch(() => {});
    await queryInterface.dropTable('professores_processos', { force: true }).catch(() => {});
    await queryInterface.dropTable('process_updates', { force: true }).catch(() => {});

    // Criar tabela usuarios_processo
    await queryInterface.createTable('usuarios_processo', {
      usuario_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'usuarios', key: 'id' },
        onDelete: 'CASCADE',
        primaryKey: true
      },
      processo_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'processos', key: 'id' },
        onDelete: 'CASCADE',
        primaryKey: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  async down(queryInterface, Sequelize) {
    // Reverter criação da tabela usuarios_processo
    await queryInterface.dropTable('usuarios_processo');

    // Recriar tabelas removidas (opcional, mas não implementado aqui)
  },
};
