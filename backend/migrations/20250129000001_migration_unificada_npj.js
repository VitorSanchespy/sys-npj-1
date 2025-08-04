/**
 * Migration Unificada - NPJ Database
 * Atualiza banco existente para estrutura completa
 * Data: 29/01/2025
 */
module.exports = {
  async up(connection) {
    console.log('🚀 Iniciando migration unificada NPJ...\n');

    // 1. Criar tabela agendamentos se não existir
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS agendamentos (
        id INT NOT NULL AUTO_INCREMENT,
        processo_id INT DEFAULT NULL,
        usuario_id INT NOT NULL,
        criado_por INT NOT NULL,
        tipo_evento ENUM('audiencia','prazo','reuniao','diligencia','outro') NOT NULL,
        titulo VARCHAR(200) NOT NULL,
        descricao TEXT,
        data_evento DATETIME NOT NULL,
        local VARCHAR(255) DEFAULT NULL,
        status ENUM('agendado','realizado','cancelado','adiado') DEFAULT 'agendado',
        lembrete_1_dia TINYINT(1) DEFAULT 1,
        lembrete_2_dias TINYINT(1) DEFAULT 1,
        lembrete_1_semana TINYINT(1) DEFAULT 0,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_processo_id (processo_id),
        KEY idx_usuario_id (usuario_id),
        KEY idx_criado_por (criado_por),
        KEY idx_data_evento (data_evento),
        KEY idx_status (status),
        CONSTRAINT agendamentos_processo_id_foreign FOREIGN KEY (processo_id) REFERENCES processos (id) ON DELETE SET NULL,
        CONSTRAINT agendamentos_usuario_id_foreign FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE,
        CONSTRAINT agendamentos_criado_por_foreign FOREIGN KEY (criado_por) REFERENCES usuarios (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
    `);
    console.log('✅ Tabela agendamentos criada ou já existente');

    // 2. Criar tabela notificacoes se não existir
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS notificacoes (
        id INT NOT NULL AUTO_INCREMENT,
        usuario_id INT NOT NULL,
        processo_id INT DEFAULT NULL,
        agendamento_id INT DEFAULT NULL,
        tipo ENUM('lembrete','alerta','informacao','sistema') NOT NULL,
        titulo VARCHAR(200) NOT NULL,
        mensagem TEXT NOT NULL,
        canal ENUM('email','sistema','ambos') DEFAULT 'sistema',
        status ENUM('pendente','enviado','lido','erro') DEFAULT 'pendente',
        data_envio DATETIME DEFAULT NULL,
        data_leitura DATETIME DEFAULT NULL,
        tentativas INT DEFAULT 0,
        erro_detalhes TEXT,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        data_criacao TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
        createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_usuario_id (usuario_id),
        KEY idx_processo_id (processo_id),
        KEY idx_agendamento_id (agendamento_id),
        KEY idx_status (status),
        KEY idx_data_envio (data_envio),
        CONSTRAINT notificacoes_usuario_id_foreign FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE,
        CONSTRAINT notificacoes_processo_id_foreign FOREIGN KEY (processo_id) REFERENCES processos (id) ON DELETE SET NULL,
        CONSTRAINT notificacoes_agendamento_id_foreign FOREIGN KEY (agendamento_id) REFERENCES agendamentos (id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
    `);
    console.log('✅ Tabela notificacoes criada ou já existente');
  }
};
