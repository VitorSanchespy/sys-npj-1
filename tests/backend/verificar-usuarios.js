require('dotenv').config({ path: './backend/.env' });
const mysql = require('mysql2/promise');

async function verificarUsuarios() {
  try {
    console.log('🔍 Conectando ao banco de dados...');
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3307,
      user: process.env.DB_USER || 'db_user',
      password: process.env.DB_PASSWORD || 'db_password',
      database: process.env.DB_NAME || 'NPJ'
    });
    
    console.log('✅ Conectado ao banco');
    
    // Verificar usuários
    console.log('\n👥 Usuários no banco:');
    const [usuarios] = await connection.execute('SELECT id, nome, email FROM usuarios LIMIT 10');
    console.table(usuarios);
    
    await connection.end();
    console.log('\n✅ Verificação concluída');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

verificarUsuarios();
