// const AgendamentoTeste = require('../models/agendamentoTeste'); // REMOVIDO - arquivo não existe mais

async function testeController(req, res) {
  try {
    const { processoId } = req.params;
    
    const agendamentos = await AgendamentoTeste.findAll({
      where: { processo_id: processoId }
    });
    
    return res.json({
      success: true,
      data: { agendamentos }
    });
  } catch (error) {
    console.error('Erro:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

module.exports = { testeController };
