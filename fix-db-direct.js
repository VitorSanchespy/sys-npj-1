const mysql = require('mysql2/promise');

async function corrigirAcessoProcesso() {
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

        // Verificar processos existentes
        console.log('\n📋 Processos existentes:');
        const [processos] = await connection.execute(
            'SELECT id, numero_processo, idusuario_responsavel FROM processos ORDER BY id'
        );
        console.table(processos);

        // Verificar estrutura da tabela usuarios
        console.log('\n🔍 Estrutura da tabela usuarios:');
        const [estrutura] = await connection.execute('DESCRIBE usuarios');
        console.table(estrutura);

        // Verificar usuários
        console.log('\n👥 Usuários existentes:');
        const [usuarios] = await connection.execute(
            'SELECT * FROM usuarios'
        );
        console.table(usuarios);

        // Verificar relações usuário-processo
        console.log('\n🔗 Relações usuário-processo:');
        const [relacoes] = await connection.execute(
            'SELECT * FROM usuarios_processo'
        );
        console.table(relacoes);

        // Verificar estrutura da tabela processos
        console.log('\n� Estrutura da tabela processos:');
        const [estruturaProcessos] = await connection.execute('DESCRIBE processos');
        console.table(estruturaProcessos);

        // Verificar estrutura da tabela usuarios_processo
        console.log('\n🔍 Estrutura da tabela usuarios_processo:');
        const [estruturaUsuariosProcesso] = await connection.execute('DESCRIBE usuarios_processo');
        console.table(estruturaUsuariosProcesso);

        // Dar acesso ao usuário 5 ao processo 4
        console.log('\n🔹 Dando acesso ao usuário 5 ao processo 4...');
        await connection.execute(`
            INSERT IGNORE INTO usuarios_processo (usuario_id, processo_id) 
            VALUES (?, ?)
        `, [5, 4]);

        // Verificar resultado
        console.log('\n✅ Verificando resultado final:');
        const [resultado] = await connection.execute(`
            SELECT 
                p.id as processo_id, 
                p.numero_processo, 
                u.nome as responsavel, 
                up.usuario_id as tem_acesso_usuario_id,
                u2.nome as usuario_com_acesso
            FROM processos p 
            LEFT JOIN usuarios u ON p.idusuario_responsavel = u.id 
            LEFT JOIN usuarios_processo up ON p.id = up.processo_id 
            LEFT JOIN usuarios u2 ON up.usuario_id = u2.id
            WHERE p.id = 4
        `);
        console.table(resultado);

        console.log('\n🎉 Correção concluída com sucesso!');
        console.log('O aluno (ID 5) agora deve ter acesso ao processo 4.');

    } catch (error) {
        console.error('❌ Erro:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Dica: Certifique-se de que o container MySQL esteja rodando e acessível na porta 3306');
        }
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

corrigirAcessoProcesso();
