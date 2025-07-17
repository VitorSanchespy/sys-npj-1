'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // bulkDelete removido para evitar erro de FK
    // Busca os IDs dos usuários pelo email
    const [user1] = await queryInterface.sequelize.query(
      "SELECT id FROM usuarios WHERE email = 'admin@admin.com' LIMIT 1;",
      { type: Sequelize.QueryTypes.SELECT }
    );
    const [user2] = await queryInterface.sequelize.query(
      "SELECT id FROM usuarios WHERE email = 'joao@exemplo.com' LIMIT 1;",
      { type: Sequelize.QueryTypes.SELECT }
    );
    // Busca os IDs de materia_assunto pelo nome
    const [assunto1] = await queryInterface.sequelize.query(
      "SELECT id FROM materia_assunto WHERE nome = 'Cível' LIMIT 1;",
      { type: Sequelize.QueryTypes.SELECT }
    );
    const [assunto2] = await queryInterface.sequelize.query(
      "SELECT id FROM materia_assunto WHERE nome = 'Penal' LIMIT 1;",
      { type: Sequelize.QueryTypes.SELECT }
    );
    // Busca os IDs de fase pelo nome
    const [fase1] = await queryInterface.sequelize.query(
      "SELECT id FROM fase WHERE nome = 'Inicial' LIMIT 1;",
      { type: Sequelize.QueryTypes.SELECT }
    );
    const [fase2] = await queryInterface.sequelize.query(
      "SELECT id FROM fase WHERE nome = 'Recursal' LIMIT 1;",
      { type: Sequelize.QueryTypes.SELECT }
    );
    // Busca os IDs de diligencia pelo nome
    const [diligencia1] = await queryInterface.sequelize.query(
      "SELECT id FROM diligencia WHERE nome = 'Audiência' LIMIT 1;",
      { type: Sequelize.QueryTypes.SELECT }
    );
    const [diligencia2] = await queryInterface.sequelize.query(
      "SELECT id FROM diligencia WHERE nome = 'Intimação' LIMIT 1;",
      { type: Sequelize.QueryTypes.SELECT }
    );
    const processos = [
      {
        numero_processo: '2025-0001',
        descricao: 'Processo de exemplo 1',
        status: 'Em andamento',
        materia_assunto_id: assunto1 ? assunto1.id : null,
        local_tramitacao: 'Fórum Central',
        sistema: 'Físico',
        fase_id: fase1 ? fase1.id : null,
        diligencia_id: diligencia1 ? diligencia1.id : null,
        idusuario_responsavel: user1 ? user1.id : null,
        data_encerramento: null,
        observacoes: 'Primeiro processo de teste',
        num_processo_sei: 'SEI-001',
        assistido: 'João da Silva'
      },
      {
        numero_processo: '2025-0002',
        descricao: 'Processo de exemplo 2',
        status: 'Encerrado',
        materia_assunto_id: assunto2 ? assunto2.id : assunto1 ? assunto1.id : null,
        local_tramitacao: 'Fórum Regional',
        sistema: 'PEA',
        fase_id: fase2 ? fase2.id : fase1 ? fase1.id : null,
        diligencia_id: diligencia2 ? diligencia2.id : diligencia1 ? diligencia1.id : null,
        idusuario_responsavel: user2 ? user2.id : user1 ? user1.id : null,
        data_encerramento: new Date(),
        observacoes: 'Segundo processo de teste',
        num_processo_sei: 'SEI-002',
        assistido: 'Maria Souza'
      }
    ];
    for (const processo of processos) {
      const [exists] = await queryInterface.sequelize.query(
        `SELECT id FROM processos WHERE numero_processo = '${processo.numero_processo}' LIMIT 1;`,
        { type: Sequelize.QueryTypes.SELECT }
      );
      if (!exists) {
        await queryInterface.bulkInsert('processos', [processo]);
      }
    }
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('processos', null, {});
  }
};
