const sequelize = require('./utils/sequelize');

async function executeMigrationSistemaMelhorado() {
  try {
    console.log('🚀 Executando migração do Sistema Melhorado de Agendamentos...');
    
    // Verificar estrutura atual da tabela
    console.log('📋 Verificando estrutura atual da tabela agendamentos...');
    const [currentColumns] = await sequelize.query('DESCRIBE agendamentos');
    
    const existingColumns = currentColumns.map(col => col.Field);
    console.log('📊 Colunas existentes:', existingColumns);
    
    // Lista das colunas que precisamos adicionar
    const newColumns = [
      {
        name: 'data_convites_enviados',
        sql: 'ADD COLUMN data_convites_enviados DATETIME NULL COMMENT "Data quando os convites foram enviados para calcular expiração de 24h"'
      },
      {
        name: 'admin_notificado_rejeicoes',
        sql: 'ADD COLUMN admin_notificado_rejeicoes BOOLEAN NOT NULL DEFAULT FALSE COMMENT "Se admin já foi notificado sobre rejeições"'
      },
      {
        name: 'cancelado_por',
        sql: 'ADD COLUMN cancelado_por INT NULL COMMENT "ID do usuário que cancelou o agendamento"'
      }
    ];
    
    // Verificar e adicionar colunas que faltam
    console.log('\n🔧 Verificando colunas necessárias...');
    
    for (const column of newColumns) {
      if (!existingColumns.includes(column.name)) {
        console.log(`➕ Adicionando coluna: ${column.name}`);
        await sequelize.query(`ALTER TABLE agendamentos ${column.sql}`);
        console.log(`✅ Coluna ${column.name} adicionada com sucesso`);
      } else {
        console.log(`ℹ️  Coluna ${column.name} já existe`);
      }
    }
    
    // Verificar e atualizar enum do status
    console.log('\n🔧 Verificando enum do status...');
    const [statusInfo] = await sequelize.query(`
      SELECT COLUMN_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'agendamentos' 
      AND COLUMN_NAME = 'status'
    `);
    
    if (statusInfo.length > 0) {
      const currentEnum = statusInfo[0].COLUMN_TYPE;
      console.log(`📊 Enum atual do status: ${currentEnum}`);
      
      if (!currentEnum.includes('pendente')) {
        console.log('➕ Adicionando status "pendente" ao enum...');
        await sequelize.query(`
          ALTER TABLE agendamentos 
          MODIFY COLUMN status ENUM('em_analise', 'pendente', 'enviando_convites', 'marcado', 'cancelado', 'finalizado') 
          NOT NULL DEFAULT 'em_analise'
        `);
        console.log('✅ Status "pendente" adicionado ao enum');
      } else {
        console.log('ℹ️  Status "pendente" já existe no enum');
      }
    }
    
    // Verificar e criar tabela de logs
    console.log('\n🔧 Verificando tabela de logs...');
    const [tables] = await sequelize.query("SHOW TABLES LIKE 'logs_acoes'");
    
    if (tables.length === 0) {
      console.log('➕ Criando tabela logs_acoes...');
      await sequelize.query(`
        CREATE TABLE logs_acoes (
          id INT AUTO_INCREMENT PRIMARY KEY,
          usuario_id INT NULL,
          acao VARCHAR(100) NOT NULL,
          recurso VARCHAR(50) NOT NULL,
          recurso_id INT NULL,
          detalhes TEXT NULL,
          ip_address VARCHAR(45) NULL,
          user_agent TEXT NULL,
          data_acao DATETIME NOT NULL,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_usuario_id (usuario_id),
          INDEX idx_recurso_id (recurso, recurso_id),
          INDEX idx_data_acao (data_acao)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✅ Tabela logs_acoes criada com sucesso');
    } else {
      console.log('ℹ️  Tabela logs_acoes já existe');
    }
    
    // Verificar estrutura final
    console.log('\n📋 Verificando estrutura final da tabela agendamentos...');
    const [finalColumns] = await sequelize.query('DESCRIBE agendamentos');
    
    console.log('📊 Colunas após migração:');
    finalColumns.forEach(col => {
      if (['data_convites_enviados', 'admin_notificado_rejeicoes', 'cancelado_por'].includes(col.Field)) {
        console.log(`  ✅ ${col.Field}: ${col.Type} (${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}) Default: ${col.Default}`);
      }
    });
    
    console.log('\n🎉 Migração do Sistema Melhorado concluída com sucesso!');
    console.log('\n📋 RESUMO DAS ALTERAÇÕES:');
    console.log('  ✅ Coluna data_convites_enviados adicionada');
    console.log('  ✅ Coluna admin_notificado_rejeicoes adicionada');
    console.log('  ✅ Coluna cancelado_por adicionada');
    console.log('  ✅ Status "pendente" adicionado ao enum');
    console.log('  ✅ Tabela logs_acoes criada/verificada');
    console.log('\n🚀 Sistema pronto para funcionar com as melhorias!');
    
  } catch (error) {
    console.error('❌ Erro na migração:', error);
    console.error('📄 Detalhes:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

executeMigrationSistemaMelhorado();
