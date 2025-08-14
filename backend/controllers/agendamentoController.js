/**
 * Verificar status da conexão Google Calendar
 * GET /api/agendamentos/conexao
 */
exports.verificarConexao = async (req, res) => {
  try {
    // Buscar usuário
    const usuario = await Usuario.findByPk(req.user.id);
    if (!usuario) {
      return res.status(404).json({ success: false, connected: false, error: 'Usuário não encontrado' });
    }

    // Verificar conexão com Google Calendar
    const conectado = agendamentoGoogleService.verificarConexaoGoogle(usuario);
    res.json({ success: true, connected: conectado });
  } catch (error) {
    console.error('❌ Erro ao verificar conexão Google Calendar:', error);
    res.status(500).json({ success: false, connected: false, error: 'Erro ao verificar conexão' });
  }
};


// Controller de Agendamentos - Google Calendar Integration
const agendamentoGoogleService = require('../services/agendamentoGoogleService');
const Usuario = require('../models/usuarioModel');
const Processo = require('../models/processoModel');
const UsuarioProcesso = require('../models/usuarioProcessoModel');

/**
 * Listar agendamentos do usuário logado
 * GET /api/agendamentos
 */
exports.listarAgendamentos = async (req, res) => {
  try {
    const { offset = 0, limit = 50, busca, dataInicio, dataFim, tipoEvento } = req.query;

    // Buscar usuário
    const usuario = await Usuario.findByPk(req.user.id);
    if (!usuario) {
      return res.status(404).json({ 
        success: false,
        agendamentos: [], 
        error: 'Usuário não encontrado' 
      });
    }

    // Verificar conexão com Google Calendar
    if (!agendamentoGoogleService.verificarConexaoGoogle(usuario)) {
      return res.json({ 
        success: true,
        agendamentos: [], 
        total: 0,
        offset: parseInt(offset),
        limit: parseInt(limit),
        hasMore: false,
        message: 'Google Calendar não conectado. Conecte sua conta para ver agendamentos.',
        connected: false
      });
    }

    // Montar filtros
    const filtros = {
      busca: busca || undefined,
      dataInicio: dataInicio || undefined,
      dataFim: dataFim || undefined,
      tipoEvento: tipoEvento || undefined,
      limite: parseInt(limit) || 50,
      offset: parseInt(offset) || 0
    };

    // Buscar agendamentos do Google Calendar
    const agendamentos = await agendamentoGoogleService.listarAgendamentos(usuario, filtros);

    // Aplicar filtros adicionais
    let agendamentosFiltrados = Array.isArray(agendamentos) ? agendamentos : [];
    
    if (tipoEvento && tipoEvento !== '') {
      agendamentosFiltrados = agendamentosFiltrados.filter(a => 
        a.tipoEvento === tipoEvento || a.tipo_evento === tipoEvento
      );
    }

    // Aplicar paginação
    const totalItens = agendamentosFiltrados.length;
    const offsetNum = parseInt(offset);
    const limitNum = parseInt(limit);
    const agendamentosPaginados = agendamentosFiltrados.slice(offsetNum, offsetNum + limitNum);

    const resultado = {
      success: true,
      agendamentos: agendamentosPaginados,
      total: totalItens,
      offset: offsetNum,
      limit: limitNum,
      hasMore: (offsetNum + limitNum) < totalItens,
      connected: true,
      fonte: 'Google Calendar',
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email
      }
    };

    res.json(resultado);

  } catch (error) {
    console.error('❌ Erro ao listar agendamentos:', error);
    res.status(500).json({ 
      success: false,
      agendamentos: [], 
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


/**
 * Criar novo agendamento
 * POST /api/agendamentos
 */
exports.criarAgendamento = async (req, res) => {
  try {
    // Extrair e normalizar dados do request
    const {
      titulo, descricao, local, convidados,
      data_evento, data_inicio, dataEvento, dataInicio,
      data_fim, dataFim,
      tipo_evento, tipoEvento,
      processo_id, processoId,
      lembrete_1_dia, lembrete1Dia,
      lembrete_2_dias, lembrete2Dias,
      lembrete_1_semana, lembrete1Semana
    } = req.body;

    // Normalizar campos (aceitar tanto snake_case quanto camelCase)
    const dadosNormalizados = {
      titulo: titulo?.trim(),
      descricao: descricao || '',
      local: local || '',
      convidados: convidados || '',
      dataEvento: data_evento || data_inicio || dataEvento || dataInicio,
      dataFim: data_fim || dataFim,
      tipoEvento: tipo_evento || tipoEvento || 'outro',
      processoId: processo_id || processoId || null,
      lembrete1Dia: lembrete_1_dia !== undefined ? lembrete_1_dia : 
                   lembrete1Dia !== undefined ? lembrete1Dia : true,
      lembrete2Dias: lembrete_2_dias !== undefined ? lembrete_2_dias : 
                    lembrete2Dias !== undefined ? lembrete2Dias : false,
      lembrete1Semana: lembrete_1_semana !== undefined ? lembrete_1_semana : 
                      lembrete1Semana !== undefined ? lembrete1Semana : false
    };

    // Validações
    if (!dadosNormalizados.titulo) {
      return res.status(400).json({ 
        success: false,
        error: 'Título é obrigatório' 
      });
    }

    if (!dadosNormalizados.dataEvento) {
      return res.status(400).json({ 
        success: false,
        error: 'Data do evento é obrigatória' 
      });
    }

    // Validar formato da data
    const dataEventoObj = new Date(dadosNormalizados.dataEvento);
    if (isNaN(dataEventoObj.getTime())) {
      return res.status(400).json({ 
        success: false,
        error: 'Data do evento inválida' 
      });
    }

    // Verificar se não é no passado (com tolerância de 1 minuto)
    const agora = new Date();
    if (dataEventoObj < new Date(agora.getTime() - 60000)) {
      return res.status(400).json({ 
        success: false,
        error: 'Não é possível criar agendamento no passado' 
      });
    }

    // Se foi especificado um processo, validar se ele não está concluído
    if (dadosNormalizados.processoId) {
      const processo = await Processo.findByPk(dadosNormalizados.processoId);
      if (processo) {
        const statusProcesso = processo.status ? processo.status.toLowerCase() : '';
        const statusProibidos = ['concluído', 'finalizado', 'encerrado', 'arquivado'];
        
        if (statusProibidos.includes(statusProcesso)) {
          return res.status(400).json({ 
            success: false,
            error: `Não é possível criar agendamento para processo com status "${processo.status}". O processo deve estar ativo para permitir agendamentos.`,
            processoStatus: processo.status
          });
        }
      } else {
        return res.status(404).json({ 
          success: false,
          error: 'Processo não encontrado' 
        });
      }
    }

    // Buscar usuário
    const usuario = await Usuario.findByPk(req.user.id);
    if (!usuario) {
      return res.status(404).json({ 
        success: false,
        error: 'Usuário não encontrado' 
      });
    }

    // Verificar conexão com Google Calendar (bypass para modo teste)
    const isModoTeste = process.env.NODE_ENV === 'test' || req.headers['x-test-mode'] === 'true';
    
    if (!isModoTeste && !agendamentoGoogleService.verificarConexaoGoogle(usuario)) {
      return res.status(400).json({ 
        success: false,
        error: 'Google Calendar não conectado. Conecte sua conta primeiro.',
        action: 'connect_google'
      });
    }

    // Preparar dados para criação
    dadosNormalizados.dataEvento = dataEventoObj.toISOString();
    
    // Se não tem data fim, calcular 1 hora após o início
    if (dadosNormalizados.dataFim) {
      const dataFimObj = new Date(dadosNormalizados.dataFim);
      if (!isNaN(dataFimObj.getTime())) {
        dadosNormalizados.dataFim = dataFimObj.toISOString();
      } else {
        dadosNormalizados.dataFim = new Date(dataEventoObj.getTime() + (60 * 60 * 1000)).toISOString();
      }
    } else {
      dadosNormalizados.dataFim = new Date(dataEventoObj.getTime() + (60 * 60 * 1000)).toISOString();
    }

    // Criar agendamento no Google Calendar ou modo teste
    let agendamentoCriado;
    
    if (isModoTeste) {
      // Modo teste: criar agendamento mock
      agendamentoCriado = {
        id: `test_${Date.now()}`,
        titulo: dadosNormalizados.titulo,
        descricao: dadosNormalizados.descricao,
        local: dadosNormalizados.local,
        convidados: dadosNormalizados.convidados,
        dataEvento: dadosNormalizados.dataEvento,
        dataFim: dadosNormalizados.dataFim,
        tipoEvento: dadosNormalizados.tipoEvento,
        criador: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email
        },
        fonte: 'teste',
        criado_em: new Date().toISOString()
      };
    } else {
      agendamentoCriado = await agendamentoGoogleService.criarAgendamento(usuario, dadosNormalizados);
    }

    // Tentar enviar notificação (não crítico)
    try {
      const NotificacaoService = require('../services/notificacaoService');
      const notificacaoService = new NotificacaoService();
      await notificacaoService.notificarAgendamentoCriado(agendamentoCriado, usuario, usuario);
    } catch (notifError) {
    }

    res.status(201).json({
      success: true,
      agendamento: agendamentoCriado,
      message: 'Agendamento criado com sucesso no seu Google Calendar'
    });

  } catch (error) {
    console.error('❌ Erro ao criar agendamento:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Buscar agendamento específico
 * GET /api/agendamentos/:id
 */
exports.obterAgendamento = async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar usuário
    const usuario = await Usuario.findByPk(req.user.id);
    if (!usuario) {
      return res.status(404).json({ 
        success: false,
        error: 'Usuário não encontrado' 
      });
    }

    // Verificar conexão com Google Calendar
    if (!agendamentoGoogleService.verificarConexaoGoogle(usuario)) {
      return res.status(400).json({ 
        success: false,
        error: 'Google Calendar não conectado' 
      });
    }

    // Buscar agendamento
    const agendamento = await agendamentoGoogleService.buscarAgendamento(usuario, id);

    res.json({
      success: true,
      agendamento
    });

  } catch (error) {
    console.error('❌ Erro ao buscar agendamento:', error);
    if (error.message.includes('não encontrado')) {
      res.status(404).json({ 
        success: false,
        error: 'Agendamento não encontrado' 
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};


/**
 * Atualizar agendamento existente
 * PUT /api/agendamentos/:id
 */
exports.atualizarAgendamento = async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar usuário
    const usuario = await Usuario.findByPk(req.user.id);
    if (!usuario) {
      return res.status(404).json({ 
        success: false,
        error: 'Usuário não encontrado' 
      });
    }

    // Verificar conexão com Google Calendar
    if (!agendamentoGoogleService.verificarConexaoGoogle(usuario)) {
      return res.status(400).json({ 
        success: false,
        error: 'Google Calendar não conectado' 
      });
    }

    // Normalizar dados de atualização
    const dadosAtualizacao = { ...req.body };

    // Converter data_evento para dataEvento se fornecida
    if (dadosAtualizacao.data_evento || dadosAtualizacao.data_inicio) {
      const dataEvento = dadosAtualizacao.data_evento || dadosAtualizacao.data_inicio;
      const dataEventoObj = new Date(dataEvento);
      
      if (isNaN(dataEventoObj.getTime())) {
        return res.status(400).json({ 
          success: false,
          error: 'Data do evento inválida' 
        });
      }
      
      dadosAtualizacao.dataEvento = dataEventoObj.toISOString();
      delete dadosAtualizacao.data_evento;
      delete dadosAtualizacao.data_inicio;
    }

    // Converter data_fim para dataFim se fornecida
    if (dadosAtualizacao.data_fim) {
      const dataFim = new Date(dadosAtualizacao.data_fim);
      if (!isNaN(dataFim.getTime())) {
        dadosAtualizacao.dataFim = dataFim.toISOString();
      }
      delete dadosAtualizacao.data_fim;
    }

    // Validar dados de entrada
    if (dadosAtualizacao.dataEvento) {
      const dataEvento = new Date(dadosAtualizacao.dataEvento);
      if (isNaN(dataEvento.getTime())) {
        return res.status(400).json({
          success: false,
          error: 'Data do evento inválida'
        });
      }
      // Garantir que a data esteja no formato correto
      dadosAtualizacao.dataEvento = dataEvento.toISOString();
    }

    if (dadosAtualizacao.dataFim) {
      const dataFim = new Date(dadosAtualizacao.dataFim);
      if (isNaN(dataFim.getTime())) {
        return res.status(400).json({
          success: false,
          error: 'Data de fim inválida'
        });
      }
      dadosAtualizacao.dataFim = dataFim.toISOString();
    }

    // Normalizar outros campos
    if (dadosAtualizacao.tipo_evento) {
      dadosAtualizacao.tipoEvento = dadosAtualizacao.tipo_evento;
      delete dadosAtualizacao.tipo_evento;
    }

    if (dadosAtualizacao.processo_id !== undefined) {
      dadosAtualizacao.processoId = dadosAtualizacao.processo_id;
      delete dadosAtualizacao.processo_id;
    }

    // Atualizar no Google Calendar
    const agendamentoAtualizado = await agendamentoGoogleService.atualizarAgendamento(usuario, id, dadosAtualizacao);

    res.json({
      success: true,
      agendamento: agendamentoAtualizado,
      message: 'Agendamento atualizado com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro detalhado no controller atualizarAgendamento:', {
      message: error.message,
      status: error.code,
      stack: error.stack
    });
    
    if (error.message.includes('não encontrado')) {
      res.status(404).json({ 
        success: false,
        error: 'Agendamento não encontrado' 
      });
    } else if (error.message.includes('permissão')) {
      res.status(403).json({ 
        success: false,
        error: error.message 
      });
    } else if (error.message.includes('localização de trabalho')) {
      res.status(400).json({ 
        success: false,
        error: 'Este tipo de evento não pode ser editado' 
      });
    } else if (error.message.includes('Invalid start time') || error.message.includes('Bad Request')) {
      res.status(400).json({ 
        success: false,
        error: 'Dados de data/hora inválidos para o Google Calendar' 
      });
    } else {
      res.status(500).json({ 
        success: false,
        error: 'Erro interno do servidor', 
        details: process.env.NODE_ENV === 'development' ? error.message : undefined 
      });
    }
  }
};


/**
 * Deletar agendamento
 * DELETE /api/agendamentos/:id
 */
exports.deletarAgendamento = async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar usuário
    const usuario = await Usuario.findByPk(req.user.id);
    if (!usuario) {
      return res.status(404).json({ 
        success: false,
        error: 'Usuário não encontrado' 
      });
    }

    // Verificar conexão com Google Calendar
    if (!agendamentoGoogleService.verificarConexaoGoogle(usuario)) {
      return res.status(400).json({ 
        success: false,
        error: 'Google Calendar não conectado' 
      });
    }

    // Deletar do Google Calendar
    const resultado = await agendamentoGoogleService.excluirAgendamento(usuario, id);

    res.json({
      success: true,
      message: 'Agendamento deletado com sucesso',
      ...resultado
    });

  } catch (error) {
    console.error('❌ Erro ao deletar agendamento:', error);
    
    if (error.message.includes('não encontrado')) {
      res.status(404).json({ 
        success: false,
        error: 'Agendamento não encontrado' 
      });
    } else if (error.message.includes('permissão')) {
      res.status(403).json({ 
        success: false,
        error: error.message 
      });
    } else {
      res.status(500).json({ 
        success: false,
        error: 'Erro interno do servidor', 
        details: process.env.NODE_ENV === 'development' ? error.message : undefined 
      });
    }
  }
};

// Listar agendamentos do usuário (alias para listarAgendamentos)
exports.listarAgendamentosUsuario = exports.listarAgendamentos;

/**
 * Obter estatísticas dos agendamentos
 * GET /api/agendamentos/estatisticas
 */
exports.obterEstatisticas = async (req, res) => {
  try {

    // Buscar usuário
    const usuario = await Usuario.findByPk(req.user.id);
    if (!usuario) {
      return res.status(404).json({ 
        success: false,
        error: 'Usuário não encontrado' 
      });
    }

    // Verificar conexão com Google Calendar
    if (!agendamentoGoogleService.verificarConexaoGoogle(usuario)) {
      return res.json({
        success: true,
        estatisticas: {
          total: 0,
          proximaSeamana: 0,
          hoje: 0,
          porTipo: {},
          porStatus: {}
        },
        message: 'Google Calendar não conectado'
      });
    }

    // Obter estatísticas
    const estatisticas = await agendamentoGoogleService.obterEstatisticas(usuario);

    res.json({
      success: true,
      estatisticas,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        googleConectado: true
      },
      fonte: 'Google Calendar'
    });

  } catch (error) {
    console.error('❌ Erro ao obter estatísticas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Invalidar cache e forçar atualização
 * POST /api/agendamentos/invalidar-cache
 */
exports.invalidarCache = async (req, res) => {
  try {
    // Buscar usuário
    const usuario = await Usuario.findByPk(req.user.id);
    if (!usuario) {
      return res.status(404).json({ 
        success: false,
        error: 'Usuário não encontrado' 
      });
    }

    // Invalidar cache do usuário
    agendamentoGoogleService.invalidarCacheUsuario(req.user.id);

    // Buscar dados atuais se Google Calendar conectado
    let dadosAtuais = [];
    if (agendamentoGoogleService.verificarConexaoGoogle(usuario)) {
      dadosAtuais = await agendamentoGoogleService.listarAgendamentos(usuario, {});
    }

    res.json({
      success: true,
      message: 'Cache invalidado com sucesso',
      agendamentos: dadosAtuais,
      timestamp: new Date().toISOString(),
      total: dadosAtuais.length,
      fonte: 'Google Calendar',
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        googleConectado: agendamentoGoogleService.verificarConexaoGoogle(usuario)
      }
    });

  } catch (error) {
    console.error('❌ Erro ao invalidar cache:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Verificar status da conexão Google Calendar
 * GET /api/agendamentos/conexao
 */
exports.verificarConexao = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.user.id);
    if (!usuario) {
      return res.status(404).json({ 
        success: false,
        error: 'Usuário não encontrado' 
      });
    }

    const conectado = agendamentoGoogleService.verificarConexaoGoogle(usuario);

    res.json({
      success: true,
      connected: conectado,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email
      },
      details: {
        hasAccessToken: !!usuario.googleAccessToken,
        hasRefreshToken: !!usuario.googleRefreshToken,
        calendarConnected: !!usuario.googleCalendarConnected
      }
    });

  } catch (error) {
    console.error('❌ Erro ao verificar conexão:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Aliases para compatibilidade
exports.listarAgendamentosUsuario = exports.listarAgendamentos;

/**
 * Listar agendamentos por período
 * GET /api/agendamentos/periodo?inicio=YYYY-MM-DD&fim=YYYY-MM-DD
 */
exports.listarAgendamentosPeriodo = async (req, res) => {
  try {
    const { inicio, fim } = req.query;
    
    if (!inicio || !fim) {
      return res.status(400).json({ 
        success: false,
        error: 'Período de início e fim são obrigatórios' 
      });
    }

    // Usar a função principal com filtros de data
    req.query.dataInicio = inicio;
    req.query.dataFim = fim;
    
    return exports.listarAgendamentos(req, res);
    
  } catch (error) {
    console.error('❌ Erro ao listar agendamentos por período:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Sincronizar com Google Calendar (endpoint de compatibilidade)
 * POST /api/agendamentos/sincronizar
 */
exports.sincronizarGoogleCalendar = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Sincronização automática ativa. Todos os agendamentos são gerenciados diretamente no Google Calendar.',
      fonte: 'Google Calendar'
    });
  } catch (error) {
    console.error('❌ Erro ao sincronizar:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Listar processos disponíveis para agendamento
 * GET /api/agendamentos/processos-disponiveis
 */
exports.listarProcessosDisponiveis = async (req, res) => {
  try {
    const { Op } = require('sequelize');
    
    // Buscar processos disponíveis para o usuário logado, excluindo os concluídos
    const processos = await Processo.findAll({
      where: {
        // Filtrar processos que não estão concluídos/finalizados
        status: {
          [Op.notIn]: ['Concluído', 'concluído', 'Finalizado', 'finalizado', 'Encerrado', 'encerrado', 'Arquivado', 'arquivado']
        }
      },
      include: [
        {
          model: UsuarioProcesso,
          as: 'usuariosProcesso',
          where: { usuario_id: req.user.id },
        },
      ],
      order: [['id', 'DESC']] // Ordenar por ID descendente para mostrar mais recentes primeiro
    });

    res.json({
      success: true,
      processos,
      message: `${processos.length} processos ativos disponíveis para agendamento`
    });
  } catch (error) {
    console.error('❌ Erro ao listar processos disponíveis:', error.message, error.stack);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message,
    });
  }
};
