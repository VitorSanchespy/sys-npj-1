const { agendamentoModels: Agendamento } = require('../models/indexModels');

// Listar agendamentos
exports.listarAgendamentos = async (req, res) => {
  try {
    const agendamentos = await Agendamento.findAll({
      order: [['data_evento', 'ASC']]
    });
    res.json(agendamentos);
  } catch (error) {
    console.error('Erro ao listar agendamentos:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Criar agendamento
exports.criarAgendamento = async (req, res) => {
  try {
    const {
      processo_id,
      tipo_evento,
      titulo,
      descricao,
      data_evento,
      local,
      lembrete_1_dia,
      lembrete_2_dias,
      lembrete_1_semana
    } = req.body;
    
    const agendamento = await Agendamento.create({
      processo_id: processo_id || null,
      usuario_id: req.usuario.id,
      tipo_evento,
      titulo,
      descricao: descricao || null,
      data_evento: new Date(data_evento),
      local: local || null,
      status: 'agendado',
      lembrete_1_dia: lembrete_1_dia !== undefined ? lembrete_1_dia : true,
      lembrete_2_dias: lembrete_2_dias !== undefined ? lembrete_2_dias : true,
      lembrete_1_semana: lembrete_1_semana !== undefined ? lembrete_1_semana : false
    });

    res.status(201).json(agendamento);
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Atualizar agendamento
exports.atualizarAgendamento = async (req, res) => {
  try {
    const { id } = req.params;
    const agendamento = await Agendamento.findByPk(id);
    
    if (!agendamento) {
      return res.status(404).json({ erro: 'Agendamento não encontrado' });
    }
    
    await agendamento.update(req.body);
    res.json(agendamento);
  } catch (error) {
    console.error('Erro ao atualizar agendamento:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Excluir agendamento
exports.excluirAgendamento = async (req, res) => {
  try {
    const { id } = req.params;
    const agendamento = await Agendamento.findByPk(id);
    
    if (!agendamento) {
      return res.status(404).json({ erro: 'Agendamento não encontrado' });
    }
    
    await agendamento.destroy();
    res.json({ mensagem: 'Agendamento excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir agendamento:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Buscar por ID
exports.buscarAgendamentoPorId = async (req, res) => {
  try {
    const agendamento = await Agendamento.findByPk(req.params.id);
    
    if (!agendamento) {
      return res.status(404).json({ erro: 'Agendamento não encontrado' });
    }
    
    res.json(agendamento);
  } catch (error) {
    console.error('Erro ao buscar agendamento:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};
