const { agendamentoModels: Agendamento } = require('../models/indexModels');

// Listar agendamentos
exports.listarAgendamentos = async (req, res) => {
  try {
    const agendamentos = await Agendamento.findAll();
    res.json(agendamentos);
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Criar agendamento
exports.criarAgendamento = async (req, res) => {
  try {
    const { processo_id, tipo_evento, titulo, descricao, data_evento, local } = req.body;
    
    const agendamento = await Agendamento.create({
      processo_id,
      usuario_id: req.usuario.id,
      tipo_evento,
      titulo,
      descricao,
      data_evento,
      local
    });

    res.status(201).json(agendamento);
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Atualizar agendamento
exports.atualizarAgendamento = async (req, res) => {
  try {
    const { id } = req.params;
    const agendamento = await Agendamento.findByPk(id);
    
    if (!agendamento) {
      return res.status(404).json({ erro: 'Não encontrado' });
    }
    
    await agendamento.update(req.body);
    res.json(agendamento);
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Deletar agendamento
exports.excluirAgendamento = async (req, res) => {
  try {
    const { id } = req.params;
    const agendamento = await Agendamento.findByPk(id);
    
    if (!agendamento) {
      return res.status(404).json({ erro: 'Não encontrado' });
    }
    
    await agendamento.destroy();
    res.json({ mensagem: 'Excluído com sucesso' });
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Buscar por ID
exports.buscarAgendamentoPorId = async (req, res) => {
  try {
    const agendamento = await Agendamento.findByPk(req.params.id);
    if (!agendamento) {
      return res.status(404).json({ erro: 'Não encontrado' });
    }
    res.json(agendamento);
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};
