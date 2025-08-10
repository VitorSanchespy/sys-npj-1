// Middleware para tratamento de erros do sistema
const errorHandler = (err, req, res, next) => {
  // Log do erro para monitoramento
  console.error('🚨 Erro capturado pelo middleware:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.url,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });

  // Determinar status code baseado no tipo de erro
  let statusCode = err.status || err.statusCode || 500;
  let message = err.message || 'Erro interno do servidor';

  // Tratar erros específicos do Sequelize
  if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = 'Erro de validação de dados';
  } else if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    message = 'Violação de restrição única - dados duplicados';
  } else if (err.name === 'SequelizeForeignKeyConstraintError') {
    statusCode = 400;
    message = 'Erro de referência - dados relacionados não encontrados';
  }

  // Resposta padronizada
  res.status(statusCode).json({
    erro: message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: err
    })
  });
};

module.exports = errorHandler;
