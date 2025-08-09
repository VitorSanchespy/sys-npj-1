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
    
    if (isDbAvailable()) {
      // Usar banco de dados
      try {
        const { usuarioModel: Usuario, roleModel: Role } = require('../models/indexModel');
        usuario = await Usuario.findByPk(decoded.id, {
          include: [{ model: Role, as: 'role' }]
        });
        
        if (usuario && usuario.role) {
          usuario.role = usuario.role.nome;
        }
      } catch (dbError) {
        console.log('⚠️ Erro no banco:', dbError.message);
        global.dbAvailable = false;
        return res.status(503).json({ erro: 'Banco de dados não disponível' });
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
      role: usuario.role
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
