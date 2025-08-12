const express = require('express');
const models = require('../models/indexModel');
const { processoModel, usuarioModel, agendamentoModel, arquivoModel, notificacaoModel } = models;
const Processo = processoModel;
const Usuario = usuarioModel;
const Agendamento = agendamentoModel;
const Arquivo = arquivoModel;
const Notificacao = notificacaoModel;
const authMiddleware = require('../middleware/authMiddleware');
const { Op } = require('sequelize');

const router = express.Router();

// Aplicar middleware de autenticação a todas as rotas
router.use(authMiddleware);

// Helper para determinar o role do usuário
function getUserRole(user) {
  if (user.role_id === 1) return 'Admin';
  if (user.role_id === 2) return 'Professor';
  if (user.role_id === 3) return 'Aluno';
  return 'Usuário';
}

// Endpoint principal do dashboard - dinâmico baseado no perfil
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = getUserRole(req.user);
    
    console.log(`📊 Dashboard solicitado para usuário ${userId} com role ${userRole}`);

    // Verificar se os modelos estão disponíveis
    if (!Processo || !Usuario) {
      return res.status(500).json({ erro: 'Modelos não disponíveis' });
    }

    let dashboardData = {};

    if (userRole === 'Aluno') {
      // Dashboard específico para aluno - apenas seus dados
      const processosDoAluno = await Processo.findAll({
        include: [{
          model: models.usuarioProcessoModel,
          where: { usuario_id: userId },
          required: true
        }],
        attributes: ['id', 'status', 'numero_processo', 'titulo', 'criado_em']
      });

      const processosCount = processosDoAluno.length;
      const processosPorStatus = {};
      
      processosDoAluno.forEach(processo => {
        const status = processo.status || 'Sem status';
        processosPorStatus[status] = (processosPorStatus[status] || 0) + 1;
      });

      // Arquivos do aluno
      let arquivosDoAluno = [];
      let totalArquivos = 0;
      if (Arquivo) {
        try {
          arquivosDoAluno = await Arquivo.findAll({
            where: { usuario_id: userId },
            attributes: ['id', 'nome_arquivo', 'tipo', 'tamanho', 'criado_em']
          });
          totalArquivos = arquivosDoAluno.length;
        } catch (arquivoError) {
          console.warn('Erro ao buscar arquivos do aluno:', arquivoError.message);
        }
      }

      // Notificações do aluno
      let notificacoesDoAluno = [];
      let notificacoesNaoLidas = 0;
      if (Notificacao) {
        try {
          notificacoesDoAluno = await Notificacao.findAll({
            where: { usuario_id: userId },
            attributes: ['id', 'titulo', 'lida', 'tipo', 'criado_em'],
            order: [['criado_em', 'DESC']],
            limit: 10
          });
          notificacoesNaoLidas = await Notificacao.count({
            where: { usuario_id: userId, lida: false }
          });
        } catch (notifError) {
          console.warn('Erro ao buscar notificações do aluno:', notifError.message);
        }
      }

      // Agendamentos do aluno (se modelo existir)
      let agendamentosDoAluno = [];
      if (Agendamento) {
        try {
          agendamentosDoAluno = await Agendamento.findAll({
            where: { usuario_id: userId },
            attributes: ['id', 'tipo_evento', 'status', 'data_evento', 'titulo']
          });
        } catch (agendError) {
          console.warn('Erro ao buscar agendamentos do aluno:', agendError.message);
        }
      }

      dashboardData = {
        processosTotal: processosCount,
        processosAtivos: processosDoAluno.filter(p => 
          !['Concluído', 'Finalizado', 'Arquivado'].includes(p.status)
        ).length,
        processosPorStatus,
        totalArquivos,
        arquivos: arquivosDoAluno,
        notificacoesNaoLidas,
        notificacoes: notificacoesDoAluno,
        agendamentosTotal: agendamentosDoAluno.length,
        agendamentos: agendamentosDoAluno,
        processos: processosDoAluno,
        userRole: 'Aluno'
      };

    } else {
      // Dashboard para Admin/Professor - dados globais
      const totalProcessos = await Processo.count() || 0;
      const totalUsuarios = await Usuario.count() || 0;
      
      const processosAtivos = await Processo.count({ 
        where: { 
          status: { 
            [Op.notIn]: ['Arquivado', 'Concluído', 'Finalizado'] 
          } 
        } 
      }) || 0;
      
      const usuariosAtivos = await Usuario.count({ where: { ativo: true } }) || 0;

      // Arquivos globais
      let totalArquivos = 0;
      if (Arquivo) {
        try {
          totalArquivos = await Arquivo.count() || 0;
        } catch (arquivoError) {
          console.warn('Erro ao buscar contagem de arquivos:', arquivoError.message);
        }
      }

      // Notificações globais para Admin/Professor
      let notificacoesNaoLidas = 0;
      if (Notificacao) {
        try {
          // Para Admin, pegar todas as notificações não lidas do sistema
          if (userRole === 'Admin') {
            notificacoesNaoLidas = await Notificacao.count({
              where: { lida: false }
            });
          } else {
            // Para Professor, apenas suas notificações
            notificacoesNaoLidas = await Notificacao.count({
              where: { usuario_id: userId, lida: false }
            });
          }
        } catch (notifError) {
          console.warn('Erro ao buscar notificações:', notifError.message);
        }
      }

      // Processos por status (global)
      const processosPorStatusQuery = await Processo.findAll({
        attributes: [
          'status', 
          [require('sequelize').fn('COUNT', require('sequelize').col('status')), 'count']
        ],
        group: ['status'],
        raw: true
      });

      const processosPorStatus = {};
      processosPorStatusQuery.forEach(row => {
        processosPorStatus[row.status || 'Sem status'] = parseInt(row.count) || 0;
      });

      // Usuários por tipo
      const usuariosPorTipoQuery = await Usuario.findAll({
        attributes: [
          'role_id', 
          [require('sequelize').fn('COUNT', require('sequelize').col('role_id')), 'count']
        ],
        group: ['role_id'],
        raw: true
      });

      const usuariosPorTipo = { admin: 0, professor: 0, aluno: 0 };
      usuariosPorTipoQuery.forEach(row => {
        if (row.role_id === 1) usuariosPorTipo.admin = parseInt(row.count) || 0;
        else if (row.role_id === 2) usuariosPorTipo.professor = parseInt(row.count) || 0;
        else if (row.role_id === 3) usuariosPorTipo.aluno = parseInt(row.count) || 0;
      });

      // Agendamentos globais (se modelo existir)
      let agendamentosData = { total: 0, porTipo: {}, porStatus: {} };
      if (Agendamento) {
        try {
          const totalAgendamentos = await Agendamento.count() || 0;
          
          const agendamentosPorTipo = await Agendamento.findAll({
            attributes: [
              'tipo_evento', 
              [require('sequelize').fn('COUNT', require('sequelize').col('tipo_evento')), 'count']
            ],
            group: ['tipo_evento'],
            raw: true
          });

          const agendamentosPorStatus = await Agendamento.findAll({
            attributes: [
              'status', 
              [require('sequelize').fn('COUNT', require('sequelize').col('status')), 'count']
            ],
            group: ['status'],
            raw: true
          });

          agendamentosData.total = totalAgendamentos;
          
          agendamentosPorTipo.forEach(row => {
            agendamentosData.porTipo[row.tipo_evento || 'outro'] = parseInt(row.count) || 0;
          });

          agendamentosPorStatus.forEach(row => {
            agendamentosData.porStatus[row.status || 'agendado'] = parseInt(row.count) || 0;
          });

        } catch (agendError) {
          console.warn('Erro ao buscar dados de agendamentos:', agendError.message);
        }
      }

      dashboardData = {
        processosTotal: totalProcessos,
        processosAtivos,
        processosPorStatus,
        totalUsuarios,
        usuariosAtivos,
        usuariosPorTipo,
        totalArquivos,
        notificacoesNaoLidas,
        agendamentosTotal: agendamentosData.total,
        agendamentosPorTipo: agendamentosData.porTipo,
        agendamentosPorStatus: agendamentosData.porStatus,
        userRole: userRole,
        estatisticas: {
          taxaProcessosAtivos: totalProcessos > 0 ? 
            ((processosAtivos / totalProcessos) * 100).toFixed(1) + '%' : '0%',
          taxaUsuariosAtivos: totalUsuarios > 0 ? 
            ((usuariosAtivos / totalUsuarios) * 100).toFixed(1) + '%' : '0%'
        }
      };
    }

    dashboardData.ultimaAtualizacao = new Date().toISOString();
    
    console.log(`✅ Dashboard gerado para ${userRole}:`, {
      processosTotal: dashboardData.processosTotal,
      usuariosTotal: dashboardData.totalUsuarios
    });

    res.json(dashboardData);
  } catch (error) {
    console.error('❌ Erro no dashboard principal:', error);
    res.status(500).json({ 
      erro: 'Erro interno do servidor', 
      detalhes: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

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

// Endpoint para exportar relatório em PDF - dinâmico baseado no perfil
router.get('/exportar', async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = getUserRole(req.user);
    const userName = req.user.nome || 'Usuário';
    
    console.log(`📄 Exportação de relatório solicitada por ${userName} (${userRole})`);

    // Verificar se PDFKit está disponível
    let PDFDocument;
    try {
      PDFDocument = require('pdfkit');
    } catch (pdfError) {
      console.error('PDFKit não está instalado');
      return res.status(500).json({ 
        erro: 'Módulo de PDF não disponível',
        sugestao: 'Execute: npm install pdfkit'
      });
    }

    // Buscar dados baseados no perfil
    let relatorioData = {};
    
    if (userRole === 'Aluno') {
      // Relatório específico do aluno
      const processosDoAluno = await Processo.findAll({
        include: [{
          model: models.usuarioProcessoModel,
          where: { usuario_id: userId },
          required: true
        }],
        attributes: ['id', 'status', 'numero_processo', 'titulo', 'criado_em']
      });

      relatorioData = {
        titulo: `Relatório Individual - ${userName}`,
        usuario: userName,
        userRole: 'Aluno',
        processosTotal: processosDoAluno.length,
        processosAtivos: processosDoAluno.filter(p => 
          !['Concluído', 'Finalizado', 'Arquivado'].includes(p.status)
        ).length,
        processos: processosDoAluno.slice(0, 5) // Últimos 5 processos
      };
    } else {
      // Relatório administrativo completo
      const totalProcessos = await Processo.count() || 0;
      const totalUsuarios = await Usuario.count() || 0;
      const processosAtivos = await Processo.count({ 
        where: { 
          status: { 
            [Op.notIn]: ['Arquivado', 'Concluído', 'Finalizado'] 
          } 
        } 
      }) || 0;
      const usuariosAtivos = await Usuario.count({ where: { ativo: true } }) || 0;

      relatorioData = {
        titulo: 'Relatório Administrativo do Sistema NPJ',
        usuario: userName,
        userRole: userRole,
        processosTotal: totalProcessos,
        processosAtivos,
        totalUsuarios,
        usuariosAtivos,
        taxaProcessosAtivos: totalProcessos > 0 ? 
          ((processosAtivos / totalProcessos) * 100).toFixed(1) : 0,
        taxaUsuariosAtivos: totalUsuarios > 0 ? 
          ((usuariosAtivos / totalUsuarios) * 100).toFixed(1) : 0
      };
    }

    // Criar documento PDF
    const doc = new PDFDocument({ margin: 50 });
    
    // Configurar headers para download
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `relatorio-npj-${userRole.toLowerCase()}-${timestamp}.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    // Pipe o PDF para a resposta
    doc.pipe(res);
    
    // Header do documento
    doc.fontSize(20).font('Helvetica-Bold');
    doc.text(relatorioData.titulo, { align: 'center' });
    
    doc.moveDown();
    doc.fontSize(14).font('Helvetica');
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`);
    doc.text(`Usuário: ${relatorioData.usuario} (${relatorioData.userRole})`);
    
    doc.moveDown();
    
    if (userRole === 'Aluno') {
      // Conteúdo para aluno
      doc.fontSize(16).font('Helvetica-Bold');
      doc.text('Resumo dos Seus Processos:', { underline: true });
      
      doc.moveDown();
      doc.fontSize(12).font('Helvetica');
      doc.text(`• Total de Processos Atribuídos: ${relatorioData.processosTotal}`);
      doc.text(`• Processos Ativos: ${relatorioData.processosAtivos}`);
      doc.text(`• Processos Finalizados: ${relatorioData.processosTotal - relatorioData.processosAtivos}`);
      
      if (relatorioData.processos && relatorioData.processos.length > 0) {
        doc.moveDown();
        doc.fontSize(14).font('Helvetica-Bold');
        doc.text('Últimos Processos:');
        
        doc.fontSize(10).font('Helvetica');
        relatorioData.processos.forEach((processo, index) => {
          doc.text(`${index + 1}. ${processo.numero_processo || 'S/N'} - ${processo.titulo || 'Sem título'}`);
          doc.text(`   Status: ${processo.status || 'Não definido'}`);
          doc.moveDown(0.5);
        });
      }
    } else {
      // Conteúdo administrativo
      doc.fontSize(16).font('Helvetica-Bold');
      doc.text('Estatísticas Gerais do Sistema:', { underline: true });
      
      doc.moveDown();
      doc.fontSize(12).font('Helvetica');
      doc.text(`• Total de Processos: ${relatorioData.processosTotal}`);
      doc.text(`• Processos Ativos: ${relatorioData.processosAtivos} (${relatorioData.taxaProcessosAtivos}%)`);
      doc.text(`• Processos Finalizados: ${relatorioData.processosTotal - relatorioData.processosAtivos}`);
      
      doc.moveDown();
      doc.text(`• Total de Usuários: ${relatorioData.totalUsuarios}`);
      doc.text(`• Usuários Ativos: ${relatorioData.usuariosAtivos} (${relatorioData.taxaUsuariosAtivos}%)`);
      doc.text(`• Usuários Inativos: ${relatorioData.totalUsuarios - relatorioData.usuariosAtivos}`);
      
      doc.moveDown();
      doc.fontSize(14).font('Helvetica-Bold');
      doc.text('Indicadores de Performance:');
      
      doc.fontSize(12).font('Helvetica');
      doc.text(`• Taxa de Utilização do Sistema: ${relatorioData.taxaUsuariosAtivos}%`);
      doc.text(`• Taxa de Processos em Andamento: ${relatorioData.taxaProcessosAtivos}%`);
    }

    // Footer
    doc.moveDown(2);
    doc.fontSize(10).font('Helvetica');
    doc.text('_'.repeat(80));
    doc.text('Sistema NPJ - Núcleo de Práticas Jurídicas', { align: 'center' });
    doc.text('Relatório gerado automaticamente pelo sistema', { align: 'center' });
    
    // Finalizar o documento
    doc.end();
    
    console.log(`✅ Relatório PDF gerado para ${userName} (${userRole})`);
    
  } catch (error) {
    console.error('❌ Erro ao gerar PDF:', error);
    res.status(500).json({ 
      erro: 'Erro ao gerar relatório PDF', 
      detalhes: error.message,
      sugestao: 'Verifique se o PDFKit está instalado: npm install pdfkit'
    });
  }
});

module.exports = router;
