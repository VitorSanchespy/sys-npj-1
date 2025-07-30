/**
 * Migration: Create agendamentos table
 * Created: 2025-07-29
 * Description: Tabela para gerenciar agendamentos do sistema
 */

const mysql = require('mysql2/promise');

const migration = {
  up: async (connection) => {
    console.log('🔧 Criando tabela: agendamentos');
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS agendamentos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        processo_id INT NULL,
        usuario_id INT NOT NULL,
        tipo_evento ENUM('audiencia', 'prazo', 'reuniao', 'diligencia', 'outro') NOT NULL,
        titulo VARCHAR(200) NOT NULL,
        descricao TEXT NULL,
        data_evento DATETIME NOT NULL,
        local VARCHAR(255) NULL,
        status ENUM('agendado', 'realizado', 'cancelado', 'adiado') DEFAULT 'agendado',
        lembrete_1_dia BOOLEAN DEFAULT 1,
        lembrete_2_dias BOOLEAN DEFAULT 1,
        lembrete_1_semana BOOLEAN DEFAULT 0,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_processo_id (processo_id),
        INDEX idx_usuario_id (usuario_id),
        INDEX idx_data_evento (data_evento),
        INDEX idx_status (status),
        
        FOREIGN KEY (processo_id) REFERENCES processos(id) ON DELETE SET NULL,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);
    
    console.log('✅ Tabela agendamentos criada com sucesso');
  },

  down: async (connection) => {
    console.log('🔧 Removendo tabela: agendamentos');
    await connection.execute('DROP TABLE IF EXISTS agendamentos');
    console.log('✅ Tabela agendamentos removida');
  }
};

module.exports = migration;
