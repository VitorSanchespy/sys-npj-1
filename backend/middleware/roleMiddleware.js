module.exports = function(roles) {
  return (req, res, next) => {
    if (!roles.includes(req.usuario.role)) {
      return res.status(403).json({ message: 'Acesso negado' });
    }
    next();
  };
};