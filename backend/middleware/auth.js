const jwt = require('jsonwebtoken');

module.exports = (roles = []) => {
  // Allow string role input too (e.g., 'admin' instead of ['admin'])
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.warn('Token ausente ou mal formatado');
      return res.sendStatus(401);
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, 'secreto', (err, user) => {
      if (err) {
        console.error('Token inválido:', err.message);
        return res.sendStatus(403);
      }

      if (roles.length && !roles.includes(user.role)) {
        console.warn(`Acesso negado. Role necessário: ${roles.join(', ')}, recebido: ${user.role}`);
        return res.sendStatus(403);
      }

      req.user = user; // ID e role do token
      next();
    });
  };
};
