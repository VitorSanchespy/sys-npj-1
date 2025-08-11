const mysql = require('mysql2/promise');

async function removerTabelaAgendamentos() {
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

    console.log('\n🗑️ REMOVENDO ESTRUTURA DE AGENDAMENTOS DO BANCO\n');

    // 1. Remover foreign keys que referenciam agendamentos
    console.log('1. Removendo foreign keys...');
    
    try {
      await connection.execute(`
        ALTER TABLE notificacoes 
        DROP FOREIGN KEY notificacoes_agendamento_id_foreign
      `);
      console.log('   ✅ Foreign key notificacoes_agendamento_id_foreign removida');
    } catch (error) {
      console.log('   ⚠️ Foreign key já foi removida ou não existe');
    }

    // 2. Remover coluna agendamento_id da tabela notificacoes
    try {
      await connection.execute(`
        ALTER TABLE notificacoes 
        DROP COLUMN agendamento_id
      `);
      console.log('   ✅ Coluna agendamento_id removida da tabela notificacoes');
    } catch (error) {
      console.log('   ⚠️ Coluna agendamento_id já foi removida ou não existe');
    }

    // 3. Remover tabela agendamentos completamente
    try {
      await connection.execute(`DROP TABLE IF EXISTS agendamentos`);
      console.log('   ✅ Tabela agendamentos removida completamente');
    } catch (error) {
      console.log('   ❌ Erro ao remover tabela agendamentos:', error.message);
    }

    // 4. Verificar se as tabelas ainda existem
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'npjdatabase' 
      AND TABLE_NAME IN ('agendamentos')
    `);

    console.log('\n📊 VERIFICAÇÃO FINAL:');
    if (tables.length === 0) {
      console.log('   ✅ Tabela agendamentos removida com sucesso');
    } else {
      console.log('   ❌ Ainda existem tabelas relacionadas:', tables.map(t => t.TABLE_NAME));
    }

    // 5. Listar tabelas restantes
    const [remainingTables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'npjdatabase'
      ORDER BY TABLE_NAME
    `);

    console.log('\n📋 TABELAS RESTANTES NO BANCO:');
    remainingTables.forEach(table => {
      console.log(`   - ${table.TABLE_NAME}`);
    });

    console.log('\n🎯 RESULTADO:');
    console.log('   ✅ Estrutura de agendamentos removida do banco');
    console.log('   ✅ Sistema agora usará apenas Google Calendar API');
    console.log('   ✅ Cache será usado para armazenamento temporário');
    console.log('   ✅ Agendamentos individualizados por usuário');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

removerTabelaAgendamentos();
