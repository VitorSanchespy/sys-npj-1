const jwt = require('jsonwebtoken');
require('dotenv').config();
const { usuariosModels: Usuario, rolesModels: Role } = require('../models/indexModels');

const verificarToken = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ erro: 'Acesso negado. Token não fornecido.' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const usuario = await Usuario.findOne({
            where: { id: decoded.id, ativo: true },
            include: [{ model: Role, as: 'role' }],
            attributes: ['id', 'nome', 'email', 'role_id']
        });
        if (!usuario) {
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
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ erro: "Token expirado." });
        }
        res.status(401).json({ erro: "Token inválido." });
    }
};

module.exports = verificarToken;