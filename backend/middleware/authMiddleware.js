const jwt = require('jsonwebtoken');
const db = require('../config/db');

const verificarToken = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({ erro: 'Acesso negado. Token não fornecido.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Verificar se o usuário ainda existe no banco de dados
        const [rows] = await db.promise().query(
            `SELECT u.id, u.nome, u.email, r.nome as role 
             FROM usuarios u
             JOIN roles r ON u.role_id = r.id
             WHERE u.id = ?`,
            [decoded.id]
        );

        if (!rows.length) {
            return res.status(401).json({ erro: 'Token inválido. Usuário não encontrado.' });
        }

        req.usuario = rows[0];
        next();
    } catch (error) {
        res.status(400).json({ erro: 'Token inválido.' });
    }
};

module.exports = verificarToken;