require('dotenv').config();
const mysql = require('mysql2/promise');

async function createTestData() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'npjdatabase'
  });

  try {
    console.log('🔗 Conectado ao banco');

    // Criar alguns processos de teste
    await connection.execute(`
      INSERT IGNORE INTO processos (
        numero_processo, descricao, criado_em, status, tipo_processo, 
        idusuario_responsavel, sistema, assistido, contato_assistido
      ) VALUES 
      ('0001234-56.2025.8.11.0001', 'Ação de cobrança', NOW(), 'Em andamento', 'Cível', 1, 'PJE', 'João Silva', '(65) 99999-1111'),
      ('0002345-67.2025.5.23.0001', 'Reclamação trabalhista', NOW(), 'Em andamento', 'Trabalhista', 2, 'PEA', 'Maria Santos', '(65) 99999-2222'),
      ('0003456-78.2025.8.11.0002', 'Defesa criminal', NOW(), 'Em andamento', 'Criminal', 3, 'Físico', 'Pedro Oliveira', '(65) 99999-3333')
    `);

    console.log('✅ Processos de teste criados');

    // Verificar se foram criados
    const [rows] = await connection.execute('SELECT id, numero_processo, status FROM processos LIMIT 5');
    console.log('📋 Processos no banco:', rows.length);
    rows.forEach(row => {
      console.log(`  - ID: ${row.id}, Número: ${row.numero_processo}, Status: ${row.status}`);
    });

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await connection.end();
    console.log('🔌 Conexão fechada');
  }
}

createTestData();
