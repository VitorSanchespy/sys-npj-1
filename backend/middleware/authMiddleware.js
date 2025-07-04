const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

const verificarToken = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({ erro: 'Acesso negado. Token não fornecido.' });
    }

    try {
        // 1️⃣ Verifica token (incluindo expiração)
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Token decodificado:", decoded); // Debug

        // 2️⃣ Busca usuário no banco
        const [rows] = await db.query(
            `SELECT u.id, u.nome, u.email, r.nome as role 
            FROM usuarios u
            JOIN roles r ON u.role_id = r.id
            WHERE u.id = ?`,
            [decoded.id]
        );

        if (!rows.length) {
            console.error("Usuário não encontrado para ID:", decoded.id); // Debug
            return res.status(401).json({ erro: 'Token inválido. Usuário não encontrado.' });
        }
        // 3️⃣ Anexa usuário à requisição
        req.usuario = {
            id: rows[0].id,
            nome: rows[0].nome,
            email: rows[0].email,
            role: rows[0].role  
        };
        next();
    } catch (error) {
        console.error("Erro na verificação do token:", error.message); // Debug
        
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ erro: "Token expirado." });
        }
        
        res.status(401).json({ erro: "Token inválido." });
    }
};

module.exports = verificarToken;