const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  console.log('🚀 Configurando banco de dados NPJ...\n');
  
  try {
    // Primeiro conectar sem database para criar se necessário
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true
    });

    console.log('✅ Conexão estabelecida\n');

    // Criar database se não existir
    const dbName = process.env.DB_NAME || 'npjdatabase';
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`✅ Database '${dbName}' criado/verificado\n`);

    // Conectar ao database específico
    await connection.changeUser({ database: dbName });

    // Ler e executar o init-complete.sql
    const sqlPath = path.join(__dirname, 'db', 'init-complete.sql');
    
    if (!fs.existsSync(sqlPath)) {
      console.log('❌ Arquivo init-complete.sql não encontrado');
      console.log(`   Procurado em: ${sqlPath}`);
      return;
    }

    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    console.log('📂 Arquivo init-complete.sql carregado\n');

    console.log('⚡ Executando script SQL...');
    await connection.execute(sqlContent);
    console.log('✅ Script executado com sucesso!\n');

    // Verificar tabelas criadas
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`📊 ${tables.length} tabelas criadas:`);
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`  ✅ ${tableName}`);
    });

    // Verificar dados inseridos
    const [roles] = await connection.execute('SELECT COUNT(*) as count FROM roles');
    const [diligencias] = await connection.execute('SELECT COUNT(*) as count FROM diligencia');
    const [fases] = await connection.execute('SELECT COUNT(*) as count FROM fase');
    
    console.log('\n📋 Dados iniciais inseridos:');
    console.log(`  ✅ Roles: ${roles[0].count}`);
    console.log(`  ✅ Diligências: ${diligencias[0].count}`);
    console.log(`  ✅ Fases: ${fases[0].count}`);

    await connection.end();
    console.log('\n🎉 Banco de dados NPJ configurado com sucesso!');
    console.log('🚀 Sistema pronto para uso!');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n💡 Verifique as credenciais do MySQL');
      console.log('   - Usuario: ' + (process.env.DB_USER || 'root'));
      console.log('   - Host: ' + (process.env.DB_HOST || 'localhost'));
    }
  }
}

// Executar setup
setupDatabase();
