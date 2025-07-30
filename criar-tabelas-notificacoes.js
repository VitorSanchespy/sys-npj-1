/**
 * Script para criar tabela de notificações e agendamentos
 */

const mysql = require('mysql2/promise');

async function criarTabelasNotificacoes() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        port: 3307,
        user: 'root',
        password: '12345678@',
        database: 'npjdatabase'
    });

    console.log('✅ Conectado ao banco MySQL');

    try {
        // Criar tabela de notificações
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS notificacoes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                usuario_id INT NOT NULL,
                tipo VARCHAR(50) NOT NULL,
                titulo VARCHAR(200) NOT NULL,
                mensagem TEXT NOT NULL,
                dados_adicionais JSON,
                lida BOOLEAN DEFAULT FALSE,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
                INDEX idx_usuario_id (usuario_id),
                INDEX idx_tipo (tipo),
                INDEX idx_lida (lida)
            )
        `);
        console.log('✅ Tabela notificacoes criada/verificada');

        // Criar tabela de agendamentos
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS agendamentos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                processo_id INT NULL,
                usuario_id INT NOT NULL,
                criado_por INT NOT NULL,
                tipo_evento ENUM('audiencia', 'prazo', 'reuniao', 'diligencia', 'outro') NOT NULL,
                titulo VARCHAR(200) NOT NULL,
                descricao TEXT,
                data_evento DATETIME NOT NULL,
                local VARCHAR(255),
                status ENUM('agendado', 'realizado', 'cancelado', 'adiado') DEFAULT 'agendado',
                lembrete_1_dia BOOLEAN DEFAULT TRUE,
                lembrete_2_dias BOOLEAN DEFAULT TRUE,
                lembrete_1_semana BOOLEAN DEFAULT FALSE,
                criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
                atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
                FOREIGN KEY (criado_por) REFERENCES usuarios(id) ON DELETE CASCADE,
                INDEX idx_usuario_id (usuario_id),
                INDEX idx_criado_por (criado_por),
                INDEX idx_data_evento (data_evento),
                INDEX idx_status (status)
            )
        `);
        console.log('✅ Tabela agendamentos criada/verificada');

        // Verificar estrutura das tabelas
        const [notif_structure] = await connection.execute("DESCRIBE notificacoes");
        console.log('\n📋 Estrutura da tabela notificacoes:');
        notif_structure.forEach(col => {
            console.log(`   ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(NULL)' : '(NOT NULL)'}`);
        });

        const [agend_structure] = await connection.execute("DESCRIBE agendamentos");
        console.log('\n📋 Estrutura da tabela agendamentos:');
        agend_structure.forEach(col => {
            console.log(`   ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(NULL)' : '(NOT NULL)'}`);
        });

    } catch (error) {
        console.error('❌ Erro:', error);
    } finally {
        await connection.end();
        console.log('🔌 Conexão fechada');
    }
}

// Executar
criarTabelasNotificacoes().catch(console.error);
