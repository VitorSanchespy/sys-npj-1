const bcrypt = require('bcryptjs');
const Sequelize = require('sequelize');

// Conectar diretamente como root
const sequelize = new Sequelize('npjdatabase', 'root', '12345678@', {
    host: 'sistema-npj-db-1',
    dialect: 'mysql',
    logging: false
});

// Definir modelos simples
const Role = sequelize.define('Role', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    nome: { type: Sequelize.STRING(50), allowNull: false, unique: true }
}, { tableName: 'roles', timestamps: false });

const Usuario = sequelize.define('Usuario', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    nome: { type: Sequelize.STRING(100), allowNull: false },
    email: { type: Sequelize.STRING(100), allowNull: false, unique: true },
    senha: { type: Sequelize.STRING(255), allowNull: false },
    role_id: { type: Sequelize.INTEGER, allowNull: false },
    criado_em: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    ativo: { type: Sequelize.BOOLEAN, defaultValue: true },
    telefone: { type: Sequelize.STRING(20) }
}, { tableName: 'usuarios', timestamps: false });

const Diligencia = sequelize.define('Diligencia', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    nome: { type: Sequelize.STRING(100), allowNull: false, unique: true }
}, { tableName: 'diligencia', timestamps: false });

const Fase = sequelize.define('Fase', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    nome: { type: Sequelize.STRING(100), allowNull: false, unique: true }
}, { tableName: 'fase', timestamps: false });

const MateriaAssunto = sequelize.define('MateriaAssunto', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    nome: { type: Sequelize.STRING(100), allowNull: false, unique: true }
}, { tableName: 'materia_assunto', timestamps: false });

const LocalTramitacao = sequelize.define('LocalTramitacao', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    nome: { type: Sequelize.STRING(255), allowNull: false }
}, { tableName: 'local_tramitacao', timestamps: false });

const Processo = sequelize.define('Processo', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    numero_processo: { type: Sequelize.STRING, allowNull: false },
    descricao: { type: Sequelize.TEXT },
    criado_em: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    status: { type: Sequelize.STRING },  
    tipo_processo: { type: Sequelize.STRING },
    idusuario_responsavel: { type: Sequelize.INTEGER },
    data_encerramento: { type: Sequelize.DATE },
    observacoes: { type: Sequelize.TEXT },
    sistema: { type: Sequelize.ENUM('Físico','PEA','PJE'), defaultValue: 'Físico' },
    materia_assunto_id: { type: Sequelize.INTEGER },
    fase_id: { type: Sequelize.INTEGER },
    diligencia_id: { type: Sequelize.INTEGER },
    num_processo_sei: { type: Sequelize.STRING },
    assistido: { type: Sequelize.STRING },
    contato_assistido: { type: Sequelize.STRING },
    local_tramitacao_id: { type: Sequelize.INTEGER }
}, { tableName: 'processos', timestamps: false });

async function popularBancoDeTeste() {
    try {
        await sequelize.authenticate();
        console.log('🚀 Conectado ao banco com sucesso!\n');

        // 1. Criar Roles
        console.log('📋 Criando roles...');
            const roles = [
                { nome: 'Aluno' },
                { nome: 'Professor' },
                { nome: 'Admin' }
            ];

        const rolesIds = [];
        for (const role of roles) {
            const [item, created] = await Role.findOrCreate({
                where: { nome: role.nome },
                defaults: role
            });
            rolesIds.push(item.id);
            if (created) {
                console.log(`✅ Role criado: ${role.nome}`);
            } else {
                console.log(`👤 Role ${role.nome} já existe`);
            }
        }

        // 2. Criar Usuários
        console.log('\n👥 Criando usuários...');
        const usuarios = [
    {
        nome: 'Maria Santos',
        email: 'maria@teste.com',
        senha: 'maria123',
        telefone: '(65) 99999-0003',
        role_id: rolesIds[0] // Aluno
    },
    {
        nome: 'João Silva',
        email: 'joao@teste.com',
        senha: 'joao123',
        telefone: '(65) 99999-0002',
        role_id: rolesIds[1] // Professor
    },
    {
        nome: 'Admin Teste',
        email: 'admin@teste.com',
        senha: 'admin123',
        telefone: '(65) 99999-0001',
        role_id: rolesIds[2] // Admin
    }
];

        const usuariosIds = [];
        for (const user of usuarios) {
            const senhaHash = await bcrypt.hash(user.senha, 10);
            const [item, created] = await Usuario.findOrCreate({
                where: { email: user.email },
                defaults: {
                    ...user,
                    senha: senhaHash,
                    ativo: true
                }
            });
            usuariosIds.push(item.id);
            if (created) {
                console.log(`✅ Usuário criado: ${user.email}`);
            } else {
                console.log(`👤 Usuário ${user.email} já existe`);
            }
        }

        // 3. Criar Diligências
        console.log('\n📝 Criando diligências...');
        const diligencias = [
            { nome: 'Citação' },
            { nome: 'Intimação' },
            { nome: 'Perícia' }
        ];

        const diligenciasIds = [];
        for (const diligencia of diligencias) {
            const [item, created] = await Diligencia.findOrCreate({
                where: { nome: diligencia.nome },
                defaults: diligencia
            });
            diligenciasIds.push(item.id);
            if (created) {
                console.log(`✅ Diligência criada: ${diligencia.nome}`);
            } else {
                console.log(`👤 Diligência ${diligencia.nome} já existe`);
            }
        }

        // 4. Criar Fases
        console.log('\n⚖️ Criando fases...');
        const fases = [
            { nome: 'Inicial' },
            { nome: 'Instrução' },
            { nome: 'Sentença' }
        ];

        const fasesIds = [];
        for (const fase of fases) {
            const [item, created] = await Fase.findOrCreate({
                where: { nome: fase.nome },
                defaults: fase
            });
            fasesIds.push(item.id);
            if (created) {
                console.log(`✅ Fase criada: ${fase.nome}`);
            } else {
                console.log(`👤 Fase ${fase.nome} já existe`);
            }
        }

        // 5. Criar Matérias/Assuntos
        console.log('\n📚 Criando matérias/assuntos...');
        const materias = [
            { nome: 'Direito Civil' },
            { nome: 'Direito Trabalhista' },
            { nome: 'Direito Penal' }
        ];

        const materiasIds = [];
        for (const materia of materias) {
            const [item, created] = await MateriaAssunto.findOrCreate({
                where: { nome: materia.nome },
                defaults: materia
            });
            materiasIds.push(item.id);
            if (created) {
                console.log(`✅ Matéria criada: ${materia.nome}`);
            } else {
                console.log(`👤 Matéria ${materia.nome} já existe`);
            }
        }

        // 6. Criar Locais de Tramitação
        console.log('\n🏛️ Criando locais de tramitação...');
        const locais = [
            { nome: 'Tribunal de Justiça - MT' },
            { nome: 'Vara Cível - Cuiabá' },
            { nome: 'Vara Trabalhista - Várzea Grande' }
        ];

        const locaisIds = [];
        for (const local of locais) {
            const [item, created] = await LocalTramitacao.findOrCreate({
                where: { nome: local.nome },
                defaults: local
            });
            locaisIds.push(item.id);
            if (created) {
                console.log(`✅ Local criado: ${local.nome}`);
            } else {
                console.log(`👤 Local ${local.nome} já existe`);
            }
        }

        // 7. Criar Processos
        console.log('\n📋 Criando processos...');
        const processos = [
            {
                numero_processo: '0001234-56.2025.8.11.0001',
                descricao: 'Ação de cobrança contra empresa de telefonia',
                status: 'Em andamento',
                tipo_processo: 'Cível',
                idusuario_responsavel: usuariosIds[0],
                sistema: 'PJE', // ENUM válido
                materia_assunto_id: materiasIds[0],
                fase_id: fasesIds[0],
                diligencia_id: diligenciasIds[0],
                num_processo_sei: 'SEI-23085.012345/2025-67',
                assistido: 'José da Silva',
                contato_assistido: '(65) 99888-7777',
                local_tramitacao_id: locaisIds[0]
            },
            {
                numero_processo: '0002345-67.2025.5.23.0001',
                descricao: 'Reclamação trabalhista por rescisão indireta',
                status: 'Aguardando audiência',
                tipo_processo: 'Trabalhista',
                idusuario_responsavel: usuariosIds[1],
                sistema: 'PEA', // ENUM válido
                materia_assunto_id: materiasIds[1],
                fase_id: fasesIds[1],
                diligencia_id: diligenciasIds[1],
                num_processo_sei: 'SEI-23085.012346/2025-68',
                assistido: 'Maria Oliveira',
                contato_assistido: '(65) 99777-6666',
                local_tramitacao_id: locaisIds[1]
            },
            {
                numero_processo: '0003456-78.2025.8.11.0002',
                descricao: 'Defesa criminal - furto simples',
                status: 'Aguardando sentença',
                tipo_processo: 'Criminal',
                idusuario_responsavel: usuariosIds[2],
                sistema: 'Físico', // ENUM válido
                materia_assunto_id: materiasIds[2],
                fase_id: fasesIds[2],
                diligencia_id: diligenciasIds[2],
                num_processo_sei: 'SEI-23085.012347/2025-69',
                assistido: 'Pedro Santos',
                contato_assistido: '(65) 99666-5555',
                local_tramitacao_id: locaisIds[2]
            }
        ];

        for (const processo of processos) {
            const [item, created] = await Processo.findOrCreate({
                where: { numero_processo: processo.numero_processo },
                defaults: processo
            });
            if (created) {
                console.log(`✅ Processo criado: ${processo.numero_processo}`);
            } else {
                console.log(`👤 Processo ${processo.numero_processo} já existe`);
            }
        }

        console.log('\n🎉 Banco de dados populado com sucesso!');
        console.log('\n📊 Resumo dos dados criados:');
        console.log('   - 3 Roles');
        console.log('   - 3 Usuários');
        console.log('   - 3 Diligências');
        console.log('   - 3 Fases');
        console.log('   - 3 Matérias/Assuntos');
        console.log('   - 3 Locais de Tramitação');
        console.log('   - 3 Processos');
        
        console.log('\n🔑 Credenciais de acesso:');
        console.log('   Admin: admin@teste.com / admin123');
        console.log('   João: joao@teste.com / joao123');
        console.log('   Maria: maria@teste.com / maria123');

    } catch (error) {
        console.error('❌ Erro ao popular banco:', error.message);
    } finally {
        await sequelize.close();
    }
}
popularBancoDeTeste();
//Admin: admin@teste.com / admin123
//João: joao@teste.com / joao123
//Maria: maria@teste.com / maria123
