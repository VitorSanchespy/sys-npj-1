// Controller de Agendamentos Individuais - Baseado apenas no Google Calendar
const agendamentoGoogleService = require('../services/agendamentoGoogleService');
const Usuario = require('../models/usuarioModel');

// Listar agendamentos do usuário logado (individuais via Google Calendar)
exports.listarAgendamentos = async (req, res) => {
  try {
    console.log('\n📋 LISTANDO AGENDAMENTOS INDIVIDUAIS');
    console.log('User ID:', req.user.id);
    console.log('User Role:', req.user.role);

    const { offset = 0, limit = 50, busca, dataInicio, dataFim } = req.query;

    // Buscar dados completos do usuário
    const usuario = await Usuario.findByPk(req.user.id);
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    // Verificar se tem Google Calendar conectado
    if (!agendamentoGoogleService.verificarConexaoGoogle(usuario)) {
      return res.json({
        agendamentos: [],
        total: 0,
        offset: parseInt(offset),
        limit: parseInt(limit),
        hasMore: false,
        aviso: 'Google Calendar não conectado. Conecte sua conta para ver agendamentos.',
        individual: true,
        fonte: 'Não conectado'
      });
    }

    // Montar filtros para Google Calendar
    const filtros = {
      busca,
      dataInicio,
      dataFim,
      limite: parseInt(limit),
      offset: parseInt(offset)
    };

    // Buscar agendamentos do Google Calendar
    const agendamentos = await agendamentoGoogleService.listarAgendamentos(usuario, filtros);

    // Aplicar paginação manual (Google Calendar não suporta offset)
    const agendamentosPaginados = agendamentos.slice(parseInt(offset), parseInt(offset) + parseInt(limit));
    
    const resultado = {
      agendamentos: agendamentosPaginados,
      total: agendamentos.length,
      offset: parseInt(offset),
      limit: parseInt(limit),
      hasMore: (parseInt(offset) + parseInt(limit)) < agendamentos.length,
      fonte: 'Google Calendar',
      individual: true,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email
      }
    };

    console.log(`✅ ${agendamentosPaginados.length} agendamentos encontrados para usuário ${req.user.id}`);
    console.log('📊 Total no Google Calendar:', agendamentos.length);

    res.json(resultado);
  } catch (error) {
    console.error('❌ Erro ao listar agendamentos:', error);
    res.status(500).json({
      erro: 'Erro interno do servidor',
      detalhes: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Criar novo agendamento individual
exports.criarAgendamento = async (req, res) => {
  try {
    console.log('\n📅 CRIANDO AGENDAMENTO INDIVIDUAL');
    console.log('Dados recebidos:', req.body);
    console.log('Usuário:', req.user.id);

    const {
      titulo,
      descricao,
      data_evento: dataEvento,
      tipo_evento: tipoEvento = 'outro',
      local,
      processo_id: processoId,
      lembrete_1_dia: lembrete1Dia = true,
      lembrete_2_dias: lembrete2Dias = false,
      lembrete_1_semana: lembrete1Semana = false
    } = req.body;

    // Validações básicas
    if (!titulo || !titulo.trim()) {
      return res.status(400).json({ erro: 'Título é obrigatório' });
    }

    if (!dataEvento) {
      return res.status(400).json({ erro: 'Data do evento é obrigatória' });
    }

    // Verificar se a data é válida
    const dataEventoObj = new Date(dataEvento);
    if (isNaN(dataEventoObj.getTime())) {
      return res.status(400).json({ erro: 'Data do evento inválida' });
    }

    // Verificar se não é no passado
    if (dataEventoObj < new Date()) {
      return res.status(400).json({ erro: 'Não é possível criar agendamento no passado' });
    }

    // Buscar usuário
    const usuario = await Usuario.findByPk(req.user.id);
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    // Verificar conexão com Google Calendar
    if (!agendamentoGoogleService.verificarConexaoGoogle(usuario)) {
      return res.status(400).json({ 
        erro: 'Google Calendar não conectado. Conecte sua conta primeiro.',
        redirecionarPara: '/conectar-google'
      });
    }

    // Dados para criar agendamento
    const dadosAgendamento = {
      titulo: titulo.trim(),
      descricao: descricao || '',
      dataEvento: dataEventoObj.toISOString(),
      tipoEvento,
      local: local || '',
      processoId,
      lembrete1Dia,
      lembrete2Dias,
      lembrete1Semana
    };

    // Criar agendamento no Google Calendar
    const agendamentoCriado = await agendamentoGoogleService.criarAgendamento(usuario, dadosAgendamento);

    console.log('✅ Agendamento criado com sucesso:', agendamentoCriado.id);

    res.status(201).json({
      ...agendamentoCriado,
      mensagem: 'Agendamento criado com sucesso no seu Google Calendar'
    });

  } catch (error) {
    console.error('❌ Erro ao criar agendamento:', error);
    res.status(500).json({
      erro: 'Erro interno do servidor',
      detalhes: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Buscar agendamento específico
exports.obterAgendamento = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('\n📋 BUSCANDO AGENDAMENTO:', id);

    // Buscar usuário
    const usuario = await Usuario.findByPk(req.user.id);
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    // Verificar conexão com Google Calendar
    if (!agendamentoGoogleService.verificarConexaoGoogle(usuario)) {
      return res.status(400).json({ erro: 'Google Calendar não conectado' });
    }

    // Buscar agendamento
    const agendamento = await agendamentoGoogleService.buscarAgendamento(usuario, id);

    res.json(agendamento);

  } catch (error) {
    console.error('❌ Erro ao buscar agendamento:', error);
    if (error.message.includes('não encontrado')) {
      res.status(404).json({ erro: 'Agendamento não encontrado' });
    } else {
      res.status(500).json({
        erro: 'Erro interno do servidor',
        detalhes: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

// Atualizar agendamento
exports.atualizarAgendamento = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('\n🔄 ATUALIZANDO AGENDAMENTO:', id);
    console.log('Dados recebidos:', req.body);

    // Buscar usuário
    const usuario = await Usuario.findByPk(req.user.id);
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    // Verificar conexão com Google Calendar
    if (!agendamentoGoogleService.verificarConexaoGoogle(usuario)) {
      return res.status(400).json({ erro: 'Google Calendar não conectado' });
    }

    const dadosAtualizacao = { ...req.body };

    // Validar data se fornecida
    if (dadosAtualizacao.data_evento) {
      const dataEventoObj = new Date(dadosAtualizacao.data_evento);
      if (isNaN(dataEventoObj.getTime())) {
        return res.status(400).json({ erro: 'Data do evento inválida' });
      }
      dadosAtualizacao.dataEvento = dataEventoObj.toISOString();
      delete dadosAtualizacao.data_evento; // Remover o campo antigo
    }

    // Atualizar agendamento
    const agendamentoAtualizado = await agendamentoGoogleService.atualizarAgendamento(usuario, id, dadosAtualizacao);

    console.log('✅ Agendamento atualizado com sucesso');

    res.json({
      ...agendamentoAtualizado,
      mensagem: 'Agendamento atualizado com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar agendamento:', error);
    if (error.message.includes('não encontrado')) {
      res.status(404).json({ erro: 'Agendamento não encontrado' });
    } else if (error.message.includes('permissão')) {
      res.status(403).json({ erro: error.message });
    } else {
      res.status(500).json({
        erro: 'Erro interno do servidor',
        detalhes: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

// Excluir agendamento
exports.deletarAgendamento = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('\n🗑️ EXCLUINDO AGENDAMENTO:', id);

    // Buscar usuário
    const usuario = await Usuario.findByPk(req.user.id);
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    // Verificar conexão com Google Calendar
    if (!agendamentoGoogleService.verificarConexaoGoogle(usuario)) {
      return res.status(400).json({ erro: 'Google Calendar não conectado' });
    }

    // Excluir agendamento
    const resultado = await agendamentoGoogleService.excluirAgendamento(usuario, id);

    console.log('✅ Agendamento excluído com sucesso');

    res.json(resultado);

  } catch (error) {
    console.error('❌ Erro ao excluir agendamento:', error);
    if (error.message.includes('não encontrado')) {
      res.status(404).json({ erro: 'Agendamento não encontrado' });
    } else if (error.message.includes('permissão')) {
      res.status(403).json({ erro: error.message });
    } else {
      res.status(500).json({
        erro: 'Erro interno do servidor',
        detalhes: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

// Listar agendamentos do usuário (alias para listarAgendamentos)
exports.listarAgendamentosUsuario = exports.listarAgendamentos;

// Listar agendamentos por período
exports.listarAgendamentosPeriodo = async (req, res) => {
  try {
    const { inicio, fim } = req.query;
    
    if (!inicio || !fim) {
      return res.status(400).json({ erro: 'Período de início e fim são obrigatórios' });
    }

    // Usar a função principal com filtros de data
    req.query.dataInicio = inicio;
    req.query.dataFim = fim;
    
    return exports.listarAgendamentos(req, res);
    
  } catch (error) {
    console.error('Erro ao listar agendamentos por período:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Obter estatísticas do usuário
exports.obterEstatisticas = async (req, res) => {
  try {
    console.log('\n📊 OBTENDO ESTATÍSTICAS DE AGENDAMENTOS');

    // Buscar usuário
    const usuario = await Usuario.findByPk(req.user.id);
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    // Verificar conexão com Google Calendar
    if (!agendamentoGoogleService.verificarConexaoGoogle(usuario)) {
      return res.json({
        total: 0,
        proximaSeamana: 0,
        hoje: 0,
        porTipo: {},
        aviso: 'Google Calendar não conectado'
      });
    }

    // Obter estatísticas
    const estatisticas = await agendamentoGoogleService.obterEstatisticas(usuario);

    res.json({
      ...estatisticas,
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
      erro: 'Erro interno do servidor',
      detalhes: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Invalidar cache e forçar atualização
exports.invalidarCache = async (req, res) => {
  try {
    console.log('\n🔄 INVALIDANDO CACHE DE AGENDAMENTOS INDIVIDUAIS');

    // Buscar usuário
    const usuario = await Usuario.findByPk(req.user.id);
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
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
      dadosAtuais,
      timestamp: new Date().toISOString(),
      totalAgendamentos: dadosAtuais.length,
      fonte: 'Google Calendar',
      individual: true,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        googleConectado: agendamentoGoogleService.verificarConexaoGoogle(usuario)
      }
    });

  } catch (error) {
    console.error('❌ Erro ao invalidar cache:', error);
    res.status(500).json({
      erro: 'Erro interno do servidor',
      detalhes: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Verificar status da conexão Google Calendar
exports.verificarConexao = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.user.id);
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    const conectado = agendamentoGoogleService.verificarConexaoGoogle(usuario);

    res.json({
      conectado,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email
      },
      detalhes: {
        temAccessToken: !!usuario.googleAccessToken,
        temRefreshToken: !!usuario.googleRefreshToken,
        calendarConectado: !!usuario.googleCalendarConnected
      }
    });

  } catch (error) {
    console.error('❌ Erro ao verificar conexão:', error);
    res.status(500).json({
      erro: 'Erro interno do servidor',
      detalhes: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Sincronizar com Google Calendar (não necessário agora, mas mantido para compatibilidade)
exports.sincronizarGoogleCalendar = async (req, res) => {
  try {
    res.json({
      mensagem: 'Sincronização automática ativa. Todos os agendamentos são gerenciados diretamente no Google Calendar.',
      individual: true,
      fonte: 'Google Calendar'
    });
  } catch (error) {
    console.error('Erro ao sincronizar:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};
