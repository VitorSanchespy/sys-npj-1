const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { processoModel: Processo, usuarioModel: Usuario } = require('../models/indexModel');
const PDFDocument = require('pdfkit');
const verificarToken = require('../middleware/authMiddleware');

// Aplicar autenticação a todas as rotas
router.use(verificarToken);

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
    const statusMap = { em_andamento: 0, aguardando: 0, finalizado: 0, arquivado: 0, outros: 0 };
    processosPorStatus.forEach(row => {
      const raw = row.status || '';
      const n = normalize(raw);
      if (n.includes('andamento')) statusMap.em_andamento += parseInt(row.get('count'));
      else if (n.includes('aguard')) statusMap.aguardando += parseInt(row.get('count'));
      else if (n.includes('finaliz') || n.includes('conclu')) statusMap.finalizado += parseInt(row.get('count'));
      else if (n.includes('arquiv')) statusMap.arquivado += parseInt(row.get('count'));
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
    const statusMap = { em_andamento: 0, aguardando: 0, finalizado: 0, arquivado: 0, outros: 0 };
    processosPorStatus.forEach(row => {
      const raw = row.status || '';
      const n = normalize(raw);
      if (n.includes('andamento')) statusMap.em_andamento += parseInt(row.get('count'));
      else if (n.includes('aguard')) statusMap.aguardando += parseInt(row.get('count'));
      else if (n.includes('finaliz') || n.includes('conclu')) statusMap.finalizado += parseInt(row.get('count'));
      else if (n.includes('arquiv')) statusMap.arquivado += parseInt(row.get('count'));
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

// Endpoint para gerar relatório completo em PDF
router.get('/relatorio', async (req, res) => {
  try {
    // Buscar dados completos
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

    const totalUsuarios = await Usuario.count();
    const usuariosAtivos = await Usuario.count({ where: { ativo: true } });
    
    const usuarios = await Usuario.findAll({ 
      attributes: ['role_id'], 
      raw: true 
    });
    
    const usuariosPorTipo = { aluno: 0, professor: 0, admin: 0 };
    usuarios.forEach(u => {
      if (u.role_id === 1) usuariosPorTipo.admin++;
      else if (u.role_id === 2) usuariosPorTipo.aluno++;
      else if (u.role_id === 3) usuariosPorTipo.professor++;
    });

    // Criar PDF
    const doc = new PDFDocument();
    
    // Headers para download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=relatorio-npj-${new Date().toISOString().split('T')[0]}.pdf`);
    
    // Pipe o PDF para a resposta
    doc.pipe(res);
    
    // Título
    doc.fontSize(20).text('RELATÓRIO COMPLETO - SISTEMA NPJ', { align: 'center' });
    doc.moveDown();
    
    // Data de geração
    doc.fontSize(12).text(`Data de Geração: ${new Date().toLocaleDateString('pt-BR')}`, { align: 'right' });
    doc.moveDown(2);
    
    // Resumo Geral
    doc.fontSize(16).text('RESUMO GERAL', { underline: true });
    doc.moveDown();
    doc.fontSize(12);
    doc.text(`Total de Processos: ${totalProcessos}`);
    doc.text(`Processos Ativos: ${processosAtivos}`);
    doc.text(`Processos Concluídos/Arquivados: ${totalProcessos - processosAtivos}`);
    doc.moveDown();
    doc.text(`Total de Usuários: ${totalUsuarios}`);
    doc.text(`Usuários Ativos: ${usuariosAtivos}`);
    doc.text(`Usuários Inativos: ${totalUsuarios - usuariosAtivos}`);
    doc.moveDown(2);
    
    // Distribuição por Status
    doc.fontSize(16).text('DISTRIBUIÇÃO DE PROCESSOS POR STATUS', { underline: true });
    doc.moveDown();
    doc.fontSize(12);
    processosPorStatus.forEach(row => {
      doc.text(`${row.status}: ${row.get('count')} processos`);
    });
    doc.moveDown(2);
    
    // Distribuição de Usuários
    doc.fontSize(16).text('DISTRIBUIÇÃO DE USUÁRIOS POR TIPO', { underline: true });
    doc.moveDown();
    doc.fontSize(12);
    doc.text(`Administradores: ${usuariosPorTipo.admin}`);
    doc.text(`Professores: ${usuariosPorTipo.professor}`);
    doc.text(`Alunos: ${usuariosPorTipo.aluno}`);
    doc.moveDown(2);
    
    // Estatísticas Gerais
    doc.fontSize(16).text('ESTATÍSTICAS ADICIONAIS', { underline: true });
    doc.moveDown();
    doc.fontSize(12);
    const taxaAtivos = totalProcessos > 0 ? ((processosAtivos / totalProcessos) * 100).toFixed(1) : 0;
    const taxaUsuariosAtivos = totalUsuarios > 0 ? ((usuariosAtivos / totalUsuarios) * 100).toFixed(1) : 0;
    doc.text(`Taxa de Processos Ativos: ${taxaAtivos}%`);
    doc.text(`Taxa de Usuários Ativos: ${taxaUsuariosAtivos}%`);
    doc.moveDown(2);
    
    // Rodapé
    doc.fontSize(10).text('Relatório gerado automaticamente pelo Sistema NPJ', { align: 'center' });
    
    // Finalizar PDF
    doc.end();
    
  } catch (error) {
    console.error('Erro ao gerar relatório PDF:', error);
    res.status(500).json({ erro: 'Erro ao gerar relatório PDF' });
  }
});

module.exports = router;
