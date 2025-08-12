const express = require('express');
const { Processo, Usuario } = require('../models/indexModel');
const authMiddleware = require('../middleware/authMiddleware');
const { Op } = require('sequelize');

const router = express.Router();

// Aplicar middleware de autenticação a todas as rotas
router.use(authMiddleware);

// Endpoint para estatísticas gerais do sistema (alias para /stats)
router.get('/estatisticas', async (req, res) => {
  try {
    // Processos
    const totalProcessos = await Processo.count();
    const processosAtivos = await Processo.count({ 
      where: { 
        status: { 
          [Op.notIn]: ['arquivado', 'Concluído', 'concluído', 'Finalizado', 'finalizado'] 
        } 
      } 
    });
    const processosPorStatus = await Processo.findAll({
      attributes: ['status', [require('sequelize').fn('COUNT', require('sequelize').col('status')), 'count']],
      group: ['status']
    });
    
    // Mapeamento flexível de status (ignora maiúsculas/minúsculas e acentos)
    const normalize = s => s && s.normalize('NFD').replace(/[^\w\s]/g, '').toLowerCase();
    const statusMap = { em_andamento: 0, aguardando: 0, finalizado: 0, arquivado: 0, suspenso: 0, outros: 0 };
    processosPorStatus.forEach(row => {
      const raw = row.status || '';
      const n = normalize(raw);
      if (n.includes('andamento')) statusMap.em_andamento += parseInt(row.get('count'));
      else if (n.includes('aguard')) statusMap.aguardando += parseInt(row.get('count'));
      else if (n.includes('finaliz') || n.includes('conclu')) statusMap.finalizado += parseInt(row.get('count'));
      else if (n.includes('arquiv')) statusMap.arquivado += parseInt(row.get('count'));
      else if (n.includes('suspen')) statusMap.suspenso += parseInt(row.get('count'));
      else statusMap.outros += parseInt(row.get('count'));
    });

    // Usuários
    const totalUsuarios = await Usuario.count();
    const usuariosAtivos = await Usuario.count({ where: { ativo: true } });
    const usuarios = await Usuario.findAll({ attributes: ['role_id'], raw: true });
    const usuariosPorTipo = { aluno: 0, professor: 0, admin: 0 };
    usuarios.forEach(u => {
      if (u.role_id === 1) usuariosPorTipo.admin++;
      else if (u.role_id === 2) usuariosPorTipo.professor++;
      else if (u.role_id === 3) usuariosPorTipo.aluno++;
    });

    res.json({
      totalProcessos,
      processosAtivos,
      processosPorStatus: {
        em_andamento: statusMap['em_andamento'] || 0,
        aguardando: statusMap['aguardando'] || 0,
        finalizado: statusMap['finalizado'] || 0,
        arquivado: statusMap['arquivado'] || 0,
        suspenso: statusMap['suspenso'] || 0,
        outros: statusMap['outros'] || 0
      },
      totalUsuarios,
      usuariosAtivos,
      usuariosPorTipo
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas do dashboard:', error);
    res.status(500).json({ erro: 'Erro ao buscar estatísticas do dashboard' });
  }
});

// Endpoint para estatísticas gerais do sistema (processos e usuários)
router.get('/stats', async (req, res) => {
  try {
    // Processos
    const totalProcessos = await Processo.count();
    const processosAtivos = await Processo.count({ 
      where: { 
        status: { 
          [Op.notIn]: ['arquivado', 'Concluído', 'concluído', 'Finalizado', 'finalizado'] 
        } 
      } 
    });
    const processosPorStatus = await Processo.findAll({
      attributes: ['status', [require('sequelize').fn('COUNT', require('sequelize').col('status')), 'count']],
      group: ['status']
    });
    
    // Mapeamento flexível de status (ignora maiúsculas/minúsculas e acentos)
    const normalize = s => s && s.normalize('NFD').replace(/[^\w\s]/g, '').toLowerCase();
    const statusMap = { em_andamento: 0, aguardando: 0, finalizado: 0, arquivado: 0, suspenso: 0, outros: 0 };
    processosPorStatus.forEach(row => {
      const raw = row.status || '';
      const n = normalize(raw);
      if (n.includes('andamento')) statusMap.em_andamento += parseInt(row.get('count'));
      else if (n.includes('aguard')) statusMap.aguardando += parseInt(row.get('count'));
      else if (n.includes('finaliz') || n.includes('conclu')) statusMap.finalizado += parseInt(row.get('count'));
      else if (n.includes('arquiv')) statusMap.arquivado += parseInt(row.get('count'));
      else if (n.includes('suspen')) statusMap.suspenso += parseInt(row.get('count'));
      else statusMap.outros += parseInt(row.get('count'));
    });

    // Usuários
    const totalUsuarios = await Usuario.count();
    const usuariosAtivos = await Usuario.count({ where: { ativo: true } });
    const usuarios = await Usuario.findAll({ attributes: ['role_id'], raw: true });
    const usuariosPorTipo = { aluno: 0, professor: 0, admin: 0 };
    usuarios.forEach(u => {
      if (u.role_id === 1) usuariosPorTipo.admin++;
      else if (u.role_id === 2) usuariosPorTipo.aluno++;
      else if (u.role_id === 3) usuariosPorTipo.professor++;
    });

    res.json({
      totalProcessos,
      processosAtivos,
      processosPorStatus: {
        em_andamento: statusMap['em_andamento'] || 0,
        aguardando: statusMap['aguardando'] || 0,
        finalizado: statusMap['finalizado'] || 0,
        arquivado: statusMap['arquivado'] || 0,
        suspenso: statusMap['suspenso'] || 0,
        outros: statusMap['outros'] || 0
      },
      totalUsuarios,
      usuariosAtivos,
      usuariosPorTipo
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ erro: 'Erro interno do servidor', detalhes: error.message });
  }
});

// Endpoint mais específico para status com detalhes
router.get('/status-detalhado', async (req, res) => {
  try {
    const processosPorStatus = await Processo.findAll({
      attributes: ['status', [require('sequelize').fn('COUNT', require('sequelize').col('status')), 'count']],
      group: ['status']
    });
    
    const statusDetalhado = {};
    processosPorStatus.forEach(row => {
      statusDetalhado[row.status] = parseInt(row.get('count'));
    });

    res.json({
      statusDetalhado,
      resumo: {
        em_andamento: statusDetalhado['Em andamento'] || 0,
        aguardando_total: (statusDetalhado['Aguardando'] || 0) + (statusDetalhado['Aguardando audiência'] || 0) + (statusDetalhado['Aguardando sentença'] || 0),
        aguardando_simples: statusDetalhado['Aguardando'] || 0,
        aguardando_audiencia: statusDetalhado['Aguardando audiência'] || 0,
        aguardando_sentenca: statusDetalhado['Aguardando sentença'] || 0,
        concluido: statusDetalhado['Concluído'] || 0,
        suspenso: statusDetalhado['Suspenso'] || 0,
        total: Object.values(statusDetalhado).reduce((acc, count) => acc + count, 0)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar status detalhado:', error);
    res.status(500).json({ erro: 'Erro interno do servidor', detalhes: error.message });
  }
});

// Endpoint para métricas de processos por usuário responsável
router.get('/processos-por-responsavel', async (req, res) => {
  try {
    const processosPorResponsavel = await Processo.findAll({
      attributes: [
        'idusuario_responsavel',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      include: [{
        model: Usuario,
        as: 'responsavel',
        attributes: ['nome', 'email'],
        required: false
      }],
      group: ['idusuario_responsavel', 'responsavel.id'],
      having: require('sequelize').where(require('sequelize').fn('COUNT', require('sequelize').col('Processo.id')), '>', 0),
      order: [[require('sequelize').fn('COUNT', require('sequelize').col('id')), 'DESC']]
    });

    res.json(processosPorResponsavel);
  } catch (error) {
    console.error('Erro ao buscar processos por responsável:', error);
    res.status(500).json({ erro: 'Erro interno do servidor', detalhes: error.message });
  }
});

// Endpoint para métricas de atividade recente
router.get('/atividade-recente', async (req, res) => {
  try {
    const agora = new Date();
    const inicioSemana = new Date(agora.setDate(agora.getDate() - agora.getDay()));
    const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);

    const processosRecentes = await Processo.count({
      where: {
        criado_em: {
          [Op.gte]: inicioSemana
        }
      }
    });

    const processosDoMes = await Processo.count({
      where: {
        criado_em: {
          [Op.gte]: inicioMes
        }
      }
    });

    res.json({
      processos_semana: processosRecentes,
      processos_mes: processosDoMes,
      data_inicio_semana: inicioSemana,
      data_inicio_mes: inicioMes
    });
  } catch (error) {
    console.error('Erro ao buscar atividade recente:', error);
    res.status(500).json({ erro: 'Erro interno do servidor', detalhes: error.message });
  }
});

// Endpoint para exportar dados do dashboard
router.get('/exportar', async (req, res) => {
  try {
    const { formato = 'json' } = req.query;
    
    // Buscar todos os dados principais
    const totalProcessos = await Processo.count();
    const totalUsuarios = await Usuario.count();
    
    const processos = await Processo.findAll({
      attributes: ['id', 'numero_processo', 'status', 'criado_em', 'idusuario_responsavel'],
      include: [{
        model: Usuario,
        as: 'responsavel',
        attributes: ['nome', 'email'],
        required: false
      }]
    });

    const dados = {
      resumo: {
        total_processos: totalProcessos,
        total_usuarios: totalUsuarios,
        data_exportacao: new Date()
      },
      processos: processos
    };

    if (formato === 'csv') {
      // Implementar exportação CSV se necessário
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=dashboard-dados.csv');
      // Aqui você implementaria a conversão para CSV
      res.json({ erro: 'Formato CSV não implementado ainda' });
    } else {
      res.json(dados);
    }
  } catch (error) {
    console.error('Erro ao exportar dados do dashboard:', error);
    res.status(500).json({ erro: 'Erro interno do servidor', detalhes: error.message });
  }
});

module.exports = router;
