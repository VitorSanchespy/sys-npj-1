const { Sequelize, DataTypes } = require('sequelize');

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

async function limparAgendamentosAntigos() {
  try {
    await sequelize.authenticate();
    console.log('\n🗑️ LIMPANDO AGENDAMENTOS INCONSISTENTES\n');

    // 1. Limpar notificações relacionadas primeiro
    await sequelize.query("DELETE FROM notificacoes WHERE agendamento_id IS NOT NULL", { 
      type: sequelize.QueryTypes.DELETE 
    });
    console.log('✅ Removidas notificações relacionadas a agendamentos');
    
    // 2. Limpar agendamentos existentes
    const deletedCount = await Agendamento.destroy({
      where: {}
    });
    
    console.log(`✅ Removidos ${deletedCount} agendamentos antigos/inconsistentes`);

    // 2. Verificar se há usuários válidos para usar
    const usuarios = await sequelize.query("SELECT id, nome FROM usuarios LIMIT 5", { 
      type: sequelize.QueryTypes.SELECT 
    });
    
    if (usuarios.length === 0) {
      console.log('❌ Nenhum usuário encontrado para criar agendamentos');
      return;
    }

    console.log('\n👥 Usuários disponíveis:');
    usuarios.forEach(u => console.log(`   ID ${u.id}: ${u.nome}`));

    // 3. Criar agendamentos limpos baseados apenas em usuários válidos
    const agendamentosLimpos = [
      {
        usuario_id: usuarios[0].id, // User ID 1
        criado_por: usuarios[0].id,
        tipo_evento: 'reuniao',
        titulo: 'Reunião de Planejamento',
        descricao: 'Planejamento do semestre acadêmico',
        data_evento: new Date('2025-02-15 10:00:00'),
        local: 'NPJ - Sala de Reuniões',
        status: 'agendado'
      },
      {
        usuario_id: usuarios.length > 1 ? usuarios[1].id : usuarios[0].id,
        criado_por: usuarios[0].id,
        tipo_evento: 'audiencia',
        titulo: 'Audiência Trabalhista',
        descricao: 'Audiência de conciliação processo trabalhista',
        data_evento: new Date('2025-02-20 14:00:00'),
        local: 'Fórum do Trabalho',
        status: 'agendado'
      }
    ];

    // 4. Inserir agendamentos limpos
    for (const agendamento of agendamentosLimpos) {
      await Agendamento.create(agendamento);
      console.log(`✅ Criado: ${agendamento.titulo}`);
    }

    // 5. Verificar resultado
    const totalAgendamentos = await Agendamento.count();
    console.log(`\n📊 Total de agendamentos após limpeza: ${totalAgendamentos}`);

    // 6. Listar agendamentos criados
    const agendamentosFinais = await Agendamento.findAll({
      order: [['data_evento', 'ASC']]
    });

    console.log('\n📋 AGENDAMENTOS LIMPOS CRIADOS:');
    agendamentosFinais.forEach((ag, index) => {
      console.log(`\n${index + 1}. ${ag.titulo}`);
      console.log(`   Tipo: ${ag.tipo_evento}`);
      console.log(`   Data: ${new Date(ag.data_evento).toLocaleString('pt-BR')}`);
      console.log(`   Local: ${ag.local || 'N/A'}`);
      console.log(`   Status: ${ag.status}`);
      console.log(`   Usuário: ${ag.usuario_id}`);
      console.log(`   Criado por: ${ag.criado_por}`);
    });

    console.log('\n🎯 AÇÃO NECESSÁRIA:');
    console.log('   1. Fazer logout da aplicação');
    console.log('   2. Limpar cache do navegador (Ctrl+Shift+Delete)');
    console.log('   3. Fazer login novamente');
    console.log('   4. Verificar se agendamentos agora correspondem ao banco');

  } catch (error) {
    console.error('❌ Erro na limpeza:', error);
  } finally {
    await sequelize.close();
  }
}

limparAgendamentosAntigos();
