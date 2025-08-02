const usuarios = [
  {
    id: 1,
    nome: 'Admin',
    email: 'admin@teste.com',
    senha: '$2b$10$K8j/vQx.KJ.QqXJ.QqXJ.Oe7KJ.QqXJ.QqXJ.QqXJ.QqXJ.QqXJ.Q', // senha: admin123
    role_id: 1,
    role: 'Administrador',
    ativo: true,
    data_criacao: new Date(),
    data_atualizacao: new Date()
  },
  {
    id: 2,
    nome: 'Professor',
    email: 'professor@teste.com',
    senha: '$2b$10$K8j/vQx.KJ.QqXJ.QqXJ.Oe7KJ.QqXJ.QqXJ.QqXJ.QqXJ.QqXJ.Q', // senha: 123456
    role_id: 2,
    role: 'Professor',
    ativo: true,
    data_criacao: new Date(),
    data_atualizacao: new Date()
  },
  {
    id: 3,
    nome: 'Aluno',
    email: 'aluno@teste.com',
    senha: '$2b$10$K8j/vQx.KJ.QqXJ.QqXJ.Oe7KJ.QqXJ.QqXJ.QqXJ.QqXJ.QqXJ.Q', // senha: 123456
    role_id: 3,
    role: 'Aluno',
    ativo: true,
    data_criacao: new Date(),
    data_atualizacao: new Date()
  }
];

const processos = [
  {
    id: 1,
    numero_processo: '001/2025',
    descricao: 'Processo de teste',
    assistido: 'João da Silva',
    contato_assistido: '(65) 99999-9999',
    data_criacao: new Date(),
    data_atualizacao: new Date()
  }
];

const agendamentos = [
  {
    id: 1,
    tipo_evento: 'audiencia',
    titulo: 'Audiência Inicial',
    descricao: 'Primeira audiência do processo 001/2025',
    data_evento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    local: 'Sala 1',
    processo_id: 1,
    criado_por: 1,
    data_criacao: new Date(),
    data_atualizacao: new Date()
  }
];

const notificacoes = [
  {
    id: 1,
    titulo: 'Nova audiência marcada',
    mensagem: 'Foi marcada uma audiência para o processo 001/2025',
    tipo: 'agendamento',
    usuario_id: 1,
    lida: false,
    data_criacao: new Date(),
    data_atualizacao: new Date()
  }
];

module.exports = {
  usuarios,
  processos,
  agendamentos,
  notificacoes
};
