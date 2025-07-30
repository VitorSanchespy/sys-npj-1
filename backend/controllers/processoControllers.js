// Controlador de Processos
const {
  processoModels: Processo,
  usuariosModels: Usuario,
  usuariosProcessoModels: UsuariosProcesso
} = require('../models/indexModels');

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
      query += ` AND p.id IN (
        SELECT processo_id FROM usuarios_processo 
        WHERE usuario_id = ${userId}
      )`;
    }
    
    query += ' ORDER BY p.data_atualizacao DESC';
    
    const processos = await db.query(query, { type: db.QueryTypes.SELECT });
    res.json(processos);
  } catch (error) {
    console.error('Erro ao listar processos:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Buscar processo por ID
exports.buscarProcessoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const { id: userId, role } = req.usuario;
    
    // Se for Aluno, verificar se tem acesso ao processo
    if (role === 'Aluno' || role === 2 || role === '2') {
      const acesso = await UsuariosProcesso.findOne({
        where: { usuario_id: userId, processo_id: id }
      });
      
      if (!acesso) {
        return res.status(403).json({ erro: 'Acesso negado ao processo' });
      }
    }
    
    const processo = await Processo.findByPk(id);
    if (!processo) {
      return res.status(404).json({ erro: 'Processo não encontrado' });
    }
    
    res.json(processo);
  } catch (error) {
    console.error('Erro ao buscar processo:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Criar novo processo
exports.criarProcesso = async (req, res) => {
  try {
    const {
      numero_processo,
      parte_contraria,
      comarca,
      vara,
      valor_causa,
      tipo_acao,
      materia_assunto_id,
      fase_id,
      local_tramitacao_id,
      observacoes,
      usuario_responsavel_id
    } = req.body;

    const novoProcesso = await Processo.create({
      numero_processo,
      parte_contraria,
      comarca,
      vara,
      valor_causa,
      tipo_acao,
      materia_assunto_id,
      fase_id,
      local_tramitacao_id,
      observacoes,
      idusuario_responsavel: usuario_responsavel_id || req.usuario.id,
      data_atualizacao: new Date()
    });

    res.status(201).json({
      message: 'Processo criado com sucesso',
      processo: novoProcesso
    });
  } catch (error) {
    console.error('Erro ao criar processo:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Atualizar processo
exports.atualizarProcessos = async (req, res) => {
  try {
    const { processo_id } = req.params;
    const { role } = req.usuario;
    
    // Verificar se o processo existe
    const processo = await Processo.findByPk(processo_id);
    if (!processo) {
      return res.status(404).json({ erro: 'Processo não encontrado' });
    }

    // Se for Aluno, verificar se tem acesso ao processo
    if (role === 'Aluno' || role === 2 || role === '2') {
      const acesso = await UsuariosProcesso.findOne({
        where: { usuario_id: req.usuario.id, processo_id: processo_id }
      });
      
      if (!acesso) {
        return res.status(403).json({ erro: 'Acesso negado ao processo' });
      }
    }

    // Atualizar o processo
    await processo.update({
      ...req.body,
      data_atualizacao: new Date()
    });

    res.json({
      message: 'Processo atualizado com sucesso',
      processo
    });
  } catch (error) {
    console.error('Erro ao atualizar processo:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Excluir processo
exports.excluirProcesso = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.usuario;

    // Apenas Admin e Professor podem excluir processos
    if (role !== 'Admin' && role !== 'Professor') {
      return res.status(403).json({ erro: 'Acesso negado' });
    }

    const processo = await Processo.findByPk(id);
    if (!processo) {
      return res.status(404).json({ erro: 'Processo não encontrado' });
    }

    await processo.destroy();
    res.json({ message: 'Processo excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir processo:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Vincular usuário ao processo
exports.vincularUsuario = async (req, res) => {
  try {
    const { processo_id, usuario_id } = req.body;

    // Verificar se o processo existe
    const processo = await Processo.findByPk(processo_id);
    if (!processo) {
      return res.status(404).json({ erro: 'Processo não encontrado' });
    }

    // Verificar se o usuário existe
    const usuario = await Usuario.findByPk(usuario_id);
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    // Verificar se já não está vinculado
    const vinculoExistente = await UsuariosProcesso.findOne({
      where: { usuario_id, processo_id }
    });

    if (vinculoExistente) {
      return res.status(400).json({ erro: 'Usuário já está vinculado ao processo' });
    }

    // Criar vínculo
    await UsuariosProcesso.create({ usuario_id, processo_id });

    res.json({ message: 'Usuário vinculado ao processo com sucesso' });
  } catch (error) {
    console.error('Erro ao vincular usuário:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Remover usuário do processo
exports.removerUsuarioProcessos = async (req, res) => {
  try {
    const { processo_id, usuario_id } = req.body;

    const vinculo = await UsuariosProcesso.findOne({
      where: { usuario_id, processo_id }
    });

    if (!vinculo) {
      return res.status(404).json({ erro: 'Vínculo não encontrado' });
    }

    await vinculo.destroy();
    res.json({ message: 'Usuário removido do processo com sucesso' });
  } catch (error) {
    console.error('Erro ao remover usuário do processo:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Listar usuários por processo
exports.listarUsuariosPorProcessos = async (req, res) => {
  try {
    const { processo_id } = req.params;
    const { role } = req.usuario;

    // Se for Aluno, verificar se tem acesso ao processo
    if (role === 'Aluno' || role === 2 || role === '2') {
      const acesso = await UsuariosProcesso.findOne({
        where: { usuario_id: req.usuario.id, processo_id }
      });
      
      if (!acesso) {
        return res.status(403).json({ erro: 'Acesso negado ao processo' });
      }
    }

    const db = require('../utils/sequelize');
    const usuarios = await db.query(`
      SELECT u.id, u.nome, u.email, r.nome as role
      FROM usuarios u
      INNER JOIN usuarios_processo up ON u.id = up.usuario_id
      INNER JOIN roles r ON u.role_id = r.id
      WHERE up.processo_id = ?
    `, {
      replacements: [processo_id],
      type: db.QueryTypes.SELECT
    });

    res.json(usuarios);
  } catch (error) {
    console.error('Erro ao listar usuários do processo:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Listar processos do usuário logado
exports.listarMeusProcessos = async (req, res) => {
  try {
    const { id: userId } = req.usuario;
    const db = require('../utils/sequelize');
    
    const processos = await db.query(`
      SELECT p.*, u.nome as usuario_responsavel
      FROM processos p
      LEFT JOIN usuarios u ON p.idusuario_responsavel = u.id
      INNER JOIN usuarios_processo up ON p.id = up.processo_id
      WHERE up.usuario_id = ?
      ORDER BY p.data_atualizacao DESC
    `, {
      replacements: [userId],
      type: db.QueryTypes.SELECT
    });

    res.json(processos);
  } catch (error) {
    console.error('Erro ao listar meus processos:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Buscar processos
exports.buscarProcessos = async (req, res) => {
  try {
    const { termo } = req.query;
    const { id: userId, role } = req.usuario;
    
    if (!termo) {
      return res.status(400).json({ erro: 'Termo de busca é obrigatório' });
    }

    const db = require('../utils/sequelize');
    let query = `
      SELECT p.*, u.nome as usuario_responsavel
      FROM processos p
      LEFT JOIN usuarios u ON p.idusuario_responsavel = u.id
      WHERE (p.numero_processo LIKE ? OR p.parte_contraria LIKE ?)
    `;

    const termoBusca = `%${termo}%`;
    let replacements = [termoBusca, termoBusca];

    // Se for Aluno, filtrar apenas processos vinculados
    if (role === 'Aluno' || role === 2 || role === '2') {
      query += ` AND p.id IN (
        SELECT processo_id FROM usuarios_processo 
        WHERE usuario_id = ?
      )`;
      replacements.push(userId);
    }

    query += ' ORDER BY p.data_atualizacao DESC';

    const processos = await db.query(query, {
      replacements,
      type: db.QueryTypes.SELECT
    });

    res.json(processos);
  } catch (error) {
    console.error('Erro ao buscar processos:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Processos recentes
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

    // Se for Aluno, filtrar apenas processos vinculados
    if (role === 'Aluno' || role === 2 || role === '2') {
      query += ` AND p.id IN (
        SELECT processo_id FROM usuarios_processo 
        WHERE usuario_id = ${userId}
      )`;
    }

    query += ' ORDER BY p.data_atualizacao DESC LIMIT 10';

    const processos = await db.query(query, { type: db.QueryTypes.SELECT });
    res.json(processos);
  } catch (error) {
    console.error('Erro ao listar processos recentes:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Estatísticas de processos
exports.estatisticasProcessos = async (req, res) => {
  try {
    const { id: userId, role } = req.usuario;
    const db = require('../utils/sequelize');

    let baseQuery = '';
    // Se for Aluno, filtrar apenas processos vinculados
    if (role === 'Aluno' || role === 2 || role === '2') {
      baseQuery = ` AND p.id IN (
        SELECT processo_id FROM usuarios_processo 
        WHERE usuario_id = ${userId}
      )`;
    }

    const estatisticas = await db.query(`
      SELECT 
        COUNT(*) as total_processos,
        COUNT(CASE WHEN p.data_atualizacao >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as processos_recentes,
        COUNT(DISTINCT p.idusuario_responsavel) as usuarios_responsaveis
      FROM processos p
      WHERE 1=1 ${baseQuery}
    `, { type: db.QueryTypes.SELECT });

    res.json(estatisticas[0]);
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Detalhar processos
exports.detalharProcessos = async (req, res) => {
  try {
    const { processo_id } = req.params;
    const { id: userId, role } = req.usuario;

    // Se for Aluno, verificar se tem acesso ao processo
    if (role === 'Aluno' || role === 2 || role === '2') {
      const acesso = await UsuariosProcesso.findOne({
        where: { usuario_id: userId, processo_id }
      });
      
      if (!acesso) {
        return res.status(403).json({ erro: 'Acesso negado ao processo' });
      }
    }

    const db = require('../utils/sequelize');
    const detalhes = await db.query(`
      SELECT 
        p.*,
        u.nome as usuario_responsavel,
        ma.descricao as materia_assunto,
        f.descricao as fase,
        lt.descricao as local_tramitacao
      FROM processos p
      LEFT JOIN usuarios u ON p.idusuario_responsavel = u.id
      LEFT JOIN materia_assunto ma ON p.materia_assunto_id = ma.id
      LEFT JOIN fases f ON p.fase_id = f.id
      LEFT JOIN local_tramitacao lt ON p.local_tramitacao_id = lt.id
      WHERE p.id = ?
    `, {
      replacements: [processo_id],
      type: db.QueryTypes.SELECT
    });

    if (detalhes.length === 0) {
      return res.status(404).json({ erro: 'Processo não encontrado' });
    }

    res.json(detalhes[0]);
  } catch (error) {
    console.error('Erro ao detalhar processo:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};
