// Script para criar usuário administrador padrão do sistema
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function createAdmin() {
  // Carregar configuração do banco
  const configPath = path.join(__dirname, '..', '..', 'backend', 'config', 'config.json');
  let dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'npjdatabase'
  };

  if (fs.existsSync(configPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      if (config.development) {
        dbConfig = {
          host: config.development.host,
          user: config.development.username,
          password: config.development.password,
          database: config.development.database
        };
      }
    } catch (e) {
      console.log('⚠️ Usando configuração padrão do banco');
    }
  }

  const connection = await mysql.createConnection(dbConfig);

  const hashedPassword = await bcrypt.hash('123456', 10);
  
  // Verificar se admin já existe
  const [existingUser] = await connection.execute('SELECT id FROM usuarios WHERE email = ?', ['admin@teste.com']);
  
  if (existingUser.length > 0) {
    console.log('✅ Admin já existe!');
    console.log('📧 Email: admin@teste.com');
    console.log('🔑 Senha: 123456');
  } else {
    // Criar novo admin (role_id 1 = Admin)
    await connection.execute(
      'INSERT INTO usuarios (nome, email, senha, role_id, ativo) VALUES (?, ?, ?, ?, ?)',
      ['Admin Teste', 'admin@teste.com', hashedPassword, 1, 1]
    );
    
    console.log('✅ Admin criado com sucesso!');
    console.log('📧 Email: admin@teste.com');
    console.log('🔑 Senha: 123456');
  }
  
  await connection.end();
}

createAdmin().catch(console.error);
