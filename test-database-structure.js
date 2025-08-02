const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function testBankStructure() {
  console.log('🔍 Testando estrutura do banco de dados...\n');
  
  try {
    // Conectar ao banco
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'npjdatabase',
      multipleStatements: true
    });

    console.log('✅ Conexão com banco estabelecida\n');

    // Verificar se as tabelas existem
    const requiredTables = [
      'roles', 'usuarios', 'processos', 'arquivos',
      'agendamentos', 'notificacoes', 'configuracoes_notificacao',
      'refresh_tokens', 'atualizacoes_processo', 'usuarios_processo',
      'diligencia', 'fase', 'materia_assunto', 'local_tramitacao'
    ];

    console.log('📋 Verificando tabelas existentes:');
    const [tables] = await connection.execute('SHOW TABLES');
    const existingTables = tables.map(t => Object.values(t)[0]);
    
    let missingTables = [];
    
    for (const table of requiredTables) {
      if (existingTables.includes(table)) {
        console.log(`✅ ${table}`);
      } else {
        console.log(`❌ ${table} - FALTANDO`);
        missingTables.push(table);
      }
    }

    if (missingTables.length > 0) {
      console.log(`\n🚨 ATENÇÃO: ${missingTables.length} tabelas faltando:`);
      missingTables.forEach(table => console.log(`   - ${table}`));
      console.log('\n💡 Solução: Execute o arquivo db/init-complete.sql');
    } else {
      console.log('\n🎉 Todas as tabelas necessárias estão presentes!');
    }

    // Verificar estrutura da tabela agendamentos (se existir)
    if (existingTables.includes('agendamentos')) {
      console.log('\n🔍 Verificando estrutura da tabela agendamentos:');
      const [columns] = await connection.execute('DESCRIBE agendamentos');
      const requiredColumns = ['id', 'usuario_id', 'processo_id', 'criado_por', 'tipo_evento', 'titulo', 'data_evento'];
      
      for (const col of requiredColumns) {
        const exists = columns.find(c => c.Field === col);
        if (exists) {
          console.log(`✅ ${col} (${exists.Type})`);
        } else {
          console.log(`❌ ${col} - FALTANDO`);
        }
      }
    }

    // Verificar estrutura da tabela notificacoes (se existir)
    if (existingTables.includes('notificacoes')) {
      console.log('\n🔍 Verificando estrutura da tabela notificacoes:');
      const [columns] = await connection.execute('DESCRIBE notificacoes');
      const requiredColumns = ['id', 'usuario_id', 'tipo', 'titulo', 'mensagem', 'status'];
      
      for (const col of requiredColumns) {
        const exists = columns.find(c => c.Field === col);
        if (exists) {
          console.log(`✅ ${col} (${exists.Type})`);
        } else {
          console.log(`❌ ${col} - FALTANDO`);
        }
      }
    }

    // Verificar migrations executadas
    if (existingTables.includes('sequelizemeta')) {
      console.log('\n📝 Migrations executadas:');
      const [migrations] = await connection.execute('SELECT name FROM sequelizemeta ORDER BY name');
      migrations.forEach(m => console.log(`✅ ${m.name}`));
    } else {
      console.log('\n⚠️ Tabela sequelizemeta não encontrada');
    }

    await connection.end();
    console.log('\n🏁 Teste concluído!');

  } catch (error) {
    console.error('❌ Erro ao testar banco:', error.message);
    
    if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('\n💡 Solução: Crie o banco de dados primeiro:');
      console.log('   CREATE DATABASE npjdatabase;');
    }
  }
}

// Executar teste
testBankStructure();
