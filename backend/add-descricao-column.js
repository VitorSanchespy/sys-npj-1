const mysql = require('mysql2/promise');

async function addDescricaoColumn() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '123456',
      database: 'npj_db'
    });

    console.log('🔗 Conectado ao banco de dados');

    // Verificar se a coluna já existe
    const [columns] = await connection.execute(
      "SHOW COLUMNS FROM arquivos WHERE Field = 'descricao'"
    );

    if (columns.length === 0) {
      // Adicionar a coluna
      await connection.execute(
        "ALTER TABLE arquivos ADD COLUMN descricao TEXT NULL COMMENT 'Descrição do arquivo fornecida pelo usuário'"
      );
      console.log('✅ Coluna descricao adicionada à tabela arquivos');
    } else {
      console.log('ℹ️ Coluna descricao já existe na tabela arquivos');
    }

    await connection.end();
    console.log('🔚 Conexão fechada');
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

addDescricaoColumn();
