const express = require('express');
const models = require('../models/indexModel');
const { processoModel, usuarioModel } = models;
const Processo = processoModel;
const Usuario = usuarioModel;
const authMiddleware = require('../middleware/authMiddleware');
const { Op } = require('sequelize');

const router = express.Router();

// Aplicar middleware de autenticação a todas as rotas
router.use(authMiddleware);

// Endpoint para estatísticas gerais do sistema (alias para /stats)
router.get('/estatisticas', async (req, res) => {
  try {
    // Verificar se os modelos estão disponíveis
    if (!Processo || !Usuario) {
      return res.status(500).json({ erro: 'Modelos não disponíveis' });
    }

    // Processos - com tratamento de erro
    let totalProcessos = 0;
    let processosAtivos = 0;
    try {
      totalProcessos = await Processo.count();
      processosAtivos = await Processo.count({ 
        where: { 
          status: { 
            [Op.notIn]: ['arquivado', 'Concluído', 'concluído', 'Finalizado', 'finalizado'] 
          } 
        } 
      });
    } catch (processoError) {
      console.error('Erro ao contar processos:', processoError);
    }

    // Usuários - com tratamento de erro
    let totalUsuarios = 0;
    let usuariosAtivos = 0;
    let usuariosPorTipo = { aluno: 0, professor: 0, admin: 0 };
    
    try {
      totalUsuarios = await Usuario.count();
      usuariosAtivos = await Usuario.count({ where: { ativo: true } });
      
      const usuarios = await Usuario.findAll({ attributes: ['role_id'], raw: true });
      usuarios.forEach(u => {
        if (u.role_id === 1) usuariosPorTipo.admin++;
        else if (u.role_id === 2) usuariosPorTipo.professor++;
        else if (u.role_id === 3) usuariosPorTipo.aluno++;
      });
    } catch (usuarioError) {
      console.error('Erro ao contar usuários:', usuarioError);
    }

    res.json({
      processos: {
        total: totalProcessos,
        ativos: processosAtivos,
        arquivados: totalProcessos - processosAtivos,
        porStatus: { em_andamento: processosAtivos, finalizado: totalProcessos - processosAtivos }
      },
      usuarios: {
        total: totalUsuarios,
        ativos: usuariosAtivos,
        porTipo: usuariosPorTipo
      },
      agendamentos: {
        total: 0,
        hoje: 0,
        proximaSemana: 0
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro no endpoint /estatisticas:', error);
    res.status(500).json({ erro: 'Erro ao buscar estatísticas do dashboard' });
  }
});

// Endpoint para estatísticas gerais do sistema (processos e usuários)
router.get('/stats', async (req, res) => {
  try {
    // Processos - com proteção contra erros
    let totalProcessos = 0;
    let processosAtivos = 0;
    let statusMap = { em_andamento: 0, aguardando: 0, finalizado: 0, arquivado: 0, suspenso: 0, outros: 0 };
    
    try {
      totalProcessos = await Processo.count() || 0;
      processosAtivos = await Processo.count({ 
        where: { 
          status: { 
            [Op.notIn]: ['arquivado', 'Concluído', 'concluído', 'Finalizado', 'finalizado'] 
          } 
        } 
      }) || 0;
      
      // Buscar processos com raw: true para evitar problemas com .get()
      const processosPorStatus = await Processo.findAll({
        attributes: ['status', [require('sequelize').fn('COUNT', require('sequelize').col('status')), 'count']],
        group: ['status'],
        raw: true
      });
      
      // Mapeamento flexível de status (ignora maiúsculas/minúsculas e acentos)
      const normalize = s => s && s.normalize('NFD').replace(/[^\w\s]/g, '').toLowerCase();
      
      if (processosPorStatus && Array.isArray(processosPorStatus)) {
        processosPorStatus.forEach(row => {
          if (row && typeof row === 'object') {
            const raw = row.status || '';
            const n = normalize(raw);
            const count = parseInt(row.count) || 0;
            
            if (n.includes('andamento')) statusMap.em_andamento += count;
            else if (n.includes('aguard')) statusMap.aguardando += count;
            else if (n.includes('finaliz') || n.includes('conclu')) statusMap.finalizado += count;
            else if (n.includes('arquiv')) statusMap.arquivado += count;
            else if (n.includes('suspen')) statusMap.suspenso += count;
            else statusMap.outros += count;
          }
        });
      }
    } catch (processError) {
      console.error('Erro ao buscar dados de processos:', processError);
    }

    // Usuários - com proteção contra erros
    let totalUsuarios = 0;
    let usuariosAtivos = 0;
    let usuariosPorTipo = { aluno: 0, professor: 0, admin: 0, outros: 0 };
    
    try {
      totalUsuarios = await Usuario.count() || 0;
      usuariosAtivos = await Usuario.count({ where: { ativo: true } }) || 0;
      const usuarios = await Usuario.findAll({ attributes: ['role_id'], raw: true });
      
      if (usuarios && Array.isArray(usuarios)) {
        usuarios.forEach(u => {
          if (u && typeof u === 'object') {
            if (u.role_id === 1) usuariosPorTipo.admin++;
            else if (u.role_id === 2) usuariosPorTipo.professor++;
            else if (u.role_id === 3) usuariosPorTipo.aluno++;
            else usuariosPorTipo.outros++;
          }
        });
      }
    } catch (userError) {
      console.error('Erro ao buscar dados de usuários:', userError);
    }

    res.json({
      totalProcessos,
      processosAtivos,
      processosPorStatus: statusMap,
      totalUsuarios,
      usuariosAtivos,
      usuariosPorTipo
    });
  } catch (error) {
    console.error('Erro no dashboard/stats:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

// Endpoint simplificado para status detalhado
router.get('/status-detalhado', async (req, res) => {
  try {
    const stats = {
      servidor: {
        status: 'online',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      },
      banco: {
        status: 'conectado',
        disponivel: global.dbAvailable || false
      },
      sistema: {
        versao: '1.0.0',
        ambiente: process.env.NODE_ENV || 'development'
      }
    };

    res.json(stats);
  } catch (error) {
    console.error('Erro no status-detalhado:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

// Endpoint simplificado para exportar
router.get('/exportar', async (req, res) => {
  try {
    // Simular exportação de relatório
    const dadosExportacao = {
      titulo: 'Relatório do Sistema NPJ',
      dataGeracao: new Date().toISOString(),
      resumo: {
        totalProcessos: 0,
        totalUsuarios: 0,
        totalAgendamentos: 0
      }
    };

    // Tentar buscar dados reais
    try {
      dadosExportacao.resumo.totalProcessos = await Processo.count() || 0;
      dadosExportacao.resumo.totalUsuarios = await Usuario.count() || 0;
    } catch (dataError) {
      console.log('Erro ao buscar dados para exportação:', dataError.message);
    }

    res.json(dadosExportacao);
  } catch (error) {
    console.error('Erro no exportar:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

module.exports = router;
