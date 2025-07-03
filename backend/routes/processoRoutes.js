const {Router} = require('express');
const rota = Router()
const authMiddleware = require('../middleware/authMiddleware');
const processoController = require('../controllers/processesController');

rota.use(authMiddleware);

// Rotas para processos
rota.post('/', processoController.criarProcesso);
rota.get('/', processoController.listarProcessos);

// Rotas para atribuição de alunos
rota.post('/atribuir-aluno', processoController.atribuirAluno);

// Rotas para atualizações
rota.post('/:processo_id/atualizacoes', processoController.adicionarAtualizacao);
rota.get('/:processo_id/atualizacoes', processoController.listarAtualizacoes);

module.exports = router;