/**
 * Migration para adicionar campo titulo à tabela processos
 * Data: 11/08/2025
 * Motivo: Alinhamento entre frontend e backend - campo obrigatório
 */

module.exports = {
  async up(connection) {
    console.log('Adicionando campo titulo à tabela processos...');
    
    try {
      // Verificar se a coluna já existe
      const [rows] = await connection.execute(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'processos' 
        AND COLUMN_NAME = 'titulo'
      `);
      
      if (rows.length === 0) {
        // Adicionar a coluna titulo após numero_processo
        await connection.execute(`
          ALTER TABLE processos 
          ADD COLUMN titulo VARCHAR(255) NOT NULL DEFAULT 'Processo sem título' 
          AFTER numero_processo
        `);
        console.log('✅ Campo titulo adicionado com sucesso');
        
        // Remover o valor padrão após a adição
        await connection.execute(`
          ALTER TABLE processos 
          ALTER COLUMN titulo DROP DEFAULT
        `);
        console.log('✅ Valor padrão removido do campo titulo');
      } else {
        console.log('⚠️ Campo titulo já existe na tabela processos');
      }
    } catch (error) {
      console.error('❌ Erro ao adicionar campo titulo:', error);
      throw error;
    }
  },

  async down(connection) {
    console.log('Removendo campo titulo da tabela processos...');
    
    try {
      // Verificar se a coluna existe antes de tentar removê-la
      const [rows] = await connection.execute(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'processos' 
        AND COLUMN_NAME = 'titulo'
      `);
      
      if (rows.length > 0) {
        await connection.execute(`
          ALTER TABLE processos 
          DROP COLUMN titulo
        `);
        console.log('✅ Campo titulo removido com sucesso');
      } else {
        console.log('⚠️ Campo titulo não existe na tabela processos');
      }
    } catch (error) {
      console.error('❌ Erro ao remover campo titulo:', error);
      throw error;
    }
  }
};
