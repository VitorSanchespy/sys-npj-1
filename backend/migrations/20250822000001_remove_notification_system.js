/**
 * Migration para remoção das tabelas de notificação
 * Remove o sistema de notificação legado substituído por Toast
 * Data: 22/08/2025
 */
module.exports = {
  async up(connection) {
    console.log('🗑️  Removendo sistema de notificações legado...\n');

    try {
      // Remover tabela de configurações de notificação primeiro (FK constraint)
      await connection.execute(`DROP TABLE IF EXISTS configuracoes_notificacao`);
      console.log('✅ Tabela configuracoes_notificacao removida');

      // Remover tabela de notificações
      await connection.execute(`DROP TABLE IF EXISTS notificacoes`);
      console.log('✅ Tabela notificacoes removida');

      console.log('\n🎉 Sistema de notificações legado removido com sucesso!');
      console.log('💡 Sistema substituído por Toast notifications no frontend');
    } catch (error) {
      console.error('❌ Erro ao remover tabelas de notificação:', error.message);
      throw error;
    }
  },

  async down(connection) {
    console.log('⚠️  Revertendo remoção das tabelas de notificação...\n');

    // Recriar tabela notificacoes
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

    // Recriar tabela configuracoes_notificacao
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS configuracoes_notificacao (
        id INT NOT NULL AUTO_INCREMENT,
        usuario_id INT NOT NULL,
        email_lembretes TINYINT(1) DEFAULT 1,
        email_alertas TINYINT(1) DEFAULT 1,
        email_atualizacoes TINYINT(1) DEFAULT 0,
        sistema_lembretes TINYINT(1) DEFAULT 1,
        sistema_alertas TINYINT(1) DEFAULT 1,
        sistema_atualizacoes TINYINT(1) DEFAULT 1,
        dias_alerta_sem_atualizacao INT DEFAULT 30,
        horario_preferido_email TIME DEFAULT '09:00:00',
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY unique_usuario_config (usuario_id),
        KEY idx_usuario_id (usuario_id),
        CONSTRAINT configuracoes_notificacao_usuario_id_foreign FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
    `);

    console.log('✅ Tabelas de notificação recriadas');
  }
};
