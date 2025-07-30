// Controlador de Processos
const {
  processoModels: Processo,
  usuariosModels: Usuario,
  usuariosProcessoModels: UsuariosProcesso
} = require('../db/indexModels');

// Lista processos
exports.listarProcessos = async (req, res) => {
  try {
    // Buscar todos os processos com seus usuários responsáveis
    const processos = await Processo.findAll({
      include: [{ model: Usuario, as: 'responsavel' }]
    });
    res.json(processos);
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Cria novo processo
exports.criarProcesso = async (req, res) => {
  try {
    const { numero_processo, descricao, assistido, contato_assistido } = req.body;
    
    // Criar processo com usuário autenticado como responsável
    const processo = await Processo.create({
      numero_processo,
      descricao,
      assistido,
      contato_assistido,
      idusuario_responsavel: req.usuario.id,
      status: 'ativo'
    });
    
    res.status(201).json(processo);
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Atualiza processo
exports.atualizarProcessos = async (req, res) => {
  try {
    const { processo_id } = req.params;
    const processo = await Processo.findByPk(processo_id);
    
    if (!processo) {
      return res.status(404).json({ erro: 'Processo não encontrado' });
    }
    
    // Atualizar processo com dados fornecidos
    await processo.update(req.body);
    res.json(processo);
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Busca processo por ID
exports.buscarProcessoPorId = async (req, res) => {
  try {
    // Buscar processo por ID com usuário responsável
    const processo = await Processo.findByPk(req.params.id, {
      include: [{ model: Usuario, as: 'responsavel' }]
    });
    
    if (!processo) {
      return res.status(404).json({ erro: 'Processo não encontrado' });
    }
    
    res.json(processo);
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Vincula usuário ao processo
exports.vincularUsuario = async (req, res) => {
  try {
    const { processo_id, usuario_id } = req.body;
    
    // Criar vínculo entre usuário e processo
    const vinculo = await UsuariosProcesso.create({
      processo_id,
      usuario_id
    });
    
    res.status(201).json(vinculo);
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Exclui processo
exports.excluirProcesso = async (req, res) => {
  try {
    const processo = await Processo.findByPk(req.params.id);
    if (!processo) {
      return res.status(404).json({ erro: 'Processo não encontrado' });
    }
    
    // Remover processo definitivamente
    await processo.destroy();
    res.json({ mensagem: 'Processo excluído' });
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};
