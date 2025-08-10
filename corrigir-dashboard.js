const { Sequelize, DataTypes, Op } = require('sequelize');
const path = require('path');

// Configuração do banco de dados
const sequelize = new Sequelize({
  dialect: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'admin123',
  database: 'sistema_npj',
  logging: false
});

// Modelo Processo
const Processo = sequelize.define('processo', {
  idprocesso: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  numero_processo: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  tipo: DataTypes.STRING(100),
  autor: DataTypes.STRING(255),
  reu: DataTypes.STRING(255),
  comarca: DataTypes.STRING(255),
  vara: DataTypes.STRING(255),
  juiz: DataTypes.STRING(255),
  data_distribuicao: DataTypes.DATE,
  valor_da_causa: DataTypes.DECIMAL(15, 2),
  status: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  observacoes: DataTypes.TEXT,
  materia_assunto_id: DataTypes.INTEGER,
  fase_id: DataTypes.INTEGER,
  diligencia_id: DataTypes.INTEGER,
  local_tramitacao_id: DataTypes.INTEGER,
  idusuario_responsavel: DataTypes.INTEGER,
  descricao: DataTypes.TEXT,
  prioridade: {
    type: DataTypes.ENUM('baixa', 'media', 'alta', 'urgente'),
    defaultValue: 'media'
  },
  prazo_interno: DataTypes.DATE,
  prazo_fatal: DataTypes.DATE,
  cliente_cpf: DataTypes.STRING(11),
  cliente_nome: DataTypes.STRING(255),
  cliente_endereco: DataTypes.TEXT,
  cliente_telefone: DataTypes.STRING(20),
  cliente_email: DataTypes.STRING(255),
  proximo_compromisso: DataTypes.DATE,
  valor_condenacao: DataTypes.DECIMAL(15, 2),
  observacao_interna: DataTypes.TEXT,
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    onUpdate: DataTypes.NOW
  }
}, {
  tableName: 'processo',
  timestamps: false
});

async function analisarDashboard() {
  try {
    await sequelize.authenticate();
    console.log('\n📊 ANÁLISE DASHBOARD - DADOS REAIS vs IMPLEMENTAÇÃO ATUAL\n');

    // 1. Buscar todos os processos e status reais
    const processos = await Processo.findAll({
      attributes: ['idprocesso', 'status', 'numero_processo'],
      raw: true
    });

    console.log('📋 DADOS REAIS DO BANCO:');
    console.log(`Total de processos: ${processos.length}`);
    
    // Contar status reais
    const statusCount = {};
    processos.forEach(p => {
      statusCount[p.status] = (statusCount[p.status] || 0) + 1;
    });

    console.log('\n📊 Status reais encontrados:');
    Object.entries(statusCount).forEach(([status, count]) => {
      console.log(`  - ${status}: ${count}`);
    });

    // 2. Simular a lógica atual do dashboard
    console.log('\n🔧 SIMULAÇÃO DA LÓGICA ATUAL DO DASHBOARD:');
    
    // Função de normalização atual
    const normalize = s => s && s.normalize('NFD').replace(/[^\w\s]/g, '').toLowerCase();
    const statusMap = { em_andamento: 0, aguardando: 0, finalizado: 0, arquivado: 0, outros: 0 };
    
    Object.entries(statusCount).forEach(([status, count]) => {
      const raw = status || '';
      const n = normalize(raw);
      console.log(`  "${status}" -> normalizado: "${n}"`);
      
      if (n.includes('andamento')) {
        statusMap.em_andamento += count;
        console.log(`    ✓ Classificado como: em_andamento`);
      } else if (n.includes('aguard')) {
        statusMap.aguardando += count;
        console.log(`    ✓ Classificado como: aguardando`);
      } else if (n.includes('finaliz') || n.includes('conclu')) {
        statusMap.finalizado += count;
        console.log(`    ✓ Classificado como: finalizado`);
      } else if (n.includes('arquiv')) {
        statusMap.arquivado += count;
        console.log(`    ✓ Classificado como: arquivado`);
      } else {
        statusMap.outros += count;
        console.log(`    ✓ Classificado como: outros`);
      }
    });

    console.log('\n📈 RESULTADO DA CLASSIFICAÇÃO ATUAL:');
    console.log(`  Em andamento: ${statusMap.em_andamento}`);
    console.log(`  Aguardando: ${statusMap.aguardando}`);
    console.log(`  Finalizado: ${statusMap.finalizado}`);
    console.log(`  Arquivado: ${statusMap.arquivado}`);
    console.log(`  Outros: ${statusMap.outros}`);

    // 3. Propor classificação correta
    console.log('\n✅ CLASSIFICAÇÃO CORRETA PROPOSTA:');
    const statusMapCorreto = { em_andamento: 0, aguardando: 0, finalizado: 0, arquivado: 0, suspenso: 0 };
    
    Object.entries(statusCount).forEach(([status, count]) => {
      const statusLower = status.toLowerCase();
      
      if (statusLower === 'em andamento') {
        statusMapCorreto.em_andamento += count;
      } else if (statusLower.includes('aguardando')) {
        statusMapCorreto.aguardando += count;
      } else if (statusLower === 'concluído') {
        statusMapCorreto.finalizado += count;
      } else if (statusLower === 'suspenso') {
        statusMapCorreto.suspenso += count;
      } else {
        // Para status não mapeados, adicionar em outros ou criar nova categoria
        console.log(`    ⚠️ Status não mapeado: "${status}" (${count})`);
      }
    });

    console.log('  Em andamento:', statusMapCorreto.em_andamento);
    console.log('  Aguardando (todos):', statusMapCorreto.aguardando);
    console.log('  Finalizado (Concluído):', statusMapCorreto.finalizado);
    console.log('  Suspenso:', statusMapCorreto.suspenso);

    // 4. Verificar processosAtivos
    const processosAtivos = await Processo.count({ 
      where: { 
        status: { 
          [Op.notIn]: ['arquivado', 'Concluído', 'concluído', 'Finalizado', 'finalizado'] 
        } 
      } 
    });

    console.log('\n🟢 PROCESSOS ATIVOS (atual):');
    console.log(`  Total: ${processosAtivos} (excluindo: arquivado, Concluído, concluído, Finalizado, finalizado)`);

    console.log('\n🎯 RECOMENDAÇÕES:');
    console.log('1. Ajustar a classificação de status para ser mais específica');
    console.log('2. Incluir categoria "suspenso" no dashboard');
    console.log('3. Diferenciar tipos de "aguardando" (audiência, sentença, etc.)');
    console.log('4. Revisar critérios de "processosAtivos"');

  } catch (error) {
    console.error('❌ Erro na análise:', error);
  } finally {
    await sequelize.close();
  }
}

analisarDashboard();
