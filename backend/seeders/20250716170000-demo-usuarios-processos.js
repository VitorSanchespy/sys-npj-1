'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Vincula usuários com role 'Aluno' aos processos
    // Busca usuários com role 'Aluno'
    const alunos = await queryInterface.sequelize.query(
      "SELECT u.id FROM usuarios u JOIN roles r ON u.role_id = r.id WHERE r.nome = 'Aluno';",
      { type: Sequelize.QueryTypes.SELECT }
    );
    // Busca processos existentes
    const processos = await queryInterface.sequelize.query(
      "SELECT id FROM processos;",
      { type: Sequelize.QueryTypes.SELECT }
    );
    // Cria vinculação (um aluno para cada processo, exemplo)
    const data = [];
    for (let i = 0; i < Math.min(alunos.length, processos.length); i++) {
      data.push({ usuario_id: alunos[i].id, processo_id: processos[i].id });
    }
    if (data.length > 0) {
      await queryInterface.bulkInsert('alunos_processos', data);
    }
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('alunos_processos', null, {});
  }
};
