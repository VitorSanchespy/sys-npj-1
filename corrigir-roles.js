const mysql = require('mysql2/promise');

async function corrigirRoles() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '12345678@',
    database: 'npjdatabase'
  });

  try {
    console.log('🔍 CORRIGINDO ROLES DOS USUÁRIOS...\n');

    // Verificar roles existentes
    const [roles] = await connection.execute('SELECT * FROM roles');
    console.log('🔑 Roles no banco:');
    roles.forEach(role => {
      console.log(`- ID: ${role.id}, Nome: ${role.nome}`);
    });

    // Verificar usuários atuais
    console.log('\n👥 Usuários atuais:');
    const [usuarios] = await connection.execute(`
      SELECT u.id, u.nome, u.email, u.role_id, r.nome as role_nome 
      FROM usuarios u 
      LEFT JOIN roles r ON u.role_id = r.id
    `);
    
    usuarios.forEach(user => {
      console.log(`- ${user.nome} (${user.email}) - Role ID: ${user.role_id} (${user.role_nome})`);
    });

    // Atualizar roles específicas
    console.log('\n🔄 Atualizando roles...');
    
    // Admin (ID 3)
    await connection.execute(
      "UPDATE usuarios SET role_id = 3 WHERE email = 'admin2@test.com'"
    );
    console.log('✅ Admin2 atualizado para role 3 (Admin)');

    // Professor (ID 2)
    await connection.execute(
      "UPDATE usuarios SET role_id = 2 WHERE email = 'professor2@test.com'"
    );
    console.log('✅ Professor2 atualizado para role 2 (Professor)');

    // Aluno (ID 1)
    await connection.execute(
      "UPDATE usuarios SET role_id = 1 WHERE email = 'aluno2@test.com'"
    );
    console.log('✅ Aluno2 mantido como role 1 (Aluno)');

    // Verificar após atualização
    console.log('\n👥 Usuários após correção:');
    const [usuariosAtualizados] = await connection.execute(`
      SELECT u.id, u.nome, u.email, u.role_id, r.nome as role_nome 
      FROM usuarios u 
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.email IN ('admin2@test.com', 'professor2@test.com', 'aluno2@test.com')
    `);
    
    usuariosAtualizados.forEach(user => {
      console.log(`- ${user.nome} (${user.email}) - Role ID: ${user.role_id} (${user.role_nome})`);
    });

    console.log('\n✅ CORREÇÃO CONCLUÍDA!');

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await connection.end();
  }
}

corrigirRoles();
