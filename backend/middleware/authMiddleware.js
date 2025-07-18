const jwt = require('jsonwebtoken');
const db = require('../config/config');
require('dotenv').config();

const verificarToken = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({ erro: 'Acesso negado. Token não fornecido.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const usuario = await db('usuarios')
            .join('roles', 'usuarios.role_id', 'roles.id')
            .where('usuarios.id', decoded.id)
            .where('usuarios.ativo', true)
            .select('usuarios.id', 'usuarios.nome', 'usuarios.email', 'roles.nome as role')
            .first();

        if (!usuario) {
            return res.status(401).json({ erro: 'Token inválido. Usuário não encontrado ou inativo.' });
        }        
        req.usuario = usuario;
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ erro: "Token expirado." });
        }
        res.status(401).json({ erro: "Token inválido." });
    }
};

module.exports = verificarToken;