// Middleware para controle de acesso baseado em roles
const jwt = require('jsonwebtoken');


// Middleware para verificar roles específicas
const roleMiddleware = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      // Verificar tanto req.user quanto req.usuario para compatibilidade
      const user = req.user || req.usuario;
      if (!user) {
        return res.status(401).json({ erro: 'Token de autenticação necessário' });
      }
      // Suporta role como string (nome) ou número (id)
      let userRole = user.role;
      if (typeof userRole === 'object' && userRole.nome) userRole = userRole.nome;
      if (typeof userRole === 'number') userRole = userRole.toString();
      if (typeof userRole === 'string') userRole = userRole.trim();

      // Normalizar roles permitidas para comparação
      const normalizedAllowedRoles = allowedRoles.map(r => {
        if (typeof r === 'number') return r.toString();
        if (typeof r === 'string') return r.trim();
        return r;
      });

      // Se não há roles especificadas, permite qualquer role autenticada
      if (normalizedAllowedRoles.length === 0) {
        return next();
      }

      // Permite por nome ou id
      const hasPermission = normalizedAllowedRoles.includes(userRole) ||
        normalizedAllowedRoles.includes((userRole || '').toLowerCase());

      if (!hasPermission) {
        return res.status(403).json({ message: 'Acesso negado' });
      }
      next();
    } catch (error) {
      return res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  };
};

// Middleware específico para Admin (id 1 ou nome 'Admin')
const adminOnly = roleMiddleware(['Admin', 1]);
// Middleware para Professor (id 2 ou nome 'Professor') e Admin
const professorOrAdmin = roleMiddleware(['Admin', 1, 'Professor', 2]);
// Middleware para qualquer usuário autenticado
const authenticated = roleMiddleware([]);

// Função para verificar se o usuário é Admin
const isAdmin = (user) => {
  let role = user.role;
  if (typeof role === 'object' && role.nome) role = role.nome;
  if (typeof role === 'number') role = role.toString();
  if (typeof role === 'string') role = role.trim();
  return role === 'Admin' || role === '1';
};
// Função para verificar se o usuário é Professor
const isProfessor = (user) => {
  let role = user.role;
  if (typeof role === 'object' && role.nome) role = role.nome;
  if (typeof role === 'number') role = role.toString();
  if (typeof role === 'string') role = role.trim();
  return role === 'Professor' || role === '2';
};
// Função para verificar se o usuário é Aluno
const isAluno = (user) => {
  let role = user.role;
  if (typeof role === 'object' && role.nome) role = role.nome;
  if (typeof role === 'number') role = role.toString();
  if (typeof role === 'string') role = role.trim();
  return role === 'Aluno' || role === '3';
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
