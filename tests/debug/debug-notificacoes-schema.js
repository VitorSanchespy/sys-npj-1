require('dotenv').config({ path: './backend/.env' });
const mysql = require('mysql2/promise');

async function verificarSchema() {
  try {
    console.log('🔍 Conectando ao banco de dados...');
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3307,
      user: process.env.DB_USER || 'db_user',
      password: process.env.DB_PASSWORD || 'db_password',
      database: process.env.DB_NAME || 'NPJ'
    });
    
    console.log('✅ Conectado ao banco');
    
    // Verificar estrutura da tabela notificacoes
    console.log('\n📋 Estrutura da tabela notificacoes:');
    const [structure] = await connection.execute('DESCRIBE notificacoes');
    console.table(structure);
    
    // Verificar valores do ENUM tipo
    console.log('\n🔍 Detalhes do campo tipo:');
    const tipoField = structure.find(field => field.Field === 'tipo');
    if (tipoField) {
      console.log('Tipo do campo:', tipoField.Type);
      console.log('Valores permitidos:', tipoField.Type.match(/enum\((.*?)\)/)?.[1]);
    }
    
    // Verificar outros ENUMs
    console.log('\n🔍 Todos os campos ENUM:');
    structure.forEach(field => {
      if (field.Type.includes('enum')) {
        console.log(`Campo ${field.Field}:`, field.Type);
      }
    });
    
    await connection.end();
    console.log('\n✅ Análise concluída');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

verificarSchema();
