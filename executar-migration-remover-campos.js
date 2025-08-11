const mysql = require('mysql2/promise');

async function executarMigrationRemoverCampos() {
  let connection;
  
  try {
    // Configuração da conexão
    connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '1234',
      database: 'npjdatabase'
    });

    console.log('\n🔄 EXECUTANDO MIGRATION - REMOVER CAMPOS AGENDAMENTOS\n');

    // Executar a migration
    const migration = require('./backend/migrations/20250811000001_remover_campos_agendamentos.js');
    await migration.up(connection);

    // Verificar estado final do banco
    console.log('\n📋 VERIFICANDO ESTADO FINAL DO BANCO:');
    
    // Listar colunas da tabela notificacoes
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_COMMENT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'npjdatabase' 
      AND TABLE_NAME = 'notificacoes'
      ORDER BY ORDINAL_POSITION
    `);

    console.log('\n📊 ESTRUTURA ATUAL DA TABELA NOTIFICACOES:');
    columns.forEach(col => {
      console.log(`   - ${col.COLUMN_NAME}: ${col.DATA_TYPE} ${col.IS_NULLABLE === 'YES' ? '(nullable)' : '(not null)'}`);
      if (col.COLUMN_COMMENT) {
        console.log(`     // ${col.COLUMN_COMMENT}`);
      }
    });

    // Verificar se ainda existem tabelas relacionadas a agendamentos
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'npjdatabase' 
      AND TABLE_NAME LIKE '%agendamento%'
    `);

    console.log('\n📋 TABELAS RELACIONADAS A AGENDAMENTOS:');
    if (tables.length === 0) {
      console.log('   ✅ Nenhuma tabela de agendamentos encontrada (como esperado)');
    } else {
      tables.forEach(table => {
        console.log(`   - ${table.TABLE_NAME}`);
      });
    }

    console.log('\n✅ MIGRATION EXECUTADA COM SUCESSO!');
    console.log('🎯 Sistema agora usa apenas Google Calendar para agendamentos');

  } catch (error) {
    console.error('❌ Erro ao executar migration:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

executarMigrationRemoverCampos();
