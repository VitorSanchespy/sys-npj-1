// Controller de Tabelas Auxiliares

// Função utilitária para verificar disponibilidade do banco
function isDbAvailable() {
  return global.dbAvailable || false;
}

// Dados mock
const getMockData = () => {
  return {
    status: [
      { id: 1, nome: 'Ativo', descricao: 'Status ativo' },
      { id: 2, nome: 'Inativo', descricao: 'Status inativo' },
      { id: 3, nome: 'Pendente', descricao: 'Status pendente' },
      { id: 4, nome: 'Concluído', descricao: 'Status concluído' }
    ],
    tiposAcao: [
      { id: 1, nome: 'Criar', descricao: 'Ação de criação' },
      { id: 2, nome: 'Editar', descricao: 'Ação de edição' },
      { id: 3, nome: 'Excluir', descricao: 'Ação de exclusão' },
      { id: 4, nome: 'Visualizar', descricao: 'Ação de visualização' }
    ]
  };
};

const { 
  roleModel: Role,
  materiaAssuntoModel: MateriaAssunto,
  faseModel: Fase,
  diligenciaModel: Diligencia,
  localTramitacaoModel: LocalTramitacao
} = require('../models/indexModel');

// Listar roles
exports.listarRoles = async (req, res) => {
  try {
    if (isDbAvailable()) {
      try {
        const roles = await Role.findAll({
          order: [['nome', 'ASC']]
        });
        res.json(roles);
      } catch (dbError) {
        console.log('Erro no banco, usando dados mock:', dbError.message);
        // Fallback com dados mock básicos
        res.json([
          { id: 1, nome: 'Admin', descricao: 'Administrador do sistema' },
          { id: 2, nome: 'Usuario', descricao: 'Usuário comum' },
          { id: 3, nome: 'Coordenador', descricao: 'Coordenador de processos' }
        ]);
      }
    } else {
      // Dados mock quando banco não está disponível
      res.json([
        { id: 1, nome: 'Admin', descricao: 'Administrador do sistema' },
        { id: 2, nome: 'Usuario', descricao: 'Usuário comum' },
        { id: 3, nome: 'Coordenador', descricao: 'Coordenador de processos' }
      ]);
    }
    
  } catch (error) {
    console.error('Erro ao listar roles:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Listar matérias/assuntos
exports.listarMateriaAssunto = async (req, res) => {
  try {
    const materias = await MateriaAssunto.findAll({
      order: [['nome', 'ASC']]
    });
    
    res.json(materias);
    
  } catch (error) {
    console.error('Erro ao listar matérias/assuntos:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Listar fases
exports.listarFases = async (req, res) => {
  try {
    const fases = await Fase.findAll({
      order: [['nome', 'ASC']]
    });
    
    res.json(fases);
    
  } catch (error) {
    console.error('Erro ao listar fases:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Listar diligências
exports.listarDiligencias = async (req, res) => {
  try {
    const diligencias = await Diligencia.findAll({
      order: [['nome', 'ASC']]
    });
    
    res.json(diligencias);
    
  } catch (error) {
    console.error('Erro ao listar diligências:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Listar locais de tramitação
exports.listarLocaisTramitacao = async (req, res) => {
  try {
    const locais = await LocalTramitacao.findAll({
      order: [['nome', 'ASC']]
    });
    
    res.json(locais);
    
  } catch (error) {
    console.error('Erro ao listar locais de tramitação:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Criar nova matéria/assunto
exports.criarMateriaAssunto = async (req, res) => {
  try {
    const { nome } = req.body;
    
    if (!nome) {
      return res.status(400).json({ erro: 'Nome é obrigatório' });
    }
    
    const novaMateria = await MateriaAssunto.create({ nome });
    res.status(201).json(novaMateria);
    
  } catch (error) {
    console.error('Erro ao criar matéria/assunto:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Criar nova fase
exports.criarFase = async (req, res) => {
  try {
    const { nome } = req.body;
    
    if (!nome) {
      return res.status(400).json({ erro: 'Nome é obrigatório' });
    }
    
    const novaFase = await Fase.create({ nome });
    res.status(201).json(novaFase);
    
  } catch (error) {
    console.error('Erro ao criar fase:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Criar nova diligência
exports.criarDiligencia = async (req, res) => {
  try {
    const { nome } = req.body;
    
    if (!nome) {
      return res.status(400).json({ erro: 'Nome é obrigatório' });
    }
    
    const novaDiligencia = await Diligencia.create({ nome });
    res.status(201).json(novaDiligencia);
    
  } catch (error) {
    console.error('Erro ao criar diligência:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Listar status
exports.listarStatus = async (req, res) => {
  try {
    const mockData = getMockData();
    res.json(mockData.status);
  } catch (error) {
    console.error('Erro ao listar status:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Listar tipos de ação
exports.listarTiposAcao = async (req, res) => {
  try {
    const mockData = getMockData();
    res.json(mockData.tiposAcao);
  } catch (error) {
    console.error('Erro ao listar tipos de ação:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Criar novo local de tramitação
exports.criarLocalTramitacao = async (req, res) => {
  try {
    const { nome } = req.body;
    
    if (!nome) {
      return res.status(400).json({ erro: 'Nome é obrigatório' });
    }
    
    const novoLocal = await LocalTramitacao.create({ nome });
    res.status(201).json(novoLocal);
    
  } catch (error) {
    console.error('Erro ao criar local de tramitação:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};
