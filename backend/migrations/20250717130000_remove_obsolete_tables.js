module.exports = {
  async up(queryInterface, Sequelize) {
    // Remover tabelas obsoletas
    await queryInterface.dropTable('SequelizeMeta', { force: true }).catch(() => {});
    await queryInterface.dropTable('knex_migrations_lock', { force: true }).catch(() => {});
    await queryInterface.dropTable('knex_migrations', { force: true }).catch(() => {});
    await queryInterface.dropTable('professores_processos', { force: true }).catch(() => {});
    await queryInterface.dropTable('alunos_processos', { force: true }).catch(() => {});

    // Criar a nova tabela `atualizacoes_processo`
    await queryInterface.createTable('atualizacoes_processo', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      usuario_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'usuarios',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      processo_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'processos',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      arquivos_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        references: {
          model: 'arquivos',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      data_atualizacao: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });
  },

  async down(queryInterface, Sequelize) {
    // Não implementado o down por serem tabelas obsoletas
  },
};
