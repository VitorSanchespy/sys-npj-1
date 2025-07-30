/**
 * Migration: Create refresh_tokens table
 * Created: 2025-07-29
 * Description: Tabela para gerenciar tokens de refresh JWT
 */

const mysql = require('mysql2/promise');

const migration = {
  up: async (connection) => {
    console.log('🔧 Criando tabela: refresh_tokens');
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        token VARCHAR(256) NOT NULL UNIQUE,
        expires_at DATETIME NOT NULL,
        revoked BOOLEAN DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_user_id (user_id),
        INDEX idx_token (token),
        INDEX idx_expires_at (expires_at),
        
        FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);
    
    console.log('✅ Tabela refresh_tokens criada com sucesso');
  },

  down: async (connection) => {
    console.log('🔧 Removendo tabela: refresh_tokens');
    await connection.execute('DROP TABLE IF EXISTS refresh_tokens');
    console.log('✅ Tabela refresh_tokens removida');
  }
};

module.exports = migration;
