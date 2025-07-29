// Controlador de Agendamentos
const { agendamentoModels: Agendamento } = require('../db/indexModels');

// Lista agendamentos
// Lista agendamentos
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

// Cria novo agendamento
// Cria novo agendamento
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
      descricao,
      data_evento,
      local,
      status: 'pendente',
      lembrete_1_dia: lembrete_1_dia || false,
      lembrete_2_dias: lembrete_2_dias || false,
      lembrete_1_semana: lembrete_1_semana || false
    });
    
    res.status(201).json(agendamento);
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Atualiza agendamento
// Atualiza agendamento
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

// Exclui agendamento
// Exclui agendamento
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

// Busca agendamento por ID
// Busca agendamento por ID
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


// ROTAS
const express = require('express');
const router = express.Router();
const agendamentoControllers = require('../controllers/agendamentoControllers');
const authMiddleware = require('../middleware/authMiddleware');

// Rotas simplificadas
router.get('/', authMiddleware, agendamentoControllers.listarAgendamentos);
router.post('/', authMiddleware, agendamentoControllers.criarAgendamento);
router.put('/:id', authMiddleware, agendamentoControllers.atualizarAgendamento);
router.delete('/:id', authMiddleware, agendamentoControllers.excluirAgendamento);
router.get('/:id', authMiddleware, agendamentoControllers.buscarAgendamentoPorId);

module.exports = router;
