// Controller de Tabelas Auxiliares

// Função utilitária para verificar disponibilidade do banco
function isDbAvailable() {
  return global.dbAvailable || false;
}

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
    if (isDbAvailable()) {
      try {
        const materias = await MateriaAssunto.findAll({
          order: [['nome', 'ASC']]
        });
        res.json(materias);
      } catch (dbError) {
        console.log('Erro no banco, usando dados mock:', dbError.message);
        // Fallback com dados mock
        res.json([
          { id: 1, nome: 'Direito Civil', descricao: 'Questões de direito civil' },
          { id: 2, nome: 'Direito Trabalhista', descricao: 'Questões trabalhistas' },
          { id: 3, nome: 'Direito Penal', descricao: 'Questões penais' },
          { id: 4, nome: 'Direito Consumidor', descricao: 'Defesa do consumidor' }
        ]);
      }
    } else {
      // Dados mock quando banco não está disponível
      res.json([
        { id: 1, nome: 'Direito Civil', descricao: 'Questões de direito civil' },
        { id: 2, nome: 'Direito Trabalhista', descricao: 'Questões trabalhistas' },
        { id: 3, nome: 'Direito Penal', descricao: 'Questões penais' },
        { id: 4, nome: 'Direito Consumidor', descricao: 'Defesa do consumidor' }
      ]);
    }
    
  } catch (error) {
    console.error('Erro ao listar matérias/assuntos:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Listar fases
exports.listarFases = async (req, res) => {
  try {
    if (isDbAvailable()) {
      try {
        const fases = await Fase.findAll({
          order: [['nome', 'ASC']]
        });
        res.json(fases);
      } catch (dbError) {
        console.log('Erro no banco, usando dados mock:', dbError.message);
        // Fallback com dados mock
        res.json([
          { id: 1, nome: 'Inicial', descricao: 'Fase inicial do processo' },
          { id: 2, nome: 'Instrução', descricao: 'Fase de instrução processual' },
          { id: 3, nome: 'Julgamento', descricao: 'Fase de julgamento' },
          { id: 4, nome: 'Recurso', descricao: 'Fase recursal' },
          { id: 5, nome: 'Execução', descricao: 'Fase de execução' }
        ]);
      }
    } else {
      // Dados mock quando banco não está disponível
      res.json([
        { id: 1, nome: 'Inicial', descricao: 'Fase inicial do processo' },
        { id: 2, nome: 'Instrução', descricao: 'Fase de instrução processual' },
        { id: 3, nome: 'Julgamento', descricao: 'Fase de julgamento' },
        { id: 4, nome: 'Recurso', descricao: 'Fase recursal' },
        { id: 5, nome: 'Execução', descricao: 'Fase de execução' }
      ]);
    }
    
  } catch (error) {
    console.error('Erro ao listar fases:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Listar diligências
exports.listarDiligencias = async (req, res) => {
  try {
    if (isDbAvailable()) {
      try {
        const diligencias = await Diligencia.findAll({
          order: [['nome', 'ASC']]
        });
        res.json(diligencias);
      } catch (dbError) {
        console.log('Erro no banco, usando dados mock:', dbError.message);
        // Fallback com dados mock
        res.json([
          { id: 1, nome: 'Petição Inicial', descricao: 'Elaboração de petição inicial' },
          { id: 2, nome: 'Contestação', descricao: 'Preparação de contestação' },
          { id: 3, nome: 'Audiência', descricao: 'Participação em audiência' },
          { id: 4, nome: 'Recurso', descricao: 'Interposição de recurso' }
        ]);
      }
    } else {
      // Dados mock quando banco não está disponível
      res.json([
        { id: 1, nome: 'Petição Inicial', descricao: 'Elaboração de petição inicial' },
        { id: 2, nome: 'Contestação', descricao: 'Preparação de contestação' },
        { id: 3, nome: 'Audiência', descricao: 'Participação em audiência' },
        { id: 4, nome: 'Recurso', descricao: 'Interposição de recurso' }
      ]);
    }
    
  } catch (error) {
    console.error('Erro ao listar diligências:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Listar locais de tramitação
exports.listarLocaisTramitacao = async (req, res) => {
  try {
    if (isDbAvailable()) {
      try {
        const locais = await LocalTramitacao.findAll({
          order: [['nome', 'ASC']]
        });
        res.json(locais);
      } catch (dbError) {
        console.log('Erro no banco, usando dados mock:', dbError.message);
        // Fallback com dados mock
        res.json([
          { id: 1, nome: 'Vara Cível', descricao: 'Vara Cível Central' },
          { id: 2, nome: 'Vara Trabalhista', descricao: 'Vara do Trabalho' },
          { id: 3, nome: 'Tribunal de Justiça', descricao: 'TJ/MT' },
          { id: 4, nome: 'Defensoria Pública', descricao: 'Defensoria Pública do Estado' }
        ]);
      }
    } else {
      // Dados mock quando banco não está disponível
      res.json([
        { id: 1, nome: 'Vara Cível', descricao: 'Vara Cível Central' },
        { id: 2, nome: 'Vara Trabalhista', descricao: 'Vara do Trabalho' },
        { id: 3, nome: 'Tribunal de Justiça', descricao: 'TJ/MT' },
        { id: 4, nome: 'Defensoria Pública', descricao: 'Defensoria Pública do Estado' }
      ]);
    }
    
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
    if (!isDbAvailable()) {
      return res.status(503).json({ erro: 'Banco de dados não disponível' });
    }

    // Retornar status padrão do sistema
    const statusPadrao = [
      { id: 1, nome: 'Ativo', descricao: 'Registro ativo no sistema' },
      { id: 2, nome: 'Inativo', descricao: 'Registro inativo no sistema' },
      { id: 3, nome: 'Pendente', descricao: 'Aguardando análise' },
      { id: 4, nome: 'Concluído', descricao: 'Processo finalizado' }
    ];
    
    res.json(statusPadrao);
  } catch (error) {
    console.error('Erro ao listar status:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Listar tipos de ação
exports.listarTiposAcao = async (req, res) => {
  try {
    if (!isDbAvailable()) {
      return res.status(503).json({ erro: 'Banco de dados não disponível' });
    }

    // Retornar tipos de ação padrão do sistema
    const tiposAcaoPadrao = [
      { id: 1, nome: 'Criar', descricao: 'Criar novo registro' },
      { id: 2, nome: 'Editar', descricao: 'Editar registro existente' },
      { id: 3, nome: 'Excluir', descricao: 'Excluir registro' },
      { id: 4, nome: 'Visualizar', descricao: 'Visualizar detalhes' }
    ];
    
    res.json(tiposAcaoPadrao);
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
