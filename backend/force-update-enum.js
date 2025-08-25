const sequelize = require('./utils/sequelize');

async function forceUpdateEnum() {
  try {
    console.log('🔧 Forçando atualização do enum status...');
    
    // Método alternativo - Primeiro adicionar uma coluna temporária
    console.log('➕ Adicionando coluna temporária...');
    await sequelize.query(`
      ALTER TABLE agendamentos 
      ADD COLUMN status_new ENUM(
        'em_analise', 
        'pendente', 
        'enviando_convites', 
        'agendado', 
        'marcado', 
        'cancelado', 
        'finalizado', 
        'confirmado', 
        'realizado', 
        'reagendado',
        'aprovado',
        'recusado'
      ) NOT NULL DEFAULT 'em_analise'
    `);
    
    // Copiar dados da coluna antiga para nova (mapeando valores)
    console.log('📋 Copiando dados com mapeamento...');
    await sequelize.query(`
      UPDATE agendamentos SET 
      status_new = CASE 
        WHEN status = 'agendado' THEN 'agendado'
        WHEN status = 'confirmado' THEN 'agendado'
        WHEN status = 'realizado' THEN 'finalizado'
        WHEN status = 'cancelado' THEN 'cancelado'
        WHEN status = 'reagendado' THEN 'agendado'
        ELSE 'em_analise'
      END
    `);
    
    // Remover coluna antiga
    console.log('🗑️ Removendo coluna antiga...');
    await sequelize.query('ALTER TABLE agendamentos DROP COLUMN status');
    
    // Renomear nova coluna
    console.log('📝 Renomeando nova coluna...');
    await sequelize.query(`ALTER TABLE agendamentos CHANGE status_new status ENUM(
        'em_analise', 
        'pendente', 
        'enviando_convites', 
        'agendado', 
        'marcado', 
        'cancelado', 
        'finalizado', 
        'confirmado', 
        'realizado', 
        'reagendado',
        'aprovado',
        'recusado'
      ) NOT NULL DEFAULT 'em_analise'`);
    
    console.log('✅ Enum atualizado com sucesso!');
    
    // Verificar resultado final
    const [statusInfo] = await sequelize.query(`
      SELECT COLUMN_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'agendamentos' 
      AND COLUMN_NAME = 'status'
    `);
    
    console.log('📊 Enum final:', statusInfo[0].COLUMN_TYPE);
    
    // Verificar dados
    const [statusCount] = await sequelize.query(`
      SELECT status, COUNT(*) as count 
      FROM agendamentos 
      GROUP BY status
    `);
    
    console.log('📈 Distribuição de status:');
    statusCount.forEach(row => {
      console.log(`  - ${row.status}: ${row.count}`);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    
    // Cleanup em caso de erro
    try {
      await sequelize.query('ALTER TABLE agendamentos DROP COLUMN status_new');
      console.log('🧹 Cleanup realizado');
    } catch (cleanupError) {
      console.log('ℹ️ Nenhum cleanup necessário');
    }
  } finally {
    await sequelize.close();
  }
}

forceUpdateEnum();
