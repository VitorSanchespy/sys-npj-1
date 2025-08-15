// Controller de Processos - Gerencia operações de processos jurídicos
const NotificacaoService = require('../services/notificacaoService');

// Função utilitária para verificar disponibilidade do banco
function isDbAvailable() {
  return global.dbAvailable || false;
}


// Obter processo por ID - endpoint: GET /api/processos/:id
exports.obterProcesso = async (req, res) => {
  try {
    const { id } = req.params;
    let processo = null;
    
    if (isDbAvailable()) {
      const { processoModel: Processo, usuarioModel: Usuario } = require('../models/indexModel');
      processo = await Processo.findByPk(id, {
        include: [{ model: Usuario, as: 'responsavel' }]
      });
    } 
    
    if (!processo) {
      return res.status(404).json({ erro: 'Processo não encontrado' });
    }
    
    res.json(processo);
    
  } catch (error) {
    console.error('Erro ao obter processo:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Obter processo com detalhes completos - endpoint: GET /api/processos/:id/detalhes
exports.obterProcessoDetalhes = async (req, res) => {
  try {
    const { id } = req.params;
    let processo = null;
    
    if (isDbAvailable()) {
      const { 
        processoModel: Processo, 
        usuarioModel: Usuario,
        usuarioProcessoModel: UsuarioProcesso,
        atualizacaoProcessoModel: AtualizacaoProcesso,
        arquivoModel: Arquivo,
        materiaAssuntoModel: MateriaAssunto,
        faseModel: Fase,
        diligenciaModel: Diligencia,
        localTramitacaoModel: LocalTramitacao
      } = require('../models/indexModel');

      processo = await Processo.findByPk(id, {
        include: [
          { model: Usuario, as: 'responsavel' },
          { 
            model: AtualizacaoProcesso, 
            as: 'atualizacoes',
            include: [{ model: Usuario, as: 'usuario' }],
            order: [['data_atualizacao', 'DESC']]
          },
          { model: Arquivo, as: 'arquivos' },
          { model: MateriaAssunto, as: 'materiaAssunto' },
          { model: Fase, as: 'fase' },
          { model: Diligencia, as: 'diligencia' },
          { model: LocalTramitacao, as: 'localTramitacao' }
        ]
      });

      // Buscar o primeiro usuário vinculado ao processo (quem criou ou o primeiro da tabela de ligação)
      let responsavelVinculado = null;
      const usuariosProcesso = await UsuarioProcesso.findAll({
        where: { processo_id: id },
        include: [{ model: Usuario, as: 'usuario' }],
        order: [['id', 'ASC']]
      });
      if (usuariosProcesso.length > 0) {
        const usuario = usuariosProcesso[0].usuario;
        responsavelVinculado = usuario ? {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          telefone: usuario.telefone
        } : null;
      }
      // Adiciona ao objeto de resposta
      const processoObj = processo.toJSON();
      processoObj.responsavelVinculado = responsavelVinculado;
      res.json(processoObj);
      return;
    }
    if (!processo) {
      return res.status(404).json({ erro: 'Processo não encontrado' });
    }
    res.json(processo);
    
  } catch (error) {
    console.error('Erro ao obter detalhes do processo:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Listar usuários vinculados ao processo - endpoint: GET /api/processos/:id/usuarios
exports.listarUsuariosProcesso = async (req, res) => {
  try {
    const { id } = req.params;
    let usuarios = [];
    
    if (isDbAvailable()) {
      const { 
        usuarioProcessoModel: UsuarioProcesso,
        usuarioModel: Usuario,
        roleModel: Role
      } = require('../models/indexModel');
      
      const usuariosProcesso = await UsuarioProcesso.findAll({
        where: { processo_id: id },
        include: [{
          model: Usuario,
          as: 'usuario',
          include: [{ model: Role, as: 'role' }]
        }]
      });
      
      usuarios = usuariosProcesso.map(up => {
        const usuario = up.usuario;
        return {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          telefone: usuario.telefone,
          role: usuario.role ? usuario.role.nome : 'Não definido'
        };
      });
    }
    
    res.json(usuarios);
    
  } catch (error) {
    console.error('Erro ao listar usuários do processo:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Criar novo processo - endpoint: POST /api/processos
exports.criarProcesso = async (req, res) => {
  try {
    const userRole = req.user.role;
    
    // Verificar permissões - apenas Admin e Professor podem criar processos
    if (userRole === 'Aluno') {
      return res.status(403).json({ 
        erro: 'Acesso negado. Alunos não podem criar processos.' 
      });
    }
    
    if (!isDbAvailable()) {
      return res.status(503).json({ erro: 'Banco de dados não disponível' });
    }

    const {
      numero_processo,
      titulo,
      num_processo_sei,
      assistido,
      descricao,
      status = 'Em andamento',
      materia_assunto_id,
      local_tramitacao_id,
      sistema = 'Físico',
      fase_id,
      diligencia_id,
      contato_assistido,
      idusuario_responsavel,
      tipo_processo,
      observacoes
    } = req.body;

    // Validações básicas
    if (!numero_processo || !titulo || !contato_assistido) {
      return res.status(400).json({ 
        erro: 'Número do processo, título e contato assistido são obrigatórios' 
      });
    }

    const { 
      processoModel: Processo,
      atualizacaoProcessoModel: AtualizacaoProcesso
    } = require('../models/indexModel');
    
    // Criar processo com todos os campos disponíveis
    const novoProcesso = await Processo.create({
      numero_processo,
      titulo,
      num_processo_sei,
      assistido,
      descricao: descricao || '',
      status,
      materia_assunto_id,
      local_tramitacao_id,
      sistema,
      fase_id,
      diligencia_id,
      contato_assistido,
      idusuario_responsavel: idusuario_responsavel || req.user.id,
      tipo_processo,
      observacoes
    });
    

    // Vincular automaticamente o criador ao processo
    const { usuarioProcessoModel: UsuarioProcesso } = require('../models/indexModel');
    await UsuarioProcesso.create({
      usuario_id: req.user.id,
      processo_id: novoProcesso.id
    });

    // Registrar criação no histórico
    await AtualizacaoProcesso.create({
      usuario_id: req.user.id,
      processo_id: novoProcesso.id,
      tipo_atualizacao: 'Criação do Processo',
      descricao: `Processo "${titulo}" (${numero_processo}) criado no sistema`
    });

    // Notificar criação do processo
    try {
      const notificacaoService = new NotificacaoService();
      const { usuarioModel: Usuario } = require('../models/indexModel');
      const criador = await Usuario.findByPk(req.user.id);
      
      if (criador) {
        await notificacaoService.notificarProcessoCriado(novoProcesso, criador, [criador]);
      }
    } catch (notificationError) {
      console.error('⚠️ Erro ao enviar notificação de processo criado:', notificationError.message);
    }
    
    res.status(201).json({
      success: true,
      processo: novoProcesso,
      message: 'Processo criado com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao criar processo:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Atualizar dados do processo - endpoint: PUT /api/processos/:id
exports.atualizarProcesso = async (req, res) => {
  try {
    const { id } = req.params;
    const dadosAtualizacao = req.body;
    // Bloquear alteração se processo estiver concluído
    const { processoModel: Processo } = require('../models/indexModel');
    const processo = await Processo.findByPk(id);
    if (!processo) {
      return res.status(404).json({ erro: 'Processo não encontrado' });
    }
    if (processo.status === 'Concluído') {
      return res.status(403).json({ erro: 'Processo concluído não pode ser alterado. Reabra para modificar.' });
    }
    const usuarioId = req.user.id; // ID do usuário que está fazendo a atualização
    
    console.log('🔍 Debug atualização processo:', {
      processId: id,
      usuarioId,
      dadosRecebidos: JSON.stringify(dadosAtualizacao, null, 2),
      userAgent: req.headers['user-agent'],
      contentType: req.headers['content-type']
    });
    
    // Validar se os dados necessários existem
    if (!dadosAtualizacao || Object.keys(dadosAtualizacao).length === 0) {
      console.log('❌ Dados de atualização vazios');
      return res.status(400).json({ erro: 'Dados de atualização não fornecidos' });
    }
    
    // Converter strings para integers nos campos de FK
    if (dadosAtualizacao.materia_assunto_id && typeof dadosAtualizacao.materia_assunto_id === 'string') {
      dadosAtualizacao.materia_assunto_id = parseInt(dadosAtualizacao.materia_assunto_id);
    }
    if (dadosAtualizacao.fase_id && typeof dadosAtualizacao.fase_id === 'string') {
      dadosAtualizacao.fase_id = parseInt(dadosAtualizacao.fase_id);
    }
    if (dadosAtualizacao.diligencia_id && typeof dadosAtualizacao.diligencia_id === 'string') {
      dadosAtualizacao.diligencia_id = parseInt(dadosAtualizacao.diligencia_id);
    }
    if (dadosAtualizacao.local_tramitacao_id && typeof dadosAtualizacao.local_tramitacao_id === 'string') {
      dadosAtualizacao.local_tramitacao_id = parseInt(dadosAtualizacao.local_tramitacao_id);
    }
    // Corrigir idusuario_responsavel: se string vazia, vira null; se string numérica, vira inteiro
    if (typeof dadosAtualizacao.idusuario_responsavel === 'string') {
      if (dadosAtualizacao.idusuario_responsavel.trim() === '') {
        dadosAtualizacao.idusuario_responsavel = null;
      } else {
        dadosAtualizacao.idusuario_responsavel = parseInt(dadosAtualizacao.idusuario_responsavel);
      }
    }
    
    // Tratar data_encerramento vazia
    if (dadosAtualizacao.data_encerramento === '') {
      dadosAtualizacao.data_encerramento = null;
    }
    
    console.log('🔧 Dados após processamento:', JSON.stringify(dadosAtualizacao, null, 2));
    
    if (isDbAvailable()) {
      const { 
        processoModel: Processo, 
        atualizacaoProcessoModel: AtualizacaoProcesso 
      } = require('../models/indexModel');
      
      const processo = await Processo.findByPk(id);
      if (!processo) {
        return res.status(404).json({ erro: 'Processo não encontrado' });
      }
      
      // Capturar valores antigos para comparação
      const valoresAntigos = processo.toJSON();
      
      // Atualizar processo
      try {
        await processo.update(dadosAtualizacao);
        console.log('✅ Processo atualizado com sucesso');
      } catch (updateError) {
        console.error('❌ Erro específico na atualização do processo:', updateError);
        console.error('❌ Detalhes do erro Sequelize:', updateError.message);
        if (updateError.errors) {
          console.error('❌ Erros de validação:', updateError.errors);
        }
        throw updateError;
      }
      
      // Registrar histórico de alterações
      const alteracoes = [];
      const camposMonitorados = {
        'numero_processo': 'Número do Processo',
        'titulo': 'Título',
        'descricao': 'Descrição',
        'status': 'Status',
        'tipo_processo': 'Tipo do Processo',
        'assistido': 'Nome do Assistido',
        'contato_assistido': 'Contato do Assistido',
        'num_processo_sei': 'Número SEI',
        'sistema': 'Sistema',
        'observacoes': 'Observações',
        'materia_assunto_id': 'Matéria/Assunto',
        'fase_id': 'Fase',
        'diligencia_id': 'Diligência',
        'local_tramitacao_id': 'Local de Tramitação',
        'idusuario_responsavel': 'Responsável'
      };
      
      // Verificar quais campos foram alterados
      for (const [campo, label] of Object.entries(camposMonitorados)) {
        if (dadosAtualizacao.hasOwnProperty(campo) && 
            valoresAntigos[campo] !== dadosAtualizacao[campo]) {
          const valorAntigo = valoresAntigos[campo] || 'Não definido';
          const valorNovo = dadosAtualizacao[campo] || 'Não definido';
          alteracoes.push(`${label}: "${valorAntigo}" → "${valorNovo}"`);
        }
      }
      
      // Se houve alterações, registrar no histórico
      if (alteracoes.length > 0) {
        await AtualizacaoProcesso.create({
          usuario_id: usuarioId,
          processo_id: id,
          tipo_atualizacao: 'Edição do Processo',
          descricao: `Processo editado. Alterações: ${alteracoes.join('; ')}`
        });
      }

      // Notificar atualização do processo
      try {
        const notificacaoService = new NotificacaoService();
        const { usuarioModel: Usuario } = require('../models/indexModel');
        const atualizador = await Usuario.findByPk(req.user.id);
        
        if (atualizador && alteracoes.length > 0) {
          await notificacaoService.notificarProcessoAtualizado(processo, atualizador, [atualizador], alteracoes);
        }
      } catch (notificationError) {
        console.error('⚠️ Erro ao enviar notificação de processo atualizado:', notificationError.message);
      }
      
      res.json(processo);
      
    } else {
      res.status(503).json({ erro: 'Banco de dados não disponível' });
    }
    
  } catch (error) {
    console.error('Erro ao atualizar processo:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Deletar processo do sistema - endpoint: DELETE /api/processos/:id
exports.deletarProcesso = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (isDbAvailable()) {
      const { processoModel: Processo } = require('../models/indexModel');
      
      const processo = await Processo.findByPk(id);
      if (!processo) {
        return res.status(404).json({ erro: 'Processo não encontrado' });
      }
      
      await processo.destroy();
      res.json({ message: 'Processo deletado com sucesso' });
      
    } 
    
  } catch (error) {
    console.error('Erro ao deletar processo:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Listar processos do usuário logado - endpoint: GET /api/processos/usuario
exports.listarProcessosUsuario = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 4, recent = 'false', concluidos = 'false' } = req.query;
    let processos = [];
    if (isDbAvailable()) {
      const { processoModel: Processo, usuarioModel: Usuario, atualizacaoProcessoModel: AtualizacaoProcesso, usuarioProcessoModel: UsuarioProcesso } = require('../models/indexModel');
      const { Op } = require('sequelize');
      // Definir filtro de status baseado no parâmetro concluidos
      let statusFilter = {};
      if (concluidos === 'true') {
        statusFilter = { status: 'Concluído' };
      } else if (concluidos === 'false') {
        statusFilter = { status: { [Op.ne]: 'Concluído' } };
      } // Se não passar o parâmetro, não filtra status (traz todos)

      // Buscar todos os processos onde o usuário é responsável OU está vinculado via usuarios_processo
      // 1. Buscar IDs de processos vinculados
      const vinculos = await UsuarioProcesso.findAll({ where: { usuario_id: userId } });
      const processosVinculadosIds = vinculos.map(v => v.processo_id);

      // 2. Buscar processos onde o usuário é responsável ou está vinculado
      const whereClause = {
        [Op.or]: [
          { idusuario_responsavel: userId },
          { id: { [Op.in]: processosVinculadosIds } }
        ],
        ...statusFilter
      };

      // Se recent=true, buscar apenas os 4 mais recentemente atualizados
      if (recent === 'true') {
        processos = await Processo.findAll({
          where: whereClause,
          include: [
            { model: Usuario, as: 'responsavel' },
            { 
              model: AtualizacaoProcesso, 
              as: 'atualizacoes', 
              required: false,
              order: [['data_atualizacao', 'DESC']],
              limit: 1
            }
          ],
          order: [['updatedAt', 'DESC']],
          limit: 4
        });
        return res.json({
          processos,
          totalItems: processos.length,
          currentPage: 1,
          totalPages: 1,
          hasMore: false
        });
      }

      // Paginação normal
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const offset = (pageNum - 1) * limitNum;

      const { rows: processosRows, count: totalItems } = await Processo.findAndCountAll({
        where: whereClause,
        include: [{ model: Usuario, as: 'responsavel' }],
        order: [['updatedAt', 'DESC']],
        limit: limitNum,
        offset: offset
      });

      const totalPages = Math.ceil(totalItems / limitNum);
      const hasMore = pageNum < totalPages;

        res.json({
          success: true,
          data: processosRows,
          totalItems,
          currentPage: pageNum,
          totalPages,
          hasMore
        });
    } else {
      res.status(503).json({ erro: 'Banco de dados não disponível' });
    }
  } catch (error) {
    console.error('Erro ao listar processos do usuário:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Listar todos os processos do sistema - endpoint: GET /api/processos
exports.listarProcessos = async (req, res) => {
  try {
    const { page = 1, limit = 4, recent = 'false', concluidos = 'false' } = req.query;
    
    if (isDbAvailable()) {
      const { processoModel: Processo, usuarioModel: Usuario, atualizacaoProcessoModel: AtualizacaoProcesso } = require('../models/indexModel');
      
      // Definir filtro de status baseado no parâmetro concluidos
      const statusFilter = concluidos === 'true' 
        ? { status: 'Concluído' }
        : { status: { [require('sequelize').Op.ne]: 'Concluído' } };
      
      // Se recent=true, buscar apenas os 4 mais recentemente atualizados
      if (recent === 'true') {
        const processos = await Processo.findAll({
          where: statusFilter,
          include: [
            { model: Usuario, as: 'responsavel' },
            { 
              model: AtualizacaoProcesso, 
              as: 'atualizacoes', 
              required: false,
              order: [['data_atualizacao', 'DESC']],
              limit: 1
            }
          ],
          order: [['updatedAt', 'DESC']],
          limit: 4
        });
        
        return res.json({
          processos,
          totalItems: processos.length,
          currentPage: 1,
          totalPages: 1,
          hasMore: false
        });
      }
      
      // Paginação normal
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const offset = (pageNum - 1) * limitNum;
      
      const { rows: processos, count: totalItems } = await Processo.findAndCountAll({
        where: statusFilter,
        include: [{ model: Usuario, as: 'responsavel' }],
        order: [['updatedAt', 'DESC']],
        limit: limitNum,
        offset: offset
      });
      
      const totalPages = Math.ceil(totalItems / limitNum);
      const hasMore = pageNum < totalPages;
      
      res.json({
        processos,
        totalItems,
        currentPage: pageNum,
        totalPages,
        hasMore
      });
    } else {
      res.status(503).json({ erro: 'Banco de dados não disponível' });
    }
  } catch (error) {
    console.error('Erro ao listar processos:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Vincular usuário ao processo - endpoint: POST /api/processos/:id/vincular-usuario
exports.vincularUsuario = async (req, res) => {
  try {
    const { id } = req.params; // ID do processo
    const { usuario_id, role } = req.body;
    const usuarioLogado = req.user.id; // ID do usuário que está fazendo a vinculação
    
    if (!usuario_id) {
      return res.status(400).json({ erro: 'ID do usuário é obrigatório' });
    }

    if (isDbAvailable()) {
      const { 
        usuarioProcessoModel: UsuarioProcesso,
        usuarioModel: Usuario,
        processoModel: Processo,
        atualizacaoProcessoModel: AtualizacaoProcesso,
        roleModel: Role
      } = require('../models/indexModel');

      // Buscar usuário logado e verificar permissão
      const usuarioLogadoObj = await Usuario.findByPk(usuarioLogado, { include: [{ model: Role, as: 'role' }] });
      if (!usuarioLogadoObj || !usuarioLogadoObj.role) {
        return res.status(403).json({ erro: 'Permissão negada: usuário sem role definida' });
      }
      const roleNome = usuarioLogadoObj.role.nome;
      if (roleNome !== 'Admin' && roleNome !== 'Professor') {
        return res.status(403).json({ erro: 'Apenas usuários com perfil Professor ou Admin podem vincular usuários a processos.' });
      }

      // Verificar se processo existe
      const processo = await Processo.findByPk(id);
      if (!processo) {
        return res.status(404).json({ erro: 'Processo não encontrado' });
      }
      if (processo.status === 'Concluído') {
        return res.status(403).json({ erro: 'Processo concluído não pode ser alterado. Reabra para modificar.' });
      }

      // Verificar se usuário existe
      const usuario = await Usuario.findByPk(usuario_id);
      if (!usuario) {
        return res.status(404).json({ erro: 'Usuário não encontrado' });
      }

      // Verificar se já está vinculado
      const vinculoExistente = await UsuarioProcesso.findOne({
        where: { usuario_id, processo_id: id }
      });

      if (vinculoExistente) {
        return res.status(400).json({ erro: 'Usuário já está vinculado a este processo' });
      }

      // Criar vinculação
      await UsuarioProcesso.create({
        usuario_id,
        processo_id: id
      });

      // Registrar no histórico
      await AtualizacaoProcesso.create({
        usuario_id: usuarioLogado,
        processo_id: id,
        tipo_atualizacao: 'Vinculação de Usuário',
        descricao: `Usuário "${usuario.nome}" (${usuario.email}) foi vinculado ao processo\nPor: ${usuarioLogadoObj.nome} (${usuarioLogadoObj.email})`
      });

      res.status(201).json({ mensagem: 'Usuário vinculado ao processo com sucesso' });
    } else {
      res.status(503).json({ erro: 'Banco de dados não disponível' });
    }
    
  } catch (error) {
    console.error('Erro ao vincular usuário ao processo:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Marcar processo como concluído - endpoint: PUT /api/processos/:id/concluir
exports.concluirProcesso = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.user.id;
    
    if (isDbAvailable()) {
      const { 
        processoModel: Processo, 
        atualizacaoProcessoModel: AtualizacaoProcesso,
        usuarioModel: Usuario
      } = require('../models/indexModel');
      
      const processo = await Processo.findByPk(id);
      if (!processo) {
        return res.status(404).json({ erro: 'Processo não encontrado' });
      }
      
      // Verificar se o processo já está concluído
      if (processo.status === 'Concluído') {
        return res.status(400).json({ erro: 'Processo já está concluído' });
      }
      
      // Atualizar status para concluído e definir data de encerramento
      await processo.update({
        status: 'Concluído',
        data_encerramento: new Date()
      });
      
      // Buscar usuário que fez a alteração
      const usuario = await Usuario.findByPk(usuarioId);
      
      // Registrar no histórico
      await AtualizacaoProcesso.create({
        usuario_id: usuarioId,
        processo_id: id,
        tipo_atualizacao: 'Conclusão do Processo',
        descricao: `Processo concluído por ${usuario ? usuario.nome : 'Usuário'} (${usuario ? usuario.email : ''})`
      });
      
      res.json({ 
        message: 'Processo concluído com sucesso', 
        processo: processo 
      });
      
    } else {
      res.status(503).json({ erro: 'Banco de dados não disponível' });
    }
    
  } catch (error) {
    console.error('Erro ao concluir processo:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Reabrir processo concluído - endpoint: PUT /api/processos/:id/reabrir
exports.reabrirProcesso = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.user.id;
    
    if (isDbAvailable()) {
      const { 
        processoModel: Processo, 
        atualizacaoProcessoModel: AtualizacaoProcesso,
        usuarioModel: Usuario
      } = require('../models/indexModel');
      
      const processo = await Processo.findByPk(id);
      if (!processo) {
        return res.status(404).json({ erro: 'Processo não encontrado' });
      }
      
      // Verificar se o processo está concluído
      if (processo.status !== 'Concluído') {
        return res.status(400).json({ erro: 'Processo não está concluído' });
      }
      
      // Atualizar status para em andamento e limpar data de encerramento
      await processo.update({
        status: 'Em andamento',
        data_encerramento: null
      });
      
      // Buscar usuário que fez a alteração
      const usuario = await Usuario.findByPk(usuarioId);
      
      // Registrar no histórico
      await AtualizacaoProcesso.create({
        usuario_id: usuarioId,
        processo_id: id,
        tipo_atualizacao: 'Reabertura do Processo',
        descricao: `Processo reaberto por ${usuario ? usuario.nome : 'Usuário'} (${usuario ? usuario.email : ''})`
      });
      
      res.json({ 
        message: 'Processo reaberto com sucesso', 
        processo: processo 
      });
      
    } else {
      res.status(503).json({ erro: 'Banco de dados não disponível' });
    }
    
  } catch (error) {
    console.error('Erro ao reabrir processo:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Desvincular usuário do processo - endpoint: DELETE /api/processos/:id/desvincular-usuario
exports.desvincularUsuario = async (req, res) => {
  try {
    const { id } = req.params; // ID do processo
    const { usuario_id } = req.body;
    const usuarioLogado = req.user.id; // ID do usuário que está fazendo a desvinculação
    
    if (!usuario_id) {
      return res.status(400).json({ erro: 'ID do usuário é obrigatório' });
    }
    
    if (isDbAvailable()) {
      const { 
        usuarioProcessoModel: UsuarioProcesso,
        usuarioModel: Usuario,
        atualizacaoProcessoModel: AtualizacaoProcesso,
        roleModel: Role,
        processoModel: Processo
      } = require('../models/indexModel');

      // Buscar usuário logado e verificar permissão
      const usuarioLogadoObj = await Usuario.findByPk(usuarioLogado, { include: [{ model: Role, as: 'role' }] });
      if (!usuarioLogadoObj || !usuarioLogadoObj.role) {
        return res.status(403).json({ erro: 'Permissão negada: usuário sem role definida' });
      }
      const roleNome = usuarioLogadoObj.role.nome;
      if (roleNome !== 'Admin' && roleNome !== 'Professor') {
        return res.status(403).json({ erro: 'Apenas usuários com perfil Professor ou Admin podem desvincular usuários de processos.' });
      }
      
      // Verificar se processo existe e status
      const processo = await Processo.findByPk(id);
      if (!processo) {
        return res.status(404).json({ erro: 'Processo não encontrado' });
      }
      if (processo.status === 'Concluído') {
        return res.status(403).json({ erro: 'Processo concluído não pode ser alterado. Reabra para modificar.' });
      }
      // Buscar usuário para obter informações antes de desvincular
      const usuario = await Usuario.findByPk(usuario_id);
      // Buscar vinculação
      const vinculo = await UsuarioProcesso.findOne({
        where: { usuario_id, processo_id: id }
      });
      
      if (!vinculo) {
        return res.status(404).json({ erro: 'Usuário não está vinculado a este processo' });
      }
      
      // Remover vinculação
      await vinculo.destroy();
      
      // Buscar usuário que fez a alteração
      const usuarioAlteracao = await Usuario.findByPk(usuarioLogado);
      // Registrar no histórico se conseguiu obter dados do usuário
      if (usuario) {
        await AtualizacaoProcesso.create({
          usuario_id: usuarioLogado,
          processo_id: id,
          tipo_atualizacao: 'Desvinculação de Usuário',
          descricao: `Usuário "${usuario.nome}" (${usuario.email}) foi desvinculado do processo\nPor: ${usuarioAlteracao ? usuarioAlteracao.nome : 'Desconhecido'} (${usuarioAlteracao ? usuarioAlteracao.email : ''})`
        });
      }
      
      res.json({ mensagem: 'Usuário desvinculado do processo com sucesso' });
    } else {
      res.status(503).json({ erro: 'Banco de dados não disponível' });
    }
    
  } catch (error) {
    console.error('Erro ao desvincular usuário do processo:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};
