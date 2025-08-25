const sequelize = require('./utils/sequelize');

async function fixStatusEnum() {
  try {
    console.log('🔧 Corrigindo enum do status...');
    
    // Primeiro verificar o enum atual
    const [statusInfo] = await sequelize.query(`
      SELECT COLUMN_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'agendamentos' 
      AND COLUMN_NAME = 'status'
    `);
    
    console.log('📊 Enum atual do status:', statusInfo[0].COLUMN_TYPE);
    
    // Atualizar para incluir todos os status necessários
    await sequelize.query(`
      ALTER TABLE agendamentos 
      MODIFY COLUMN status ENUM(
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
    
    console.log('✅ Enum do status atualizado com sucesso!');
    
    // Verificar o resultado
    const [newStatusInfo] = await sequelize.query(`
      SELECT COLUMN_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'agendamentos' 
      AND COLUMN_NAME = 'status'
    `);
    
    console.log('📊 Novo enum do status:', newStatusInfo[0].COLUMN_TYPE);
    
  } catch (error) {
    console.error('❌ Erro ao corrigir enum:', error.message);
  } finally {
    await sequelize.close();
  }
}

fixStatusEnum();
