const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

async function createAdmin() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '12345678@',
    database: 'npjdatabase'
  });

  const hashedPassword = await bcrypt.hash('123456', 10);
  
  // Check if admin already exists
  const [existingUser] = await connection.execute('SELECT id FROM usuarios WHERE email = ?', ['admin@teste.com']);
  
  if (existingUser.length > 0) {
    console.log('Admin já existe!');
    console.log('Email: admin@teste.com');
    console.log('Senha: 123456');
  } else {
    // Create new admin
    await connection.execute(
      'INSERT INTO usuarios (nome, email, senha, role_id, ativo) VALUES (?, ?, ?, ?, ?)',
      ['Admin Teste', 'admin@teste.com', hashedPassword, 5, 1]
    );
    
    console.log('Admin criado com sucesso!');
    console.log('Email: admin@teste.com');
    console.log('Senha: 123456');
  }
  
  await connection.end();
}

createAdmin().catch(console.error);
