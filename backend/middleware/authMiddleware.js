const jwt = require('jsonwebtoken');
require('dotenv').config();
const { usuariosModels: Usuario, rolesModels: Role } = require('../models/indexModels');

const verificarToken = async (req, res, next) => {
    if (req.method === 'OPTIONS') return next();
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log('[authMiddleware] Token recebido:', token, '| Tipo:', typeof token);
    if (!token) {
        console.warn('[authMiddleware] Nenhum token fornecido');
        return res.status(401).json({ erro: 'Acesso negado. Token não fornecido.' });
    }
    if (typeof token !== 'string') {
        console.error('[authMiddleware] Token não é uma string! Tipo:', typeof token, '| Valor:', token);
        return res.status(401).json({ erro: 'Token malformado: não é uma string.' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('[authMiddleware] Token decodificado:', decoded);
        const usuario = await Usuario.findOne({
            where: { id: decoded.id, ativo: true },
            include: [{ model: Role, as: 'role' }],
            attributes: ['id', 'nome', 'email', 'role_id']
        });
        if (!usuario) {
            console.warn('[authMiddleware] Usuário não encontrado ou inativo para o token:', decoded.id);
            return res.status(401).json({ erro: 'Token inválido. Usuário não encontrado ou inativo.' });
        }
        req.usuario = {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            role: usuario.role?.nome || usuario.role_id
        };
        next();
    } catch (error) {
        console.error('[authMiddleware] Erro ao validar token:', error);
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ erro: "Token expirado." });
        }
        res.status(401).json({ erro: "Token inválido." });
    }
};

module.exports = verificarToken;