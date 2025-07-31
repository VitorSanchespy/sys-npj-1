const mysql = require('mysql2/promise');

async function testarAPIDirecta() {
    let connection;
    
    try {
        // Conectar ao banco
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '12345678@',
            database: 'npjdatabase',
            port: 3306
        });

        console.log('✅ Conectado ao banco de dados');

        // Testar query que está falhando
        console.log('\n🔹 Testando query do endpoint detalhes...');
        const [resultado] = await connection.execute(`
            SELECT 
                p.*,
                u.nome as usuario_responsavel,
                ma.nome as materia_assunto,
                f.nome as fase,
                lt.nome as local_tramitacao
            FROM processos p
            LEFT JOIN usuarios u ON p.idusuario_responsavel = u.id
            LEFT JOIN materia_assunto ma ON p.materia_assunto_id = ma.id
            LEFT JOIN fase f ON p.fase_id = f.id
            LEFT JOIN local_tramitacao lt ON p.local_tramitacao_id = lt.id
            WHERE p.id = ?
        `, [1]);

        console.log('📋 Resultado da query:');
        console.table(resultado);

        if (resultado.length > 0) {
            console.log('\n✅ Query funciona corretamente!');
        } else {
            console.log('\n❌ Query não retornou resultados');
        }

    } catch (error) {
        console.error('❌ Erro:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

testarAPIDirecta();
