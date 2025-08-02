// Dados Mock Completos para Desenvolvimento

const bcrypt = require('bcrypt');

// Senhas hashadas para desenvolvimento (todas são 'admin123')
const senhaHash = '$2b$10$8KJvbTZHh4Q6W5k8lB2YEuN8qNGrYwHoF9Z.5J7X6k4B1Q9cD8fC6';

const mockData = {
  // Usuários
  usuarios: [
    {
      id: 1,
      nome: 'Admin Sistema',
      email: 'admin@teste.com',
      senha: senhaHash,
      role_id: 1,
      role: 'Admin',
      ativo: true,
      data_criacao: new Date('2024-01-01'),
      data_atualizacao: new Date()
    },
    {
      id: 2,
      nome: 'Professor João Silva',
      email: 'professor@teste.com',
      senha: senhaHash,
      role_id: 2,
      role: 'Professor',
      ativo: true,
      data_criacao: new Date('2024-01-15'),
      data_atualizacao: new Date()
    },
    {
      id: 3,
      nome: 'Aluno Maria Santos',
      email: 'aluno@teste.com',
      senha: senhaHash,
      role_id: 3,
      role: 'Aluno',
      ativo: true,
      data_criacao: new Date('2024-02-01'),
      data_atualizacao: new Date()
    }
  ],

  // Roles
  roles: [
    { id: 1, nome: 'Admin', descricao: 'Administrador do sistema' },
    { id: 2, nome: 'Professor', descricao: 'Professor orientador' },
    { id: 3, nome: 'Aluno', descricao: 'Aluno do NPJ' }
  ],

  // Processos
  processos: [
    {
      id: 1,
      numero_processo: '2024-001-NPJ-001',
      parte_contraria: 'João Silva vs Empresa ABC',
      comarca: 'Cuiabá',
      vara: '1ª Vara Civil',
      valor_causa: 10000.00,
      tipo_acao: 'Civil',
      assunto: 'Cobrança de dívida',
      status: 'Em Andamento',
      prioridade: 'Normal',
      descricao: 'Processo de cobrança de dívida em aberto',
      idusuario_responsavel: 2,
      data_criacao: new Date('2024-01-20'),
      data_atualizacao: new Date()
    },
    {
      id: 2,
      numero_processo: '2024-002-NPJ-002',
      parte_contraria: 'Maria Santos vs Construtora XYZ',
      comarca: 'Várzea Grande',
      vara: '2ª Vara Civil',
      valor_causa: 25000.00,
      tipo_acao: 'Civil',
      assunto: 'Defeito na construção',
      status: 'Aguardando',
      prioridade: 'Alta',
      descricao: 'Processo por defeitos na construção civil',
      idusuario_responsavel: 2,
      data_criacao: new Date('2024-02-01'),
      data_atualizacao: new Date()
    }
  ],

  // Agendamentos
  agendamentos: [
    {
      id: 1,
      titulo: 'Audiência Inicial - Processo 001',
      descricao: 'Primeira audiência do processo de cobrança',
      data_agendamento: '2024-12-15',
      hora_inicio: '14:00',
      hora_fim: '15:00',
      local: 'Fórum Central de Cuiabá',
      tipo: 'Audiência',
      status: 'Agendado',
      idusuario: 2,
      idprocesso: 1,
      data_criacao: new Date('2024-01-21')
    },
    {
      id: 2,
      titulo: 'Reunião com Cliente - Processo 002',
      descricao: 'Reunião para discussão do caso',
      data_agendamento: '2024-12-20',
      hora_inicio: '10:00',
      hora_fim: '11:00',
      local: 'NPJ - Sala de Reuniões',
      tipo: 'Reunião',
      status: 'Agendado',
      idusuario: 2,
      idprocesso: 2,
      data_criacao: new Date('2024-02-02')
    }
  ],

  // Notificações
  notificacoes: [
    {
      id: 1,
      titulo: 'Bem-vindo ao Sistema',
      mensagem: 'Seja bem-vindo ao Sistema NPJ! Sua conta foi criada com sucesso.',
      tipo: 'info',
      idusuario: 1,
      lida: false,
      data_criacao: new Date(),
      data_leitura: null
    },
    {
      id: 2,
      titulo: 'Novo Processo Criado',
      mensagem: 'Um novo processo foi atribuído a você: 2024-001-NPJ-001',
      tipo: 'success',
      idusuario: 2,
      idprocesso: 1,
      lida: false,
      data_criacao: new Date('2024-01-20'),
      data_leitura: null
    },
    {
      id: 3,
      titulo: 'Audiência Agendada',
      mensagem: 'Audiência agendada para 15/12/2024 às 14:00',
      tipo: 'warning',
      idusuario: 2,
      idagendamento: 1,
      lida: true,
      data_criacao: new Date('2024-01-21'),
      data_leitura: new Date('2024-01-22')
    }
  ],

  // Atualizações de Processo
  atualizacoes: [
    {
      id: 1,
      titulo: 'Processo Criado',
      descricao: 'Processo 2024-001-NPJ-001 foi criado e está aguardando análise',
      status_anterior: null,
      status_novo: 'Em Andamento',
      idprocesso: 1,
      data_criacao: new Date('2024-01-20')
    },
    {
      id: 2,
      titulo: 'Audiência Agendada',
      descricao: 'Primeira audiência foi agendada para 15/12/2024',
      status_anterior: 'Em Andamento',
      status_novo: 'Em Andamento',
      idprocesso: 1,
      data_criacao: new Date('2024-01-21')
    }
  ],

  // Arquivos
  arquivos: [
    {
      id: 1,
      nome_original: 'petição_inicial.pdf',
      nome_arquivo: 'peticao_inicial_1234567890.pdf',
      caminho: '/uploads/peticao_inicial_1234567890.pdf',
      tamanho: 2048576,
      tipo: 'application/pdf',
      idprocesso: 1,
      idusuario: 2,
      ativo: true,
      data_upload: new Date('2024-01-20')
    },
    {
      id: 2,
      nome_original: 'documentos_cliente.pdf',
      nome_arquivo: 'documentos_cliente_0987654321.pdf',
      caminho: '/uploads/documentos_cliente_0987654321.pdf',
      tamanho: 1024000,
      tipo: 'application/pdf',
      idprocesso: 2,
      idusuario: 2,
      ativo: true,
      data_upload: new Date('2024-02-01')
    }
  ],

  // Tabelas Auxiliares
  tipos_acao: [
    { id: 1, nome: 'Civil' },
    { id: 2, nome: 'Trabalhista' },
    { id: 3, nome: 'Criminal' },
    { id: 4, nome: 'Administrativa' },
    { id: 5, nome: 'Previdenciária' }
  ],

  status_processo: [
    { id: 1, nome: 'Em Andamento' },
    { id: 2, nome: 'Aguardando' },
    { id: 3, nome: 'Concluído' },
    { id: 4, nome: 'Suspenso' },
    { id: 5, nome: 'Arquivado' },
    { id: 6, nome: 'Cancelado' }
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
    { id: 5, nome: 'Tangará da Serra' },
    { id: 6, nome: 'Cáceres' },
    { id: 7, nome: 'Barra do Garças' }
  ],

  varas: [
    { id: 1, nome: '1ª Vara Civil' },
    { id: 2, nome: '2ª Vara Civil' },
    { id: 3, nome: '3ª Vara Civil' },
    { id: 4, nome: '1ª Vara Criminal' },
    { id: 5, nome: '2ª Vara Criminal' },
    { id: 6, nome: '1ª Vara Trabalhista' },
    { id: 7, nome: '2ª Vara Trabalhista' },
    { id: 8, nome: 'Vara de Família' },
    { id: 9, nome: 'Vara da Fazenda Pública' }
  ]
};

module.exports = mockData;
