/**
 * Script para criar usuários diretamente no banco MySQL
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function criarUsuariosNoBanco() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        port: 3307,
        user: 'root',
        password: '12345678@',
        database: 'npjdatabase'
    });

    console.log('✅ Conectado ao banco MySQL');

    try {
        // Verificar se as tabelas existem
        const [tables] = await connection.execute("SHOW TABLES LIKE 'usuarios'");
        if (tables.length === 0) {
            console.log('❌ Tabela usuarios não existe. Executando criação...');
            
            // Criar tabela roles se não existir
            await connection.execute(`
                CREATE TABLE IF NOT EXISTS roles (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    nome VARCHAR(50) NOT NULL UNIQUE,
                    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            `);
            
            // Inserir roles padrão
            await connection.execute(`
                INSERT IGNORE INTO roles (nome) VALUES 
                ('admin'), ('professor'), ('aluno')
            `);
            
            // Criar tabela usuarios
            await connection.execute(`
                CREATE TABLE IF NOT EXISTS usuarios (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    nome VARCHAR(100) NOT NULL,
                    email VARCHAR(100) NOT NULL UNIQUE,
                    senha VARCHAR(255) NOT NULL,
                    role_id INT NOT NULL,
                    telefone VARCHAR(20),
                    ativo BOOLEAN DEFAULT TRUE,
                    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
                    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (role_id) REFERENCES roles(id)
                )
            `);
            
            console.log('✅ Tabelas criadas');
        }

        // Criar usuários de teste
        const usuarios = [
            {
                nome: 'Admin Sistema',
                email: 'admin@teste.com',
                senha: await bcrypt.hash('admin123', 10),
                role_id: 1, // admin
                telefone: '(65) 99999-0001'
            },
            {
                nome: 'Professor João',
                email: 'joao@teste.com', 
                senha: await bcrypt.hash('joao123', 10),
                role_id: 2, // professor
                telefone: '(65) 99999-0002'
            },
            {
                nome: 'Aluna Maria',
                email: 'maria@teste.com',
                senha: await bcrypt.hash('maria123', 10),
                role_id: 3, // aluno
                telefone: '(65) 99999-0003'
            }
        ];

        for (const usuario of usuarios) {
            try {
                await connection.execute(
                    `INSERT INTO usuarios (nome, email, senha, role_id, telefone, ativo, criado_em, createdAt, updatedAt) 
                     VALUES (?, ?, ?, ?, ?, 1, NOW(), NOW(), NOW())
                     ON DUPLICATE KEY UPDATE nome = VALUES(nome)`,
                    [usuario.nome, usuario.email, usuario.senha, usuario.role_id, usuario.telefone]
                );
                console.log(`✅ Usuário criado/atualizado: ${usuario.nome} (${usuario.email})`);
            } catch (error) {
                console.log(`ℹ️  Usuário já existe: ${usuario.email}`);
            }
        }

        // Verificar usuários criados
        const [usuarios_criados] = await connection.execute(`
            SELECT u.id, u.nome, u.email, r.nome as role_nome 
            FROM usuarios u 
            JOIN roles r ON u.role_id = r.id 
            ORDER BY u.id
        `);

        console.log('\n📋 Usuários no sistema:');
        usuarios_criados.forEach(user => {
            console.log(`   ID: ${user.id} | ${user.nome} (${user.email}) | Role: ${user.role_nome}`);
        });

    } catch (error) {
        console.error('❌ Erro:', error);
    } finally {
        await connection.end();
        console.log('🔌 Conexão fechada');
    }
}

// Executar
criarUsuariosNoBanco().catch(console.error);
