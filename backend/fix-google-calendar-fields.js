const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function addGoogleCalendarFields() {
  let connection;
  
  try {
    console.log('🔗 Conectando ao banco de dados MySQL...');
    
    // Criar conexão com o banco
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '1234',
      database: 'npjdatabase'
    });

    console.log('✅ Conectado ao banco de dados!');
    
    // Lista de colunas para adicionar
    const columns = [
      {
        name: 'html_link',
        definition: 'VARCHAR(500) NULL',
        comment: 'Link do evento no Google Calendar'
      },
      {
        name: 'attendees',
        definition: 'TEXT NULL',
        comment: 'Participantes do evento (JSON)'
      },
      {
        name: 'reminders_config',
        definition: 'TEXT NULL',
        comment: 'Configuração de lembretes (JSON)'
      },
      {
        name: 'email_sent',
        definition: 'BOOLEAN NOT NULL DEFAULT FALSE',
        comment: 'Se o e-mail de lembrete foi enviado'
      }
    ];
    
    console.log('� Verificando colunas existentes...');
    
    // Verificar quais colunas já existem
    const [existingColumns] = await connection.execute(
      'SHOW COLUMNS FROM AgendamentosProcesso'
    );
    
    const existingColumnNames = existingColumns.map(col => col.Field);
    console.log('📄 Colunas existentes:', existingColumnNames);
    
    // Adicionar apenas as colunas que não existem
    for (const column of columns) {
      if (!existingColumnNames.includes(column.name)) {
        console.log(`➕ Adicionando coluna '${column.name}'...`);
        
        const sql = `ALTER TABLE AgendamentosProcesso ADD COLUMN ${column.name} ${column.definition} COMMENT '${column.comment}'`;
        
        await connection.execute(sql);
        console.log(`✅ Coluna '${column.name}' adicionada com sucesso!`);
      } else {
        console.log(`⏭️  Coluna '${column.name}' já existe, pulando...`);
      }
    }
    
    console.log('🎉 Processo concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao executar script:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔚 Conexão fechada.');
    }
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  addGoogleCalendarFields();
}

module.exports = addGoogleCalendarFields;
