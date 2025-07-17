'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Exemplo: popular tabela arquivos
    // Busca os IDs dos usuários pelo email
    const [adminUser] = await queryInterface.sequelize.query(
      "SELECT id FROM usuarios WHERE email = 'admin@admin.com' LIMIT 1;",
      { type: Sequelize.QueryTypes.SELECT }
    );
    const [joaoUser] = await queryInterface.sequelize.query(
      "SELECT id FROM usuarios WHERE email = 'joao@exemplo.com' LIMIT 1;",
      { type: Sequelize.QueryTypes.SELECT }
    );
    // Busca os IDs dos processos existentes
    const [processo1] = await queryInterface.sequelize.query(
      "SELECT id FROM processos LIMIT 1;",
      { type: Sequelize.QueryTypes.SELECT }
    );
    const [processo2] = await queryInterface.sequelize.query(
      "SELECT id FROM processos LIMIT 1 OFFSET 1;",
      { type: Sequelize.QueryTypes.SELECT }
    );
    const arquivos = [
      {
        nome: 'documento1.pdf',
        caminho: '/uploads/documento1.pdf',
        tamanho: 102400,
        tipo: 'pdf',
        processo_id: processo1 ? processo1.id : null,
        usuario_id: adminUser.id,
        criado_em: new Date()
      },
      {
        nome: 'imagem1.jpg',
        caminho: '/uploads/imagem1.jpg',
        tamanho: 204800,
        tipo: 'jpg',
        processo_id: processo2 ? processo2.id : processo1 ? processo1.id : null,
        usuario_id: joaoUser.id,
        criado_em: new Date()
      }
    ];
    for (const arquivo of arquivos) {
      const [exists] = await queryInterface.sequelize.query(
        `SELECT id FROM arquivos WHERE nome = '${arquivo.nome}' AND caminho = '${arquivo.caminho}' LIMIT 1;`,
        { type: Sequelize.QueryTypes.SELECT }
      );
      if (!exists) {
        await queryInterface.bulkInsert('arquivos', [arquivo]);
      }
    }
  },
  down: async (queryInterface, Sequelize) => {
    // bulkDelete removido para evitar erro de FK
  }
};
