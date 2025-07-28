const {
  processoModels: Processo,
  usuariosModels: Usuario,
  usuariosProcessoModels: UsuariosProcesso
} = require('../models/indexModels');

// Listar processos
exports.listarProcessos = async (req, res) => {
  try {
    const processos = await Processo.findAll({
      include: [{ model: Usuario, as: 'responsavel' }]
    });
    res.json(processos);
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Criar processo
exports.criarProcesso = async (req, res) => {
  try {
    const { numero_processo, descricao, assistido, contato_assistido } = req.body;
    
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

// Atualizar processo
exports.atualizarProcessos = async (req, res) => {
  try {
    const { processo_id } = req.params;
    const processo = await Processo.findByPk(processo_id);
    
    if (!processo) {
      return res.status(404).json({ erro: 'Processo não encontrado' });
    }
    
    await processo.update(req.body);
    res.json(processo);
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Buscar por ID
exports.buscarProcessoPorId = async (req, res) => {
  try {
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

// Vincular usuário
exports.vincularUsuario = async (req, res) => {
  try {
    const { processo_id, usuario_id } = req.body;
    
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

// Compatibilidade com métodos existentes
exports.excluirProcesso = async (req, res) => {
  try {
    const processo = await Processo.findByPk(req.params.id);
    if (!processo) {
      return res.status(404).json({ erro: 'Processo não encontrado' });
    }
    await processo.destroy();
    res.json({ mensagem: 'Processo excluído' });
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};
