// Script para popular o banco de dados com usuários e processos de teste
// Execute: node popular-banco-teste.js

const { Sequelize } = require('sequelize');
const { usuarioModel: Usuario, processoModel: Processo, roleModel: Role } = require('./backend/models/indexModel');

async function main() {
  try {
    // Cria roles se não existirem
    await Role.bulkCreate([
      { id: 1, nome: 'admin' },
      { id: 2, nome: 'professor' },
      { id: 3, nome: 'aluno' }
    ], { ignoreDuplicates: true });

    // Cria usuários de teste
    const usuarios = await Usuario.bulkCreate([
      { nome: 'Admin Teste', email: 'admin@teste.com', senha: '123456', role_id: 1, ativo: true },
      { nome: 'Professor Teste', email: 'prof@teste.com', senha: '123456', role_id: 2, ativo: true },
      { nome: 'Aluno Teste', email: 'aluno@teste.com', senha: '123456', role_id: 3, ativo: true }
    ], { ignoreDuplicates: true });

    // Cria processos de teste
    await Processo.bulkCreate([
      { numero_processo: '0001', descricao: 'Processo de teste 1', status: 'Em andamento', tipo_processo: 'Civil', idusuario_responsavel: 1 },
      { numero_processo: '0002', descricao: 'Processo de teste 2', status: 'Aguardando', tipo_processo: 'Penal', idusuario_responsavel: 2 },
      { numero_processo: '0003', descricao: 'Processo de teste 3', status: 'Finalizado', tipo_processo: 'Trabalhista', idusuario_responsavel: 3 }
    ], { ignoreDuplicates: true });

    console.log('Banco de dados populado com sucesso!');
    process.exit(0);
  } catch (err) {
    console.error('Erro ao popular banco:', err);
    process.exit(1);
  }
}

main();
