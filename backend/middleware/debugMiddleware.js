// Debug middleware para capturar requisições
const debugMiddleware = (req, res, next) => {
    console.log('🔍 DEBUG MIDDLEWARE - Método:', req.method, 'URL:', req.url);
    console.log('🔍 Headers Authorization:', req.headers.authorization);
    console.log('🔍 req.usuario antes do roleMiddleware:', req.usuario);
    
    // Continue para o próximo middleware
    next();
};

module.exports = debugMiddleware;
