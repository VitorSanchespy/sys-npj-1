// Middleware de Role Simplificado

// Verificação de role baseada no usuário autenticado
const roleMiddleware = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      // Verificar se usuário está autenticado
      if (!req.user && !req.usuario) {
        return res.status(401).json({ erro: 'Autenticação necessária' });
      }

      // Pegar role do usuário (compatibilidade com req.user e req.usuario)
      const usuario = req.user || req.usuario;
      const userRole = usuario.role;

      // Se não há roles especificadas, permite qualquer usuário autenticado
      if (!allowedRoles || allowedRoles.length === 0) {
        return next();
      }

      // Admin sempre tem acesso
      if (userRole && userRole.toLowerCase() === 'admin') {
        return next();
      }

      // Verificar se role do usuário está na lista permitida
      const normalizedUserRole = (userRole || '').toLowerCase();
      const normalizedAllowedRoles = allowedRoles.map(role => role.toLowerCase());

      if (normalizedAllowedRoles.includes(normalizedUserRole)) {
        return next();
      }

      return res.status(403).json({ 
        erro: 'Acesso negado', 
        message: 'Você não tem permissão para acessar este recurso' 
      });

    } catch (error) {
      console.error('Erro no middleware de role:', error);
      return res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  };
};

// Middlewares específicos para roles comuns
const adminOnly = roleMiddleware(['Admin']);
const professorOrAdmin = roleMiddleware(['Professor', 'Admin']);
const alunoOuSuperior = roleMiddleware(['Aluno', 'Professor', 'Admin']);

module.exports = {
  roleMiddleware,
  adminOnly,
  professorOrAdmin,
  alunoOuSuperior
};
