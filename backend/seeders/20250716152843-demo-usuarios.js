'use strict';

/** @type {import('sequelize-cli').Migration} */
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('arquivos', null, {});
    await queryInterface.bulkDelete('atualizacoes', null, {});
    await queryInterface.bulkDelete('usuarios', null, {});

    const users = [
      {
        nome: 'Admin User',
        email: 'admin@admin.com',
        senha: 'Ronaldo1507',
        role_id: 1,
        ativo: true,
        criado_em: new Date()
      },
      {
        nome: 'Joao Silva',
        email: 'joao@exemplo.com',
        senha: 'senha123',
        role_id: 2,
        ativo: true,
        criado_em: new Date()
      },
      {
        nome: 'Maria Souza',
        email: 'maria@exemplo.com',
        senha: 'senha123',
        role_id: 3,
        ativo: true,
        criado_em: new Date()
      },
      {
        nome: 'Ester',
        email: 'ester@gmail.com',
        senha: 'Ronaldo1507',
        role_id: 3,
        ativo: true,
        criado_em: new Date()
      },
      {
        nome: 'Ronaldo Couto JR',
        email: 'ronaldo.couto.jr@gmail.com',
        senha: 'senha123',
        role_id: 2,
        ativo: true,
        criado_em: new Date()
      },
      {
        nome: 'Emilly',
        email: 'emilly@gmail.com',
        senha: 'senha123',
        role_id: 2,
        ativo: true,
        criado_em: new Date()
      }
    ];

    // Hash de todas as senhas
    for (const user of users) {
      user.senha = await bcrypt.hash(user.senha, 10);
    }

    await queryInterface.bulkInsert('usuarios', users);
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('usuarios', null, {});
  }
};
