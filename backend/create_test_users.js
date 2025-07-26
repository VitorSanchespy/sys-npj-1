const bcrypt = require('bcrypt');
const sequelize = require('./config/sequelize');
const { usuariosModels, rolesModels } = require('./models/indexModels');

async function createAdminUser() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado ao banco de dados');

    // Verificar se existe role de Admin
    let adminRole = await rolesModels.findOne({ where: { id: 1 } });
    if (!adminRole) {
      adminRole = await rolesModels.create({
        id: 1,
        nome: 'Admin',
        descricao: 'Administrador do sistema'
      });
      console.log('✅ Role Admin criada');
    }

    // Verificar se existe role de Aluno
    let alunoRole = await rolesModels.findOne({ where: { id: 2 } });
    if (!alunoRole) {
      alunoRole = await rolesModels.create({
        id: 2,
        nome: 'Aluno',
        descricao: 'Estudante'
      });
      console.log('✅ Role Aluno criada');
    }

    // Verificar se existe role de Professor
    let professorRole = await rolesModels.findOne({ where: { id: 3 } });
    if (!professorRole) {
      professorRole = await rolesModels.create({
        id: 3,
        nome: 'Professor',
        descricao: 'Professor orientador'
      });
      console.log('✅ Role Professor criada');
    }

    // Verificar se já existe usuário admin
    const existingAdmin = await usuariosModels.findOne({
      where: { email: 'admin@teste.com' }
    });

    if (existingAdmin) {
      console.log('ℹ️ Usuário admin já existe');
    } else {
      // Criar usuário admin
      const hashedPassword = await bcrypt.hash('123456', 10);
      
      const adminUser = await usuariosModels.create({
        nome: 'Administrador',
        email: 'admin@teste.com',
        senha: hashedPassword,
        role_id: 1,
        ativo: true
      });
      
      console.log('✅ Usuário admin criado:', adminUser.email);
    }

    // Criar usuário professor de teste
    const existingProf = await usuariosModels.findOne({
      where: { email: 'professor@teste.com' }
    });

    if (!existingProf) {
      const hashedPassword = await bcrypt.hash('123456', 10);
      
      const profUser = await usuariosModels.create({
        nome: 'Professor Teste',
        email: 'professor@teste.com',
        senha: hashedPassword,
        role_id: 3,
        ativo: true
      });
      
      console.log('✅ Usuário professor criado:', profUser.email);
    }

    // Criar usuário aluno de teste
    const existingAluno = await usuariosModels.findOne({
      where: { email: 'aluno@teste.com' }
    });

    if (!existingAluno) {
      const hashedPassword = await bcrypt.hash('123456', 10);
      
      const alunoUser = await usuariosModels.create({
        nome: 'Aluno Teste',
        email: 'aluno@teste.com',
        senha: hashedPassword,
        role_id: 2,
        ativo: true
      });
      
      console.log('✅ Usuário aluno criado:', alunoUser.email);
    }

    console.log('\n🎉 Setup concluído! Usuários disponíveis:');
    console.log('Admin: admin@teste.com / 123456');
    console.log('Professor: professor@teste.com / 123456');
    console.log('Aluno: aluno@teste.com / 123456');

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await sequelize.close();
  }
}

createAdminUser();
