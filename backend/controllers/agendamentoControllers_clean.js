// Controller simplificado para agendamentos
exports.listarAgendamentos = async (req, res) => {
  res.json([]);
};

exports.criarAgendamento = async (req, res) => {
  res.status(201).json({ 
    id: Date.now(), 
    mensagem: 'Agendamento mockado - OK' 
  });
};

exports.atualizarAgendamento = async (req, res) => {
  res.json({ mensagem: 'Atualizado' });
};

exports.excluirAgendamento = async (req, res) => {
  res.json({ mensagem: 'Excluído' });
};

exports.buscarAgendamentoPorId = async (req, res) => {
  res.json({ id: req.params.id, titulo: 'Mock' });
};
