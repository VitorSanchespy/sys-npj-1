// Middleware para interceptar respostas 403
const interceptor403 = (req, res, next) => {
    console.log('🔍 INTERCEPTOR: ' + req.method + ' ' + req.url);
    console.log('🔍 Headers:', req.headers.authorization ? 'Token presente' : 'Sem token');
    
    // Interceptar res.status para capturar 403s
    const originalStatus = res.status;
    res.status = function(statusCode) {
        if (statusCode === 403) {
            console.log('🚨 INTERCEPTED 403 RESPONSE!');
            console.log('🚨 URL:', req.url);
            console.log('🚨 Method:', req.method);
            console.log('🚨 req.usuario:', req.usuario);
            
            // Log da stack trace para saber onde o 403 foi gerado
            console.log('🚨 Stack trace:');
            console.trace();
        }
        return originalStatus.call(this, statusCode);
    };
    
    next();
};

module.exports = interceptor403;
