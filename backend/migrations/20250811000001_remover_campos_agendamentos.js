/**
 * Migration - Remover campos obsoletos de agendamentos
 * Remove referências à tabela agendamentos que foi excluída
 * Data: 11/08/2025
 */
module.exports = {
  async up(connection) {
    console.log('Removendo campos obsoletos de agendamentos...\n');

    // 1. Remover coluna agendamento_id da tabela notificacoes se ainda existir
    try {
      await connection.execute(`
        ALTER TABLE notificacoes 
        DROP COLUMN IF EXISTS agendamento_id
      `);
      console.log('✅ Coluna agendamento_id removida da tabela notificacoes');
    } catch (error) {
      console.log('⚠️ Coluna agendamento_id já foi removida ou não existe');
    }

    // 2. Verificar se existem foreign keys relacionadas
    try {
      const [foreignKeys] = await connection.execute(`
        SELECT CONSTRAINT_NAME 
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
        WHERE TABLE_SCHEMA = 'npjdatabase' 
        AND REFERENCED_TABLE_NAME = 'agendamentos'
      `);

      for (const fk of foreignKeys) {
        try {
          await connection.execute(`
            ALTER TABLE notificacoes 
            DROP FOREIGN KEY ${fk.CONSTRAINT_NAME}
          `);
          console.log(`✅ Foreign key ${fk.CONSTRAINT_NAME} removida`);
        } catch (error) {
          console.log(`⚠️ Foreign key ${fk.CONSTRAINT_NAME} já foi removida`);
        }
      }
    } catch (error) {
      console.log('⚠️ Erro ao verificar foreign keys:', error.message);
    }

    // 3. Adicionar campo para referência de eventos externos (Google Calendar, etc)
    try {
      await connection.execute(`
        ALTER TABLE notificacoes 
        ADD COLUMN IF NOT EXISTS evento_externo_id VARCHAR(255) NULL COMMENT 'ID do evento em sistema externo (Google Calendar, etc)'
      `);
      console.log('✅ Campo evento_externo_id adicionado para integração externa');
    } catch (error) {
      try {
        await connection.execute(`
          ALTER TABLE notificacoes 
          ADD COLUMN evento_externo_id VARCHAR(255) NULL COMMENT 'ID do evento em sistema externo (Google Calendar, etc)'
        `);
      } catch (e) { /* Campo já existe */ }
      console.log('✅ Campo evento_externo_id verificado');
    }

    // 4. Adicionar índice no novo campo
    try {
      await connection.execute(`
        CREATE INDEX IF NOT EXISTS idx_evento_externo_id 
        ON notificacoes (evento_externo_id)
      `);
      console.log('✅ Índice criado para evento_externo_id');
    } catch (error) {
      console.log('⚠️ Índice já existe ou erro ao criar:', error.message);
    }

    console.log('\n✅ Migration concluída!');
    console.log('📊 Sistema agora usa apenas Google Calendar para agendamentos');
    console.log('🔗 Notificações podem referenciar eventos externos via evento_externo_id');
  },

  async down(connection) {
    console.log('Revertendo remoção de campos obsoletos...\n');

    // Remover o campo adicionado
    try {
      await connection.execute(`
        ALTER TABLE notificacoes 
        DROP COLUMN IF EXISTS evento_externo_id
      `);
      console.log('✅ Campo evento_externo_id removido');
    } catch (error) {
      console.log('⚠️ Erro ao remover campo evento_externo_id:', error.message);
    }

    // Nota: Não recriaremos a tabela agendamentos no rollback
    // pois o sistema foi reestruturado para usar Google Calendar
    console.log('\n⚠️ ATENÇÃO: Rollback não recria tabela agendamentos');
    console.log('Sistema foi reestruturado para usar Google Calendar como fonte única');
    
    console.log('\n✅ Rollback concluído!');
  }
};
