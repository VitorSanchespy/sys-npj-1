// Middleware para garantir encoding UTF-8 correto
const encodingMiddleware = (req, res, next) => {
  // Configurar headers para UTF-8
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  // Função para corrigir encoding em strings
  const charFixMap = {
    'Ã§': 'ç', 'Ã£': 'ã', 'Ã¡': 'á', 'Ã©': 'é', 'Ã­': 'í', 'Ã³': 'ó', 'Ãº': 'ú',
    'Ã¢': 'â', 'Ãª': 'ê', 'Ã´': 'ô', 'Ã ': 'à', 'Ã¨': 'è', 'Ã¬': 'ì', 'Ã²': 'ò',
    'Ã¹': 'ù', 'Ã…': 'Å', 'Ã‡': 'Ç'
  };
  
  function fixEncoding(obj) {
    if (typeof obj === 'string') {
      let fixed = obj;
      for (const [wrong, correct] of Object.entries(charFixMap)) {
        fixed = fixed.replace(new RegExp(wrong, 'g'), correct);
      }
      return fixed;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(fixEncoding);
    }
    
    if (obj && typeof obj === 'object') {
      const fixed = {};
      for (const [key, value] of Object.entries(obj)) {
        fixed[key] = fixEncoding(value);
      }
      return fixed;
    }
    
    return obj;
  }
  
  // Interceptar response JSON para corrigir encoding
  const originalJson = res.json;
  res.json = function(data) {
    const fixedData = fixEncoding(data);
    return originalJson.call(this, fixedData);
  };
  
  // Corrigir dados do body se existirem
  if (req.body) {
    req.body = fixEncoding(req.body);
  }
  
  next();
};

module.exports = encodingMiddleware;