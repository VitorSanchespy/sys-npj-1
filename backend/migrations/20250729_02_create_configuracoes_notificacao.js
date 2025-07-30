/**
 * Migration: Create configuracoes_notificacao table
 * Created: 2025-07-29
 * Description: Tabela para configurações de notificação dos usuários
 */

const mysql = require('mysql2/promise');

const migration = {
  up: async (connection) => {
    console.log('🔧 Criando tabela: configuracoes_notificacao');
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS configuracoes_notificacao (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT NOT NULL UNIQUE,
        email_lembretes BOOLEAN DEFAULT 1,
        email_alertas BOOLEAN DEFAULT 1,
        email_atualizacoes BOOLEAN DEFAULT 0,
        sistema_lembretes BOOLEAN DEFAULT 1,
        sistema_alertas BOOLEAN DEFAULT 1,
        sistema_atualizacoes BOOLEAN DEFAULT 1,
        dias_alerta_sem_atualizacao INT DEFAULT 30,
        horario_preferido_email TIME DEFAULT '09:00:00',
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_usuario_id (usuario_id),
        
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);
    
    console.log('✅ Tabela configuracoes_notificacao criada com sucesso');
  },

  down: async (connection) => {
    console.log('🔧 Removendo tabela: configuracoes_notificacao');
    await connection.execute('DROP TABLE IF EXISTS configuracoes_notificacao');
    console.log('✅ Tabela configuracoes_notificacao removida');
  }
};

module.exports = migration;
