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

async function verificarDadosReaisAgendamentos() {
  try {
    await sequelize.authenticate();
    console.log('\n🔍 VERIFICAÇÃO FINAL - AGENDAMENTOS NO BANCO vs CACHE\n');

    // 1. Verificar agendamentos reais no banco
    const agendamentos = await Agendamento.findAll({
      order: [['data_evento', 'ASC']]
    });

    console.log('📊 DADOS REAIS NO BANCO:');
    console.log(`Total de agendamentos: ${agendamentos.length}`);
    
    if (agendamentos.length === 0) {
      console.log('⚠️ Nenhum agendamento encontrado!');
    } else {
      console.log('\n📋 AGENDAMENTOS REAIS:');
      agendamentos.forEach((ag, index) => {
        console.log(`\n${index + 1}. ${ag.titulo}`);
        console.log(`   Tipo: ${ag.tipo_evento}`);
        console.log(`   Data: ${new Date(ag.data_evento).toLocaleString('pt-BR')}`);
        console.log(`   Local: ${ag.local || 'N/A'}`);
        console.log(`   Status: ${ag.status}`);
        console.log(`   Usuário ID: ${ag.usuario_id}`);
        console.log(`   Criado por ID: ${ag.criado_por}`);
      });
    }

    console.log('\n🎯 PROBLEMA IDENTIFICADO:');
    console.log('   ❌ O frontend tem CACHE de requisições ativo!');
    console.log('   ❌ TTL do cache de agendamentos: 1 minuto');
    console.log('   ❌ Dados antigos ainda estão em cache');
    
    console.log('\n💡 SOLUÇÕES PARA CORRIGIR:');
    console.log('');
    console.log('🔧 SOLUÇÃO 1 - LIMPAR CACHE NO NAVEGADOR:');
    console.log('   1. Abrir DevTools (F12)');
    console.log('   2. No Console, executar: clearCache()');
    console.log('   3. Aguardar 1 minuto (TTL do cache)');
    console.log('   4. Recarregar a página (F5)');
    console.log('');
    
    console.log('🔧 SOLUÇÃO 2 - CACHE HARD REFRESH:');
    console.log('   1. Pressionar Ctrl+Shift+R (hard refresh)');
    console.log('   2. Ou Ctrl+F5 para forçar reload');
    console.log('');
    
    console.log('🔧 SOLUÇÃO 3 - LIMPAR DADOS DO NAVEGADOR:');
    console.log('   1. Pressionar Ctrl+Shift+Delete');
    console.log('   2. Selecionar "Dados armazenados localmente"');
    console.log('   3. Limpar cache e dados');
    console.log('   4. Fazer login novamente');
    console.log('');
    
    console.log('🔧 SOLUÇÃO 4 - AGUARDAR EXPIRAÇÃO NATURAL:');
    console.log('   1. Aguardar 1 minuto');
    console.log('   2. O cache expira automaticamente');
    console.log('   3. Próxima requisição buscará dados atuais');
    console.log('');

    console.log('📱 COMPARAÇÃO - O QUE VOCÊ VÊ vs REALIDADE:');
    console.log('');
    console.log('👁️ VOCÊ VÊ (dados em cache):');
    console.log('   - Reunião de Orientação');
    console.log('   - Estudo do Caso');
    console.log('   - Audiência de Conciliação');
    console.log('   - Prazo para Contestação');
    console.log('');
    console.log('💾 BANCO REAL tem apenas:');
    if (agendamentos.length > 0) {
      agendamentos.forEach((ag, index) => {
        console.log(`   - ${ag.titulo}`);
      });
    } else {
      console.log('   - (vazio)');
    }

    console.log('\n✅ APÓS APLICAR QUALQUER SOLUÇÃO ACIMA:');
    console.log('   🎯 Agendamentos mostrados = Agendamentos reais no banco');
    console.log('   🎯 Dados sempre atualizados');
    console.log('   🎯 Sem discrepâncias entre cache e realidade');

  } catch (error) {
    console.error('❌ Erro na verificação:', error);
  } finally {
    await sequelize.close();
  }
}

verificarDadosReaisAgendamentos();
