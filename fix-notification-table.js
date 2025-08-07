const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '1234',
      database: process.env.DB_NAME || 'npjdatabase'
    });require('mysql2/promise');
require('dotenv').config();

async function createNotificationConfigTable() {
  console.log('🔧 Criando/atualizando tabela configuracoes_notificacao...');
  
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'npjdatabase'
    });

    console.log('✅ Conectado ao banco de dados');

    // Primeiro, vamos verificar se a tabela existe
    const [tables] = await connection.execute(`
      SHOW TABLES LIKE 'configuracoes_notificacao'
    `);

    if (tables.length > 0) {
      console.log('📋 Tabela configuracoes_notificacao existe. Removendo...');
      await connection.execute('DROP TABLE configuracoes_notificacao');
    }

    // Criar a tabela com a estrutura correta
    await connection.execute(`
      CREATE TABLE configuracoes_notificacao (
        id INT NOT NULL AUTO_INCREMENT,
        usuario_id INT NOT NULL,
        email_lembretes TINYINT(1) DEFAULT 1,
        email_alertas TINYINT(1) DEFAULT 1,
        email_atualizacoes TINYINT(1) DEFAULT 0,
        sistema_lembretes TINYINT(1) DEFAULT 1,
        sistema_alertas TINYINT(1) DEFAULT 1,
        sistema_atualizacoes TINYINT(1) DEFAULT 1,
        dias_alerta_sem_atualizacao INT DEFAULT 30,
        horario_preferido_email TIME DEFAULT '09:00:00',
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY unique_usuario_config (usuario_id),
        KEY idx_usuario_id (usuario_id),
        CONSTRAINT configuracoes_notificacao_usuario_id_foreign 
          FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);

    console.log('✅ Tabela configuracoes_notificacao criada com sucesso!');

    // Verificar a estrutura da tabela
    const [columns] = await connection.execute(`
      DESCRIBE configuracoes_notificacao
    `);

    console.log('📊 Estrutura da tabela:');
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
    });

    await connection.end();
    console.log('🎉 Processo concluído com sucesso!');

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

createNotificationConfigTable();
