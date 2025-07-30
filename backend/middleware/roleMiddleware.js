// Middleware para controle de acesso baseado em roles
const jwt = require('jsonwebtoken');

// Middleware para verificar roles específicas
const roleMiddleware = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      // Verificar se o usuário está autenticado
      if (!req.usuario) {
        return res.status(401).json({ erro: 'Token de autenticação necessário' });
      }

      const { role } = req.usuario;

      // Se não há roles especificadas, permite qualquer role autenticada
      if (allowedRoles.length === 0) {
        return next();
      }

      // Verificar se a role do usuário está nas roles permitidas
      // Aceita tanto string quanto number para compatibilidade
      const userRole = typeof role === 'number' ? role.toString() : role;
      
      // Mapeamento de roles para compatibilidade
      const roleMap = {
        '0': 'Admin',
        '1': 'Professor', 
        '2': 'Aluno',
        'Admin': '0',
        'Professor': '1',
        'Aluno': '2'
      };

      // Verificar se a role do usuário (original ou mapeada) está permitida
      const hasPermission = allowedRoles.some(allowedRole => {
        const allowedRoleStr = typeof allowedRole === 'number' ? allowedRole.toString() : allowedRole;
        return userRole === allowedRoleStr || 
               userRole === roleMap[allowedRoleStr] || 
               roleMap[userRole] === allowedRoleStr;
      });

      if (!hasPermission) {
        return res.status(403).json({ 
          erro: 'Acesso negado. Permissão insuficiente.',
          roleAtual: role,
          rolesPermitidas: allowedRoles
        });
      }

      next();
    } catch (error) {
      console.error('Erro no middleware de role:', error);
      return res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  };
};

// Middleware específico para Admin
const adminOnly = roleMiddleware(['Admin', 0]);

// Middleware específico para Professor e Admin
const professorOrAdmin = roleMiddleware(['Admin', 'Professor', 0, 1]);

// Middleware específico para todas as roles autenticadas
const authenticated = roleMiddleware([]);

// Função para verificar se o usuário é Admin
const isAdmin = (user) => {
  const role = typeof user.role === 'number' ? user.role.toString() : user.role;
  return role === '0' || role === 'Admin';
};

// Função para verificar se o usuário é Professor
const isProfessor = (user) => {
  const role = typeof user.role === 'number' ? user.role.toString() : user.role;
  return role === '1' || role === 'Professor';
};

// Função para verificar se o usuário é Aluno
const isAluno = (user) => {
  const role = typeof user.role === 'number' ? user.role.toString() : user.role;
  return role === '2' || role === 'Aluno';
};

module.exports = {
  roleMiddleware,
  adminOnly,
  professorOrAdmin,
  authenticated,
  isAdmin,
  isProfessor,
  isAluno
};
