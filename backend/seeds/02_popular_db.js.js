exports.seed = async function(knex) {
  await knex.raw('USE npjdatabase');

  // Roles
  const roles = ['Admin', 'Aluno', 'Professor'];
  for (const nome of roles) {
    const exists = await knex('roles').where({ nome }).first();
    if (!exists) {
      await knex('roles').insert({ nome });
    }
  }

  // Obter IDs das roles
  const roleAdmin = await knex('roles').where({ nome: 'Admin' }).first();
  const roleAluno = await knex('roles').where({ nome: 'Aluno' }).first();
  const roleProfessor = await knex('roles').where({ nome: 'Professor' }).first();

  // Inserir usuários
  const usuarios = [
    { nome: 'Joao Silva', email: 'joao@exemplo.com', senha: 'senha123', role_id: roleAluno.id, ativo: true },
    { nome: 'Maria Souza', email: 'maria@exemplo.com', senha: 'senha123', role_id: roleProfessor.id, ativo: true },
    { nome: 'Carlos Admin', email: 'carlos@admin.com', senha: 'admin', role_id: roleAdmin.id, ativo: true }
  ];

  for (const usuario of usuarios) {
    const exists = await knex('usuarios').where({ email: usuario.email }).first();
    if (!exists) {
      await knex('usuarios').insert(usuario);
    } else {
      await knex('usuarios')
        .where({ email: usuario.email })
        .update({ nome: usuario.nome, senha: usuario.senha, role_id: usuario.role_id });
    }
  }

  // Inserir processos
  const processos = [
    { numero_processo: 'PROC001', descricao: 'Processo sobre atendimento juridico civil' },
    { numero_processo: 'PROC002', descricao: 'Processo sobre orientacao penal' }
  ];

  for (const processo of processos) {
    const exists = await knex('processos').where({ numero_processo: processo.numero_processo }).first();
    if (!exists) {
      await knex('processos').insert(processo);
    }
  }

  // Obter IDs para relacionamentos
  const joao = await knex('usuarios').where({ email: 'joao@exemplo.com' }).first();
  const maria = await knex('usuarios').where({ email: 'maria@exemplo.com' }).first();
  const proc001 = await knex('processos').where({ numero_processo: 'PROC001' }).first();
  const proc002 = await knex('processos').where({ numero_processo: 'PROC002' }).first();

  // Relacionar alunos com processos
  const relacoes = [
    { usuario_id: joao.id, processo_id: proc001.id },
    { usuario_id: joao.id, processo_id: proc002.id }
  ];

  for (const rel of relacoes) {
    const exists = await knex('alunos_processos')
      .where({ usuario_id: rel.usuario_id, processo_id: rel.processo_id })
      .first();
    if (!exists) {
      await knex('alunos_processos').insert(rel);
    }
  }

  // Inserir atualizações de processos
  const atualizacoes = [
    { usuario_id: joao.id, processo_id: proc001.id, descricao: 'Contato inicial com o cliente' },
    { usuario_id: maria.id, processo_id: proc001.id, descricao: 'Revisao feita pelo professor Maria Souza' },
    { usuario_id: joao.id, processo_id: proc002.id, descricao: 'Documentos recebidos do cliente' }
  ];

  for (const att of atualizacoes) {
    await knex('atualizacoes').insert(att);
  }
};
