
// Utilitários para gerenciamento de usuários e roles
export const getUserRole = (user) => {
  if (!user) return null;
  
  if (typeof user.role === 'string') {
    return user.role;
  }
  
  if (user.role && typeof user.role === 'object') {
    return user.role.nome || user.role.name || null;
  }
  
  if (user.role_id === 1) return 'Admin';
  if (user.role_id === 2) return 'Professor';
  if (user.role_id === 3) return 'Aluno';
  
  return null;
};

// Verificar se usuário tem determinada role
export const hasRole = (user, roles) => {
  const userRole = getUserRole(user);
  if (!userRole) return false;
  
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  return allowedRoles.includes(userRole);
};

// Verificar se usuário é admin
export const isAdmin = (user) => hasRole(user, 'Admin');

// Verificar se usuário é professor
export const isProfessor = (user) => hasRole(user, 'Professor');

// Verificar se usuário é aluno
export const isAluno = (user) => hasRole(user, 'Aluno');

// Verificar se usuário pode criar processos
export const canCreateProcess = (user) => hasRole(user, ['Admin', 'Professor']);

// Verificar se usuário pode gerenciar usuários
export const canManageUsers = (user) => hasRole(user, ['Admin', 'Professor']);

// Formatar data para exibição
export const formatDate = (date) => {
  if (!date) return "-";
  try {
    return new Date(date).toLocaleDateString('pt-BR');
  } catch (error) {
    return "-";
  }
};

// Formatar data e hora para exibição
export const formatDateTime = (date) => {
  if (!date) return "-";
  try {
    return new Date(date).toLocaleString('pt-BR');
  } catch (error) {
    return "-";
  }
};

// Verificar se valor é objeto e renderizar adequadamente
export const renderValue = (value) => {
  if (value === null || value === undefined) {
    return "-";
  }
  if (typeof value === 'object') {
    // Tenta encontrar propriedades comuns de nome
    if (value.nome) return value.nome;
    if (value.name) return value.name;
    if (value.titulo) return value.titulo;
    if (value.title) return value.title;
    if (value.descricao) return value.descricao;
    if (value.description) return value.description;
    
    // Se é um objeto com id e nome, é provável que seja um erro de renderização
    if (value.id && (value.nome || value.name)) {
      console.warn('Tentativa de renderizar objeto com id e nome diretamente:', value);
      return value.nome || value.name;
    }
    
    // Como último recurso, stringifica o objeto
    return JSON.stringify(value);
  }
  return String(value) || "-";
};

// Estilos comuns para botões - Padronizados para harmonia visual
export const buttonStyles = {
    blueWhite: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: '1px solid #007bff',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(0, 123, 255, 0.15)',
    minHeight: '38px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  primary: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(0, 123, 255, 0.2)',
    minHeight: '38px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  success: {
    padding: '10px 20px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(40, 167, 69, 0.2)',
    minHeight: '38px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  danger: {
    padding: '10px 20px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(220, 53, 69, 0.2)',
    minHeight: '38px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  secondary: {
    padding: '10px 20px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(108, 117, 125, 0.2)',
    minHeight: '38px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  outline: {
    padding: '10px 20px',
    backgroundColor: 'transparent',
    color: '#007bff',
    border: '1px solid #007bff',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    boxShadow: 'none',
    minHeight: '38px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  light: {
    padding: '10px 20px',
    backgroundColor: '#f8f9fa',
    color: '#212529',
    border: '1px solid #dee2e6',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
    minHeight: '38px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  link: {
    padding: '0',
    backgroundColor: 'transparent',
    color: '#007bff',
    border: 'none',
    borderRadius: '0',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'color 0.2s ease',
    boxShadow: 'none',
    textDecoration: 'underline',
    minHeight: 'auto',
    display: 'inline',
    alignItems: 'center',
    justifyContent: 'center'
  },
    blueWhite: {
      padding: '10px 20px',
      backgroundColor: '#007bff',
      color: 'white',
      border: '1px solid #007bff',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.2s ease',
      boxShadow: '0 2px 4px rgba(0, 123, 255, 0.15)',
      minHeight: '38px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
};

// Status colors para processos
export const getStatusColor = (status) => {
  const statusText = renderValue(status);
  switch (statusText) {
    case 'Aberto':
      return { bg: '#d4edda', color: '#155724' };
    case 'Em andamento':
      return { bg: '#fff3cd', color: '#856404' };
    case 'Fechado':
    case 'Concluído':
      return { bg: '#f8d7da', color: '#721c24' };
    default:
      return { bg: '#f8f9fa', color: '#6c757d' };
  }
};
