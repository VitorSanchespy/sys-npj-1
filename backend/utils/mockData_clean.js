// Dados Mock Essenciais para Desenvolvimento

const bcrypt = require('bcrypt');

// Senha hashada padrão (admin123)
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
      nome: 'Professor João',
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
      nome: 'Aluno Maria',
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
    { id: 1, nome: 'Admin' },
    { id: 2, nome: 'Professor' },
    { id: 3, nome: 'Aluno' }
  ],

  // Processos
  processos: [
    {
      id: 1,
      numero_processo: '2024-001-NPJ',
      parte_contraria: 'João Silva vs Empresa ABC',
      comarca: 'Cuiabá',
      vara: '1ª Vara Civil',
      valor_causa: 10000.00,
      tipo_acao: 'Civil',
      assunto: 'Cobrança',
      status: 'Em Andamento',
      prioridade: 'Normal',
      descricao: 'Processo de cobrança',
      idusuario_responsavel: 2,
      data_criacao: new Date('2024-01-20')
    }
  ],

  // Agendamentos
  agendamentos: [
    {
      id: 1,
      titulo: 'Audiência - Processo 001',
      descricao: 'Primeira audiência',
      data_agendamento: '2024-12-15',
      hora_inicio: '14:00',
      hora_fim: '15:00',
      local: 'Fórum Central',
      tipo: 'Audiência',
      status: 'Agendado',
      idusuario: 2,
      idprocesso: 1
    }
  ],

  // Notificações
  notificacoes: [
    {
      id: 1,
      titulo: 'Bem-vindo',
      mensagem: 'Bem-vindo ao Sistema NPJ',
      tipo: 'info',
      idusuario: 1,
      lida: false,
      data_criacao: new Date()
    }
  ],

  // Atualizações
  atualizacoes: [
    {
      id: 1,
      titulo: 'Processo Criado',
      descricao: 'Processo criado e em análise',
      status_anterior: null,
      status_novo: 'Em Andamento',
      idprocesso: 1,
      data_criacao: new Date('2024-01-20')
    }
  ],

  // Arquivos
  arquivos: [
    {
      id: 1,
      nome_original: 'peticao.pdf',
      nome_arquivo: 'peticao_1234567890.pdf',
      caminho: '/uploads/peticao_1234567890.pdf',
      tamanho: 2048576,
      tipo: 'application/pdf',
      idprocesso: 1,
      idusuario: 2,
      ativo: true
    }
  ],

  // Tabelas Auxiliares
  tipos_acao: [
    { id: 1, nome: 'Civil' },
    { id: 2, nome: 'Trabalhista' },
    { id: 3, nome: 'Criminal' }
  ],

  status_processo: [
    { id: 1, nome: 'Em Andamento' },
    { id: 2, nome: 'Aguardando' },
    { id: 3, nome: 'Concluído' },
    { id: 4, nome: 'Arquivado' }
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
    { id: 3, nome: 'Rondonópolis' }
  ],

  varas: [
    { id: 1, nome: '1ª Vara Civil' },
    { id: 2, nome: '2ª Vara Civil' },
    { id: 3, nome: '1ª Vara Criminal' }
  ]
};

module.exports = mockData;
