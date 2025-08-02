// Controller de Tabelas Auxiliares simplificado

// Função utilitária para verificar disponibilidade do banco
function isDbAvailable() {
  return global.dbAvailable || false;
}

// Dados mock para desenvolvimento
const getMockData = () => {
  return {
    roles: [
      { id: 1, nome: 'Admin' },
      { id: 2, nome: 'Professor' },
      { id: 3, nome: 'Aluno' }
    ],
    tipos_acao: [
      { id: 1, nome: 'Civil' },
      { id: 2, nome: 'Trabalhista' },
      { id: 3, nome: 'Criminal' },
      { id: 4, nome: 'Administrativa' }
    ],
    status_processo: [
      { id: 1, nome: 'Em Andamento' },
      { id: 2, nome: 'Aguardando' },
      { id: 3, nome: 'Concluído' },
      { id: 4, nome: 'Suspenso' },
      { id: 5, nome: 'Arquivado' }
    ],
    prioridades: [
      { id: 1, nome: 'Baixa' },
      { id: 2, nome: 'Normal' },
      { id: 3, nome: 'Alta' },
      { id: 4, nome: 'Urgente' }
    ],
    comarcas: [
      { id: 1, nome: 'Cuiabá' },
      { id: 2, nome: 'Várzea Grande' },
      { id: 3, nome: 'Rondonópolis' },
      { id: 4, nome: 'Sinop' },
      { id: 5, nome: 'Tangará da Serra' }
    ],
    varas: [
      { id: 1, nome: '1ª Vara Civil' },
      { id: 2, nome: '2ª Vara Civil' },
      { id: 3, nome: '1ª Vara Criminal' },
      { id: 4, nome: '2ª Vara Criminal' },
      { id: 5, nome: '1ª Vara Trabalhista' },
      { id: 6, nome: '2ª Vara Trabalhista' }
    ]
  };
};

// Listar roles
exports.listarRoles = async (req, res) => {
  try {
    let roles = [];
    
    if (isDbAvailable()) {
      const { rolesModels: Role } = require('../models/indexModels');
      roles = await Role.findAll({
        order: [['nome', 'ASC']]
      });
    } else {
      const mockData = getMockData();
      roles = mockData.roles;
    }
    
    res.json(roles);
    
  } catch (error) {
    console.error('Erro ao listar roles:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Listar tipos de ação
exports.listarTiposAcao = async (req, res) => {
  try {
    let tipos = [];
    
    if (isDbAvailable()) {
      const { tiposAcaoModels: TipoAcao } = require('../models/indexModels');
      tipos = await TipoAcao.findAll({
        order: [['nome', 'ASC']]
      });
    } else {
      const mockData = getMockData();
      tipos = mockData.tipos_acao;
    }
    
    res.json(tipos);
    
  } catch (error) {
    console.error('Erro ao listar tipos de ação:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Listar status de processo
exports.listarStatusProcesso = async (req, res) => {
  try {
    let status = [];
    
    if (isDbAvailable()) {
      const { statusProcessoModels: StatusProcesso } = require('../models/indexModels');
      status = await StatusProcesso.findAll({
        order: [['nome', 'ASC']]
      });
    } else {
      const mockData = getMockData();
      status = mockData.status_processo;
    }
    
    res.json(status);
    
  } catch (error) {
    console.error('Erro ao listar status de processo:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Listar prioridades
exports.listarPrioridades = async (req, res) => {
  try {
    let prioridades = [];
    
    if (isDbAvailable()) {
      const { prioridadesModels: Prioridade } = require('../models/indexModels');
      prioridades = await Prioridade.findAll({
        order: [['nome', 'ASC']]
      });
    } else {
      const mockData = getMockData();
      prioridades = mockData.prioridades;
    }
    
    res.json(prioridades);
    
  } catch (error) {
    console.error('Erro ao listar prioridades:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Listar comarcas
exports.listarComarcas = async (req, res) => {
  try {
    let comarcas = [];
    
    if (isDbAvailable()) {
      const { comarcasModels: Comarca } = require('../models/indexModels');
      comarcas = await Comarca.findAll({
        order: [['nome', 'ASC']]
      });
    } else {
      const mockData = getMockData();
      comarcas = mockData.comarcas;
    }
    
    res.json(comarcas);
    
  } catch (error) {
    console.error('Erro ao listar comarcas:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Listar varas
exports.listarVaras = async (req, res) => {
  try {
    let varas = [];
    
    if (isDbAvailable()) {
      const { varasModels: Vara } = require('../models/indexModels');
      varas = await Vara.findAll({
        order: [['nome', 'ASC']]
      });
    } else {
      const mockData = getMockData();
      varas = mockData.varas;
    }
    
    res.json(varas);
    
  } catch (error) {
    console.error('Erro ao listar varas:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Obter todas as opções auxiliares
exports.obterTodasOpcoes = async (req, res) => {
  try {
    const mockData = getMockData();
    
    let dados = {
      roles: mockData.roles,
      tipos_acao: mockData.tipos_acao,
      status_processo: mockData.status_processo,
      prioridades: mockData.prioridades,
      comarcas: mockData.comarcas,
      varas: mockData.varas
    };
    
    if (isDbAvailable()) {
      // Se o banco estiver disponível, buscar dados reais
      try {
        const { 
          rolesModels: Role, 
          tiposAcaoModels: TipoAcao,
          statusProcessoModels: StatusProcesso,
          prioridadesModels: Prioridade,
          comarcasModels: Comarca,
          varasModels: Vara
        } = require('../models/indexModels');
        
        const [roles, tipos, status, prioridades, comarcas, varas] = await Promise.all([
          Role.findAll({ order: [['nome', 'ASC']] }),
          TipoAcao.findAll({ order: [['nome', 'ASC']] }),
          StatusProcesso.findAll({ order: [['nome', 'ASC']] }),
          Prioridade.findAll({ order: [['nome', 'ASC']] }),
          Comarca.findAll({ order: [['nome', 'ASC']] }),
          Vara.findAll({ order: [['nome', 'ASC']] })
        ]);
        
        dados = {
          roles,
          tipos_acao: tipos,
          status_processo: status,
          prioridades,
          comarcas,
          varas
        };
      } catch (dbError) {
        console.log('⚠️ Erro no banco, usando dados mock:', dbError.message);
      }
    }
    
    res.json(dados);
    
  } catch (error) {
    console.error('Erro ao obter opções auxiliares:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};
