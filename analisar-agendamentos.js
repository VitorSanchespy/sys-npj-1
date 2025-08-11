const { Sequelize, DataTypes, Op } = require('sequelize');
const path = require('path');

// Configuração do banco de dados
const sequelize = new Sequelize({
  dialect: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: '1234',
  database: 'npjdatabase',
  logging: false
});

// Modelo Agendamento
const Agendamento = sequelize.define('Agendamento', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  processo_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  criado_por: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  tipo_evento: {
    type: DataTypes.ENUM('audiencia', 'prazo', 'reuniao', 'diligencia', 'outro'),
    allowNull: false
  },
  titulo: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  data_evento: {
    type: DataTypes.DATE,
    allowNull: false
  },
  local: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('agendado', 'realizado', 'cancelado', 'adiado'),
    allowNull: true,
    defaultValue: 'agendado'
  },
  lembrete_1_dia: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: true
  },
  lembrete_2_dias: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: true
  },
  lembrete_1_semana: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false
  },
  googleEventId: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  criado_em: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  atualizado_em: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'agendamentos',
  timestamps: false
});

// Modelo Usuario
const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome: DataTypes.STRING,
  email: DataTypes.STRING,
  role_id: DataTypes.INTEGER,
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'usuarios',
  timestamps: false
});

async function analisarAgendamentos() {
  try {
    await sequelize.authenticate();
    console.log('\n📅 ANÁLISE AGENDAMENTOS - DADOS REAIS vs EXIBIÇÃO\n');

    // 1. Verificar todos os agendamentos
    const agendamentos = await Agendamento.findAll({
      order: [['data_evento', 'ASC']]
    });

    console.log('📋 AGENDAMENTOS NO BANCO:');
    console.log(`Total encontrado: ${agendamentos.length}`);
    
    if (agendamentos.length === 0) {
      console.log('⚠️ Nenhum agendamento encontrado no banco!');
      
      // Verificar se a tabela existe
      const tables = await sequelize.query("SHOW TABLES LIKE 'agendamentos'", { type: sequelize.QueryTypes.SELECT });
      if (tables.length === 0) {
        console.log('❌ A tabela "agendamentos" não existe!');
      } else {
        console.log('✅ A tabela "agendamentos" existe mas está vazia.');
      }
    } else {
      console.log('\n📊 DETALHES DOS AGENDAMENTOS:');
      
      agendamentos.forEach((ag, index) => {
        console.log(`\n${index + 1}. ${ag.titulo || 'Sem título'}`);
        console.log(`   Status: ${ag.status || 'N/A'}`);
        console.log(`   Tipo: ${ag.tipo_evento || 'N/A'}`);
        console.log(`   Data: ${ag.data_evento ? new Date(ag.data_evento).toLocaleString('pt-BR') : 'N/A'}`);
        console.log(`   Local: ${ag.local || 'N/A'}`);
        console.log(`   Criado por (ID): ${ag.criado_por || 'N/A'}`);
        console.log(`   Destinatário (ID): ${ag.usuario_id || 'N/A'}`);
        console.log(`   Descrição: ${ag.descricao || 'N/A'}`);
        console.log(`   Processo ID: ${ag.processo_id || 'N/A'}`);
        console.log(`   Criado em: ${ag.criado_em ? new Date(ag.criado_em).toLocaleString('pt-BR') : 'N/A'}`);
      });
    }

    // 2. Verificar usuários
    const usuarios = await Usuario.findAll({
      attributes: ['id', 'nome', 'email', 'role_id'],
      order: [['id', 'ASC']]
    });

    console.log('\n👥 USUÁRIOS NO SISTEMA:');
    usuarios.forEach((user) => {
      const role = user.role_id === 1 ? 'Admin' : user.role_id === 2 ? 'Professor' : 'Aluno';
      console.log(`   ID ${user.id}: ${user.nome} (${user.email}) - ${role}`);
    });

    // 3. Verificar estrutura da tabela
    console.log('\n🔍 ESTRUTURA DA TABELA AGENDAMENTOS:');
    const [results] = await sequelize.query("DESCRIBE agendamentos");
    results.forEach(column => {
      console.log(`   ${column.Field}: ${column.Type} ${column.Null === 'NO' ? '(obrigatório)' : ''}`);
    });

    console.log('\n🎯 PROBLEMA IDENTIFICADO:');
    if (agendamentos.length === 0) {
      console.log('   - Não há agendamentos no banco, mas a interface mostra dados');
      console.log('   - Possível problema: dados estáticos ou cache');
      console.log('   - Solução: Verificar de onde vêm os dados na interface');
    } else {
      console.log('   - Dados encontrados no banco não correspondem à interface');
      console.log('   - Verificar filtros por usuário ou consultas incorretas');
    }

  } catch (error) {
    console.error('❌ Erro na análise:', error.message);
    if (error.message.includes("doesn't exist")) {
      console.log('\n💡 POSSÍVEL SOLUÇÃO:');
      console.log('   A tabela "agendamentos" pode ter nome diferente.');
      console.log('   Verificando tabelas disponíveis...');
      
      try {
        const [tables] = await sequelize.query("SHOW TABLES");
        console.log('\n📋 TABELAS DISPONÍVEIS:');
        tables.forEach(table => {
          const tableName = Object.values(table)[0];
          console.log(`   - ${tableName}`);
        });
      } catch (tableError) {
        console.error('   Erro ao listar tabelas:', tableError.message);
      }
    }
  } finally {
    await sequelize.close();
  }
}

analisarAgendamentos();
