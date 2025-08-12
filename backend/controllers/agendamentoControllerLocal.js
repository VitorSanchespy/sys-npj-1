/**
 * CONTROLLER SIMPLIFICADO DE AGENDAMENTOS - PARA TESTES
 * Permite criação de agendamentos sem Google Calendar
 */

// Simulação de banco de dados em memória para testes
let agendamentosMemoria = [];
let idCounter = 1;

/**
 * Listar agendamentos (simulado)
 */
exports.listarAgendamentos = async (req, res) => {
  try {
    // Filtrar agendamentos do usuário atual
    const agendamentosUsuario = agendamentosMemoria.filter(a => a.usuario_id === req.user.id);
    
    res.json({
      success: true,
      agendamentos: agendamentosUsuario,
      total: agendamentosUsuario.length,
      fonte: 'Banco Local (Teste)'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Erro ao listar agendamentos local' 
    });
  }
};

/**
 * Criar agendamento (simulado)
 */
exports.criarAgendamento = async (req, res) => {
  try {
    const {
      titulo, descricao, local, 
      data_inicio, data_fim, tipo
    } = req.body;

    // Validações básicas
    if (!titulo || !data_inicio) {
      return res.status(400).json({
        success: false,
        error: 'Título e data de início são obrigatórios'
      });
    }

    // Criar agendamento em memória
    const novoAgendamento = {
      id: idCounter++,
      titulo,
      descricao: descricao || '',
      local: local || '',
      data_inicio,
      data_fim: data_fim || data_inicio,
      tipo: tipo || 'outro',
      usuario_id: req.user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    agendamentosMemoria.push(novoAgendamento);

    res.status(201).json({
      success: true,
      agendamento: novoAgendamento,
      message: 'Agendamento criado no banco local (teste)'
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Erro ao criar agendamento local' 
    });
  }
};

/**
 * Atualizar agendamento (simulado)
 */
exports.atualizarAgendamento = async (req, res) => {
  try {
    const { id } = req.params;
    const agendamentoIndex = agendamentosMemoria.findIndex(a => 
      a.id === parseInt(id) && a.usuario_id === req.user.id
    );

    if (agendamentoIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Agendamento não encontrado'
      });
    }

    // Atualizar campos
    const agendamentoAtual = agendamentosMemoria[agendamentoIndex];
    const dadosAtualizados = {
      ...agendamentoAtual,
      ...req.body,
      id: agendamentoAtual.id, // Manter ID
      usuario_id: agendamentoAtual.usuario_id, // Manter usuário
      updated_at: new Date().toISOString()
    };

    agendamentosMemoria[agendamentoIndex] = dadosAtualizados;

    res.json({
      success: true,
      agendamento: dadosAtualizados,
      message: 'Agendamento atualizado no banco local (teste)'
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Erro ao atualizar agendamento local' 
    });
  }
};

/**
 * Deletar agendamento (simulado)
 */
exports.deletarAgendamento = async (req, res) => {
  try {
    const { id } = req.params;
    const agendamentoIndex = agendamentosMemoria.findIndex(a => 
      a.id === parseInt(id) && a.usuario_id === req.user.id
    );

    if (agendamentoIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Agendamento não encontrado'
      });
    }

    agendamentosMemoria.splice(agendamentoIndex, 1);

    res.json({
      success: true,
      message: 'Agendamento deletado do banco local (teste)'
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Erro ao deletar agendamento local' 
    });
  }
};

/**
 * Estatísticas de agendamentos
 */
exports.estatisticasAgendamentos = async (req, res) => {
  try {
    const agendamentosUsuario = agendamentosMemoria.filter(a => a.usuario_id === req.user.id);
    const agora = new Date();
    
    const stats = {
      total: agendamentosUsuario.length,
      hoje: agendamentosUsuario.filter(a => {
        const dataAgendamento = new Date(a.data_inicio);
        return dataAgendamento.toDateString() === agora.toDateString();
      }).length,
      proximos7Dias: agendamentosUsuario.filter(a => {
        const dataAgendamento = new Date(a.data_inicio);
        const seteDiasDepois = new Date(agora.getTime() + 7 * 24 * 60 * 60 * 1000);
        return dataAgendamento >= agora && dataAgendamento <= seteDiasDepois;
      }).length,
      passados: agendamentosUsuario.filter(a => {
        const dataAgendamento = new Date(a.data_inicio);
        return dataAgendamento < agora;
      }).length
    };

    res.json({
      success: true,
      estatisticas: stats,
      fonte: 'Banco Local (Teste)'
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Erro ao obter estatísticas de agendamentos' 
    });
  }
};

module.exports = {
  listarAgendamentos: exports.listarAgendamentos,
  criarAgendamento: exports.criarAgendamento,
  atualizarAgendamento: exports.atualizarAgendamento,
  deletarAgendamento: exports.deletarAgendamento,
  estatisticasAgendamentos: exports.estatisticasAgendamentos
};
