const jwt = require('jsonwebtoken');
require('dotenv').config();

// Verificar se o banco está disponível
let dbAvailable = false;
let mockData = null;

try {
  const sequelize = require('../utils/sequelize');
  sequelize.authenticate().then(() => {
    dbAvailable = true;
    console.log('✅ AuthMiddleware conectado ao banco');
  }).catch(() => {
    dbAvailable = false;
    console.log('⚠️ AuthMiddleware usando modo mock');
    mockData = require('../utils/mockData');
  });
} catch (error) {
  console.log('⚠️ AuthMiddleware: Banco não disponível, usando dados mock');
  mockData = require('../utils/mockData');
  dbAvailable = false;
}

// Se não conseguiu carregar mockData, criar dados padrão
if (!mockData) {
  mockData = require('../utils/mockData');
}

const verificarToken = async (req, res, next) => {
    if (req.method === 'OPTIONS') return next();
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({ erro: 'Acesso negado. Token não fornecido.' });
    }
    
    if (typeof token !== 'string') {
        return res.status(401).json({ erro: 'Token malformado: não é uma string.' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        let usuario = null;
        
        if (!dbAvailable) {
            // Usar dados mock
            usuario = mockData.usuarios.find(u => u.id === decoded.userId && u.ativo);
            if (usuario) {
                usuario.role = { nome: usuario.role };
            }
        } else {
            // Usar banco de dados real
            const { usuariosModels: Usuario, rolesModels: Role } = require('../models/indexModels');
            usuario = await Usuario.findOne({
                where: { id: decoded.userId, ativo: [true, 1] },
                include: [{ model: Role, as: 'role' }],
                attributes: ['id', 'nome', 'email', 'role_id']
            });
        }
        
        if (!usuario) {
            return res.status(401).json({ erro: 'Token inválido. Usuário não encontrado ou inativo.' });
        }
        
        req.user = {
            userId: usuario.id,
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            role: usuario.role?.nome || 'user'
        };
        
        req.usuario = req.user; // Compatibilidade
        
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ erro: 'Token expirado.' });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ erro: 'Token inválido.' });
        }
        console.error('❌ Erro na verificação do token:', error);
        return res.status(500).json({ erro: 'Erro interno do servidor.' });
    }
};

module.exports = verificarToken;
