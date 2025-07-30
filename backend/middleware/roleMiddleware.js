// Middleware para controle de acesso baseado em roles
const jwt = require('jsonwebtoken');

// Middleware para verificar roles específicas
const roleMiddleware = (allowedRoles = []) => {
  return (req, res, next) => {
    console.log('🔍 ROLE MIDDLEWARE EXECUTADO!');
    console.log('🔐 Allowed roles:', allowedRoles);
    
    try {
      // Verificar se o usuário está autenticado
      if (!req.usuario) {
        console.log('❌ req.usuario não existe');
        return res.status(401).json({ erro: 'Token de autenticação necessário' });
      }

      console.log('👤 req.usuario:', req.usuario);
      const { role } = req.usuario;

      // Se não há roles especificadas, permite qualquer role autenticada
      if (allowedRoles.length === 0) {
        return next();
      }

      // Normalizar roles para comparação case-insensitive
      const userRole = (role || '').toLowerCase();
      const normalizedAllowedRoles = allowedRoles.map(r => r.toLowerCase());
      
      console.log('DEBUG ROLE:', { userRole, normalizedAllowedRoles });
      
      // Verificar se a role do usuário está nas roles permitidas
      const hasPermission = normalizedAllowedRoles.includes(userRole);

      if (!hasPermission) {
        console.log('Role Access Debug:', {
          userRole: role,
          allowedRoles,
          hasPermission
        });
        return res.status(403).json({ 
          message: 'Acesso negado'
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
