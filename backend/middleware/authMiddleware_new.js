const jwt = require('jsonwebtoken');

// Função utilitária para verificar disponibilidade do banco
function isDbAvailable() {
  return global.dbAvailable || false;
}

// Dados mock para desenvolvimento
const getMockData = () => {
  try {
    return require('../utils/mockData');
  } catch (error) {
    return {
      usuarios: [
        {
          id: 1,
          nome: 'Admin Sistema',
          email: 'admin@teste.com',
          role: 'Admin',
          ativo: true
        },
        {
          id: 2,
          nome: 'Professor Teste',
          email: 'professor@teste.com',
          role: 'Professor',
          ativo: true
        },
        {
          id: 3,
          nome: 'Aluno Teste',
          email: 'aluno@teste.com',
          role: 'Aluno',
          ativo: true
        }
      ]
    };
  }
};

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
        const { usuariosModels: Usuario, rolesModels: Role } = require('../models/indexModels');
        usuario = await Usuario.findByPk(decoded.id, {
          include: [{ model: Role, as: 'role' }]
        });
        
        if (usuario && usuario.role) {
          usuario.role = usuario.role.nome;
        }
      } catch (dbError) {
        console.log('⚠️ Erro no banco, usando mock:', dbError.message);
        global.dbAvailable = false;
      }
    }
    
    if (!usuario) {
      // Usar dados mock
      const mockData = getMockData();
      usuario = mockData.usuarios.find(u => u.id === decoded.id && u.ativo);
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
