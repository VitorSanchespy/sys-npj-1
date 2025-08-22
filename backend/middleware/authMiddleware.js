const jwt = require('jsonwebtoken');

// Função utilitária para verificar disponibilidade do banco
function isDbAvailable() {
  return global.dbAvailable || false;
}

const authMiddleware = async (req, res, next) => {
  try {
    // Permitir OPTIONS requests
    if (req.method === 'OPTIONS') {
      return next();
    }
    
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ erro: 'Token de acesso requerido' });
    }
    
    // Verificar e decodificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'seuSegredoSuperSecreto4321');
    
    let usuario = null;
    
    // Primeiro, usar dados do token como fallback
    if (decoded.role) {
      usuario = {
        id: decoded.id,
        nome: decoded.nome || 'Usuario',
        email: decoded.email,
        role: decoded.role,
        role_id: decoded.role_id,
        ativo: true
      };
    }
    
    if (isDbAvailable()) {
      // Tentar usar banco de dados
      try {
        const { usuarioModel: Usuario, roleModel: Role } = require('../models/indexModel');
        const usuarioDb = await Usuario.findByPk(decoded.id, {
          include: [{ model: Role, as: 'role' }]
        });
        
        if (usuarioDb && usuarioDb.role) {
          usuario = {
            id: usuarioDb.id,
            nome: usuarioDb.nome,
            email: usuarioDb.email,
            role: usuarioDb.role.nome,
            role_id: usuarioDb.role_id,
            ativo: usuarioDb.ativo
          };
        }
      } catch (dbError) {
        console.log('⚠️ Erro no banco, usando token:', dbError.message);
        // Manter dados do token se DB falhar
      }
    }
    
    if (!usuario || !usuario.ativo) {
      return res.status(401).json({ erro: 'Token inválido ou usuário inativo' });
    }
    
    // Adicionar dados do usuário à requisição
    req.user = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      role: usuario.role,
      role_id: usuario.role_id
    };
    
    next();
    
  } catch (error) {
    console.error('Erro na autenticação:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ erro: 'Token expirado' });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ erro: 'Token inválido' });
    }
    
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

module.exports = authMiddleware;
