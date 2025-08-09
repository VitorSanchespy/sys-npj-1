/**
 * Migration Google Calendar Integration
 * Adiciona campos para integração com Google Calendar
 * Data: 09/08/2025
 */
module.exports = {
  async up(connection) {
    console.log('Iniciando migration Google Calendar...\n');

    // 1. Adicionar campos do Google Calendar na tabela usuarios
    try {
      await connection.execute(`
        ALTER TABLE usuarios 
        ADD COLUMN IF NOT EXISTS googleAccessToken TEXT NULL,
        ADD COLUMN IF NOT EXISTS googleRefreshToken TEXT NULL,
        ADD COLUMN IF NOT EXISTS googleCalendarConnected BOOLEAN DEFAULT FALSE
      `);
      console.log('✅ Campos Google Calendar adicionados na tabela usuarios');
    } catch (error) {
      // Tentar adicionar campos individualmente se der erro
      try {
        await connection.execute(`ALTER TABLE usuarios ADD COLUMN googleAccessToken TEXT NULL`);
      } catch (e) { /* Campo já existe */ }
      
      try {
        await connection.execute(`ALTER TABLE usuarios ADD COLUMN googleRefreshToken TEXT NULL`);
      } catch (e) { /* Campo já existe */ }
      
      try {
        await connection.execute(`ALTER TABLE usuarios ADD COLUMN googleCalendarConnected BOOLEAN DEFAULT FALSE`);
      } catch (e) { /* Campo já existe */ }
      
      console.log('✅ Campos Google Calendar verificados na tabela usuarios');
    }

    // 2. Adicionar campo googleEventId na tabela agendamentos
    try {
      await connection.execute(`
        ALTER TABLE agendamentos 
        ADD COLUMN IF NOT EXISTS googleEventId VARCHAR(255) NULL COMMENT 'ID do evento no Google Calendar'
      `);
      console.log('✅ Campo googleEventId adicionado na tabela agendamentos');
    } catch (error) {
      try {
        await connection.execute(`ALTER TABLE agendamentos ADD COLUMN googleEventId VARCHAR(255) NULL COMMENT 'ID do evento no Google Calendar'`);
      } catch (e) { /* Campo já existe */ }
      console.log('✅ Campo googleEventId verificado na tabela agendamentos');
    }

    console.log('\n✅ Migration Google Calendar concluída!');
  },

  async down(connection) {
    console.log('Removendo campos Google Calendar...\n');

    // Remover campos da tabela usuarios
    try {
      await connection.execute(`ALTER TABLE usuarios DROP COLUMN IF EXISTS googleAccessToken`);
      await connection.execute(`ALTER TABLE usuarios DROP COLUMN IF EXISTS googleRefreshToken`);
      await connection.execute(`ALTER TABLE usuarios DROP COLUMN IF EXISTS googleCalendarConnected`);
      console.log('✅ Campos Google Calendar removidos da tabela usuarios');
    } catch (error) {
      console.log('⚠️ Erro ao remover campos da tabela usuarios:', error.message);
    }

    // Remover campo da tabela agendamentos
    try {
      await connection.execute(`ALTER TABLE agendamentos DROP COLUMN IF EXISTS googleEventId`);
      console.log('✅ Campo googleEventId removido da tabela agendamentos');
    } catch (error) {
      console.log('⚠️ Erro ao remover campo da tabela agendamentos:', error.message);
    }

    console.log('\n✅ Rollback Google Calendar concluído!');
  }
};
