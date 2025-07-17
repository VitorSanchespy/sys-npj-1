'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Busca processos existentes
    const processos = await queryInterface.sequelize.query(
      "SELECT id FROM processos;",
      { type: Sequelize.QueryTypes.SELECT }
    );
    // Busca usuários existentes
    const usuarios = await queryInterface.sequelize.query(
      "SELECT id FROM usuarios;",
      { type: Sequelize.QueryTypes.SELECT }
    );
    // Popula atualizacoes (exemplo: uma atualização para cada processo)
    const data = [];
    for (let i = 0; i < Math.min(processos.length, usuarios.length); i++) {
      data.push({
        processo_id: processos[i].id,
        usuario_id: usuarios[i].id,
        descricao: `Atualização do processo ${processos[i].id}`,
        data_atualizacao: new Date(),
        tipo: 'Andamento'
      });
    }
    if (data.length > 0) {
      await queryInterface.bulkInsert('atualizacoes', data);
    }
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('atualizacoes', null, {});
  }
};
