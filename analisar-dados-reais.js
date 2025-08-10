// Script para verificar dados reais do banco e corrigir dashboard
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

// Definir modelos para consulta
const Usuario = sequelize.define('Usuario', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    nome: { type: Sequelize.STRING(100), allowNull: false },
    email: { type: Sequelize.STRING(100), allowNull: false, unique: true },
    role_id: { type: Sequelize.INTEGER, allowNull: false },
    ativo: { type: Sequelize.BOOLEAN, defaultValue: true }
}, { tableName: 'usuarios', timestamps: false });

const Role = sequelize.define('Role', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    nome: { type: Sequelize.STRING(50), allowNull: false, unique: true }
}, { tableName: 'roles', timestamps: false });

const Processo = sequelize.define('Processo', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    numero_processo: { type: Sequelize.STRING, allowNull: false },
    descricao: { type: Sequelize.TEXT },
    status: { type: Sequelize.STRING },  
    tipo_processo: { type: Sequelize.STRING },
    idusuario_responsavel: { type: Sequelize.INTEGER },
    criado_em: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    data_encerramento: { type: Sequelize.DATE }
}, { tableName: 'processos', timestamps: false });

const UsuarioProcesso = sequelize.define('UsuarioProcesso', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    usuario_id: { type: Sequelize.INTEGER, allowNull: false },
    processo_id: { type: Sequelize.INTEGER, allowNull: false }
}, { tableName: 'usuarios_processo', timestamps: false });

const Agendamento = sequelize.define('Agendamento', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    processo_id: { type: Sequelize.INTEGER },
    usuario_id: { type: Sequelize.INTEGER, allowNull: false },
    titulo: { type: Sequelize.STRING(200), allowNull: false },
    status: { type: Sequelize.ENUM('agendado', 'concluido', 'cancelado'), defaultValue: 'agendado' },
    data_evento: { type: Sequelize.DATE, allowNull: false }
}, { tableName: 'agendamentos', timestamps: false });

async function analisarDadosReais() {
    try {
        await sequelize.authenticate();
        console.log('🔍 ANÁLISE DOS DADOS REAIS DO BANCO');
        console.log('=====================================\n');

        // 1. Verificar usuários
        console.log('👥 USUÁRIOS NO SISTEMA:');
        console.log('======================');
        const usuarios = await Usuario.findAll({
            include: [{ model: Role, as: 'role' }],
            order: [['id', 'ASC']]
        });

        usuarios.forEach(user => {
            console.log(`ID: ${user.id} | Nome: ${user.nome} | Email: ${user.email} | Role ID: ${user.role_id} | Ativo: ${user.ativo}`);
        });

        // 2. Verificar processos
        console.log('\n📋 PROCESSOS NO SISTEMA:');
        console.log('========================');
        const processos = await Processo.findAll({
            order: [['id', 'ASC']]
        });

        console.log(`Total de processos encontrados: ${processos.length}`);
        processos.forEach(proc => {
            console.log(`ID: ${proc.id} | Número: ${proc.numero_processo} | Status: ${proc.status} | Responsável: ${proc.idusuario_responsavel}`);
            console.log(`   Descrição: ${proc.descricao}`);
            console.log(`   Data Criação: ${proc.criado_em}`);
            console.log(`   Data Encerramento: ${proc.data_encerramento || 'N/A'}`);
        });

        // 3. Verificar vínculos usuário-processo
        console.log('\n🔗 VÍNCULOS USUÁRIO-PROCESSO:');
        console.log('=============================');
        const vinculos = await UsuarioProcesso.findAll({
            order: [['id', 'ASC']]
        });

        console.log(`Total de vínculos encontrados: ${vinculos.length}`);
        vinculos.forEach(vinculo => {
            console.log(`Usuário ID: ${vinculo.usuario_id} → Processo ID: ${vinculo.processo_id}`);
        });

        // 4. Verificar agendamentos
        console.log('\n📅 AGENDAMENTOS NO SISTEMA:');
        console.log('===========================');
        const agendamentos = await Agendamento.findAll({
            order: [['id', 'ASC']]
        });

        console.log(`Total de agendamentos encontrados: ${agendamentos.length}`);
        agendamentos.forEach(agenda => {
            console.log(`ID: ${agenda.id} | Usuário: ${agenda.usuario_id} | Processo: ${agenda.processo_id} | Título: ${agenda.titulo}`);
            console.log(`   Status: ${agenda.status} | Data: ${agenda.data_evento}`);
        });

        // 5. Análise por status de processo
        console.log('\n📊 ANÁLISE POR STATUS:');
        console.log('======================');
        const statusCount = await sequelize.query(`
            SELECT status, COUNT(*) as quantidade 
            FROM processos 
            GROUP BY status
        `, { type: Sequelize.QueryTypes.SELECT });

        statusCount.forEach(stat => {
            console.log(`Status "${stat.status}": ${stat.quantidade} processos`);
        });

        // 6. Análise por usuário (para dashboard)
        console.log('\n👤 PROCESSOS POR USUÁRIO:');
        console.log('=========================');
        for (const usuario of usuarios) {
            console.log(`\n👤 ${usuario.nome} (ID: ${usuario.id}):`);
            
            // Processos como responsável
            const processosResponsavel = await Processo.findAll({
                where: { 
                    idusuario_responsavel: usuario.id
                }
            });
            
            // Processos vinculados
            const processosVinculados = await sequelize.query(`
                SELECT p.* FROM processos p 
                INNER JOIN usuarios_processo up ON p.id = up.processo_id 
                WHERE up.usuario_id = ${usuario.id}
            `, { type: Sequelize.QueryTypes.SELECT });

            console.log(`   - Processos como responsável: ${processosResponsavel.length}`);
            console.log(`   - Processos vinculados: ${processosVinculados.length}`);
            
            if (processosResponsavel.length > 0) {
                console.log(`   - Status dos processos responsáveis:`);
                processosResponsavel.forEach(proc => {
                    console.log(`     * ${proc.numero_processo}: ${proc.status}`);
                });
            }

            if (processosVinculados.length > 0) {
                console.log(`   - Status dos processos vinculados:`);
                processosVinculados.forEach(proc => {
                    console.log(`     * ${proc.numero_processo}: ${proc.status}`);
                });
            }
        }

        console.log('\n✅ ANÁLISE CONCLUÍDA!');
        console.log('\n💡 Para corrigir o dashboard, precisamos ajustar as consultas SQL');
        console.log('   para refletir exatamente estes dados do banco.');

    } catch (error) {
        console.error('❌ Erro na análise:', error.message);
    } finally {
        await sequelize.close();
    }
}

// Definir relacionamentos
Usuario.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });
Role.hasMany(Usuario, { foreignKey: 'role_id', as: 'usuarios' });

Processo.belongsTo(Usuario, { foreignKey: 'idusuario_responsavel', as: 'responsavel' });
Usuario.hasMany(Processo, { foreignKey: 'idusuario_responsavel', as: 'processosResponsavel' });

UsuarioProcesso.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });
UsuarioProcesso.belongsTo(Processo, { foreignKey: 'processo_id', as: 'processo' });

analisarDadosReais().catch(console.error);
