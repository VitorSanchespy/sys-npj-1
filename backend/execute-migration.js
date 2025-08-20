const sequelize = require('./utils/sequelize');

async function executeMigration() {
  try {
    console.log('🔧 Executando migração manual...');
    
    // Verificar se a coluna já existe
    const [results] = await sequelize.query(`
      SHOW COLUMNS FROM agendamentos WHERE Field = 'lembrete_1h_enviado'
    `);
    
    if (results.length > 0) {
      console.log('✅ Campo lembrete_1h_enviado já existe');
      process.exit(0);
    }
    
    // Adicionar a coluna
    await sequelize.query(`
      ALTER TABLE agendamentos 
      ADD COLUMN lembrete_1h_enviado BOOLEAN NOT NULL DEFAULT FALSE 
      COMMENT 'Lembrete 1 hora antes foi enviado'
    `);
    
    console.log('✅ Campo lembrete_1h_enviado adicionado com sucesso');
    
    // Verificar a estrutura da tabela
    const [tableInfo] = await sequelize.query('DESCRIBE agendamentos');
    console.log('📋 Estrutura da tabela agendamentos:');
    tableInfo.forEach(column => {
      if (column.Field.includes('lembrete')) {
        console.log(`  - ${column.Field}: ${column.Type} (${column.Null === 'YES' ? 'NULL' : 'NOT NULL'}) Default: ${column.Default}`);
      }
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro na migração:', error.message);
    process.exit(1);
  }
}

executeMigration();
