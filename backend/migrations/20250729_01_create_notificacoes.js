/**
 * Migration: Create notificacoes table
 * Created: 2025-07-29
 * Description: Tabela para gerenciar notificações do sistema
 */

const mysql = require('mysql2/promise');

const migration = {
  up: async (connection) => {
    console.log('🔧 Criando tabela: notificacoes');
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS notificacoes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT NOT NULL,
        processo_id INT NULL,
        agendamento_id INT NULL,
        tipo ENUM('lembrete', 'alerta', 'informacao', 'sistema') NOT NULL,
        titulo VARCHAR(200) NOT NULL,
        mensagem TEXT NOT NULL,
        canal ENUM('email', 'sistema', 'ambos') DEFAULT 'sistema',
        status ENUM('pendente', 'enviado', 'lido', 'erro') DEFAULT 'pendente',
        data_envio DATETIME NULL,
        data_leitura DATETIME NULL,
        tentativas INT DEFAULT 0,
        erro_detalhes TEXT NULL,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        
        INDEX idx_usuario_id (usuario_id),
        INDEX idx_processo_id (processo_id),
        INDEX idx_status (status),
        INDEX idx_data_envio (data_envio),
        
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);
    
    console.log('✅ Tabela notificacoes criada com sucesso');
  },

  down: async (connection) => {
    console.log('🔧 Removendo tabela: notificacoes');
    await connection.execute('DROP TABLE IF EXISTS notificacoes');
    console.log('✅ Tabela notificacoes removida');
  }
};

module.exports = migration;
