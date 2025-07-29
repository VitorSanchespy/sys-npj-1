// Controlador de Processos
const {
  processoModels: Processo,
  usuariosModels: Usuario,
  usuariosProcessoModels: UsuariosProcesso
} = require('../models/indexModels.js');
const { Op } = require('sequelize');

// Lista processos
exports.listarProcessos = async (req, res) => {
  try {
    const { id: userId, role } = req.usuario;
    const db = require('../utils/sequelize');
    let query = `
        SELECT p.*, u.nome as usuario_responsavel
        FROM processos p
        LEFT JOIN usuarios u ON p.idusuario_responsavel = u.id
        WHERE 1=1
    `;
    // Se for Aluno, retorna apenas os processos vinculados ao aluno
    if (role === 'Aluno' || role === 2 || role === '2') {
        query += ` AND p.idusuario_responsavel = ${userId}`;
    }
    query += ` ORDER BY p.criado_em DESC`;
    const [processos] = await db.query(query);
    res.json(processos);
  } catch (error) {
    console.error('Erro ao listar processos:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Cria novo processo
exports.criarProcesso = async (req, res) => {
  try {
    console.log('📝 Dados recebidos para criar processo:', req.body);
    console.log('👤 Usuário autenticado:', req.usuario?.id, req.usuario?.nome);
    
    const { numero_processo, descricao, assistido, contato_assistido } = req.body;
    
    // Criar processo com usuário autenticado como responsável
    const processo = await Processo.create({
      numero_processo,
      descricao,
      assistido,
      contato_assistido,
      idusuario_responsavel: req.usuario.id,
      status: 'ativo'
    });
    
    console.log('✅ Processo criado com sucesso:', processo.id);
    res.status(201).json(processo);
  } catch (error) {
    console.error('❌ Erro ao criar processo:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Atualiza processo
exports.atualizarProcessos = async (req, res) => {
  try {
    const { processo_id } = req.params;
    const processo = await Processo.findByPk(processo_id);
    
    if (!processo) {
      return res.status(404).json({ erro: 'Processo não encontrado' });
    }
    
    // Atualizar processo com dados fornecidos
    await processo.update(req.body);
    res.json(processo);
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Busca processo por ID
exports.buscarProcessoPorId = async (req, res) => {
  try {
    // Buscar processo por ID com usuário responsável
    const processo = await Processo.findByPk(req.params.id, {
      include: [{ model: Usuario, as: 'responsavel' }]
    });
    
    if (!processo) {
      return res.status(404).json({ erro: 'Processo não encontrado' });
    }
    
    res.json(processo);
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Detalhar processo completo
exports.detalharProcessos = async (req, res) => {
  try {
    const { processo_id } = req.params;
    const processo = await Processo.findByPk(processo_id, {
      include: [{ model: Usuario, as: 'responsavel' }]
    });
    
    if (!processo) {
      return res.status(404).json({ erro: 'Processo não encontrado' });
    }
    
    res.json(processo);
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Vincula usuário ao processo
exports.vincularUsuario = async (req, res) => {
  try {
    const { processo_id, usuario_id } = req.body;
    
    // Criar vínculo entre usuário e processo
    const vinculo = await UsuariosProcesso.create({
      processo_id,
      usuario_id
    });
    
    res.status(201).json(vinculo);
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Vincula usuário ao processo (alias)
exports.vincularUsuarioProcessos = exports.vincularUsuario;

// Remove usuário do processo
exports.removerUsuarioProcessos = async (req, res) => {
  try {
    const { processo_id, usuario_id } = req.body;
    
    const vinculo = await UsuariosProcesso.findOne({
      where: { processo_id, usuario_id }
    });
    
    if (!vinculo) {
      return res.status(404).json({ erro: 'Vínculo não encontrado' });
    }
    
    await vinculo.destroy();
    res.json({ mensagem: 'Usuário removido do processo' });
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Lista usuários vinculados a um processo
exports.listarUsuariosPorProcessos = async (req, res) => {
  try {
    const { processo_id } = req.params;
    
    const usuarios = await UsuariosProcesso.findAll({
      where: { processo_id },
      include: [{ model: Usuario, as: 'usuario' }]
    });
    
    res.json(usuarios);
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Lista meus processos
exports.listarMeusProcessos = async (req, res) => {
  try {
    const { id: userId, role } = req.usuario;
    
    let processos;
    if (role === 'Aluno' || role === 2 || role === '2') {
      // Para alunos, buscar processos onde está vinculado
      processos = await UsuariosProcesso.findAll({
        where: { usuario_id: userId },
        include: [{ model: Processo, as: 'processo' }]
      });
    } else {
      // Para professores/admin, buscar processos criados por eles
      processos = await Processo.findAll({
        where: { idusuario_responsavel: userId },
        include: [{ model: Usuario, as: 'responsavel' }]
      });
    }
    
    res.json(processos);
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Lista processos recentes
exports.listarProcessosRecentes = async (req, res) => {
  try {
    const { id: userId, role } = req.usuario;
    const db = require('../utils/sequelize');
    
    let query = `
        SELECT p.*, u.nome as usuario_responsavel
        FROM processos p
        LEFT JOIN usuarios u ON p.idusuario_responsavel = u.id
        WHERE 1=1
    `;
    
    // Filtrar baseado no papel do usuário
    if (role === 'Aluno' || role === 2 || role === '2') { // Aluno
        query += ` AND p.idusuario_responsavel = ${userId}`;
    }
    
    query += ` ORDER BY p.criado_em DESC LIMIT 5`;
    
    const [processos] = await db.query(query);
    
    res.json(processos);
  } catch (error) {
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Estatísticas dos processos
exports.estatisticasProcessos = async (req, res) => {
  try {
    const { id: userId, role } = req.usuario;
    const db = require('../utils/sequelize');
    
    let whereClause = '';
    if (role === 'Professor') {
        whereClause = `WHERE idusuario_responsavel = ${userId}`;
    }
    
    // Contar processos por status
    const [statusResult] = await db.query(`
        SELECT status, COUNT(*) as quantidade 
        FROM processos 
        ${whereClause}
        GROUP BY status
    `);
    
    // Total de processos
    const [totalResult] = await db.query(`
        SELECT COUNT(*) as total 
        FROM processos 
        ${whereClause}
    `);
    
    const stats = {
        total: parseInt(totalResult[0].total),
        porStatus: {},
        ativos: 0
    };
    
    statusResult.forEach(item => {
        const status = item.status || 'indefinido';
        const quantidade = parseInt(item.quantidade);
        stats.porStatus[status] = quantidade;
        
        if (status !== 'arquivado') {
            stats.ativos += quantidade;
        }
    });
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Busca processos
exports.buscarProcessos = async (req, res) => {
  try {
    const { numero, descricao, assistido } = req.query;
    const { id: userId, role } = req.usuario;
    
    let whereClause = {};
    
    if (numero) {
      whereClause.numero_processo = { [Op.like]: `%${numero}%` };
    }
    
    if (descricao) {
      whereClause.descricao = { [Op.like]: `%${descricao}%` };
    }
    
    if (assistido) {
      whereClause.assistido = { [Op.like]: `%${assistido}%` };
    }
    
    // Filtrar por usuário se for aluno
    if (role === 'Aluno' || role === 2 || role === '2') {
      whereClause.idusuario_responsavel = userId;
    }
    
    const processos = await Processo.findAll({
      where: whereClause,
      include: [{ model: Usuario, as: 'responsavel' }]
    });
    
    res.json(processos);
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Exclui processo
exports.excluirProcesso = async (req, res) => {
  try {
    const processo = await Processo.findByPk(req.params.id);
    if (!processo) {
      return res.status(404).json({ erro: 'Processo não encontrado' });
    }
    
    // Remover processo definitivamente
    await processo.destroy();
    res.json({ mensagem: 'Processo excluído' });
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};
