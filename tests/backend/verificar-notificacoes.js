/**
 * Script para verificar notificações no banco
 */

const mysql = require('mysql2/promise');

async function verificarNotificacoes() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        port: 3307,
        user: 'root',
        password: '12345678@',
        database: 'npjdatabase'
    });

    console.log('✅ Conectado ao banco MySQL');

    try {
        // Verificar agendamentos recentes
        const [agendamentos] = await connection.execute(`
            SELECT id, titulo, usuario_id, criado_por, tipo_evento, status, criado_em
            FROM agendamentos 
            ORDER BY criado_em DESC 
            LIMIT 5
        `);

        console.log('\n📅 Agendamentos recentes:');
        agendamentos.forEach(agend => {
            console.log(`   ID: ${agend.id} | ${agend.titulo} | Usuario: ${agend.usuario_id} | Criado por: ${agend.criado_por}`);
            console.log(`      Status: ${agend.status} | Data: ${agend.criado_em}`);
        });

        // Verificar notificações
        const [notificacoes] = await connection.execute(`
            SELECT id, usuario_id, tipo, titulo, mensagem, status, data_envio
            FROM notificacoes 
            ORDER BY criado_em DESC 
            LIMIT 10
        `);

        console.log('\n📧 Notificações no banco:');
        if (notificacoes.length === 0) {
            console.log('   Nenhuma notificação encontrada');
        } else {
            notificacoes.forEach(notif => {
                console.log(`   ID: ${notif.id} | Usuario: ${notif.usuario_id} | Tipo: ${notif.tipo}`);
                console.log(`      ${notif.titulo}: ${notif.mensagem}`);
                console.log(`      Status: ${notif.status} | Data: ${notif.data_envio}`);
                console.log('');
            });
        }

        // Verificar últimas inserções
        const [logs] = await connection.execute(`
            SELECT TABLE_NAME, TABLE_ROWS 
            FROM information_schema.TABLES 
            WHERE TABLE_SCHEMA = 'npjdatabase' 
            AND TABLE_NAME IN ('usuarios', 'agendamentos', 'notificacoes')
        `);

        console.log('\n📊 Estatísticas das tabelas:');
        logs.forEach(table => {
            console.log(`   ${table.TABLE_NAME}: ${table.TABLE_ROWS} registros`);
        });

    } catch (error) {
        console.error('❌ Erro:', error);
    } finally {
        await connection.end();
        console.log('🔌 Conexão fechada');
    }
}

// Executar
verificarNotificacoes().catch(console.error);
