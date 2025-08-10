// Script para verificar os IDs das roles no banco de dados
require('dotenv').config();
const Sequelize = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME || 'npjdatabase',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
        dialect: 'mysql',
        logging: false
    }
);

const Role = sequelize.define('Role', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    nome: { type: Sequelize.STRING(50), allowNull: false, unique: true }
}, { tableName: 'roles', timestamps: false });

async function verificarRoles() {
    try {
        await sequelize.authenticate();
        console.log('🔍 Verificando IDs das roles no banco de dados...\n');

        const roles = await Role.findAll({
            order: [['id', 'ASC']]
        });

        console.log('📋 ROLES ENCONTRADAS:');
        console.log('====================');
        roles.forEach(role => {
            console.log(`ID: ${role.id} - Nome: "${role.nome}"`);
        });

        console.log('\n🎯 RESUMO:');
        const alunoRole = roles.find(r => r.nome === 'Aluno');
        const professorRole = roles.find(r => r.nome === 'Professor');
        const adminRole = roles.find(r => r.nome === 'Admin');

        if (alunoRole) {
            console.log(`✅ Aluno: ID = ${alunoRole.id}`);
        } else {
            console.log('❌ Role "Aluno" não encontrada');
        }

        if (professorRole) {
            console.log(`✅ Professor: ID = ${professorRole.id}`);
        } else {
            console.log('❌ Role "Professor" não encontrada');
        }

        if (adminRole) {
            console.log(`✅ Admin: ID = ${adminRole.id}`);
        } else {
            console.log('❌ Role "Admin" não encontrada');
        }

        console.log('\n💡 Para registrar como Aluno, use role_id =', alunoRole ? alunoRole.id : 'N/A');

    } catch (error) {
        console.error('❌ Erro:', error.message);
    } finally {
        await sequelize.close();
    }
}

verificarRoles();
