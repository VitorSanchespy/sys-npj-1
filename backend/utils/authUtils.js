const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Configurações de segurança
const saltRounds = 12; 
const TOKEN_EXPIRATION = '6h'; 
const JWT_ALGORITHM = 'HS256'; 

async function gerarHash(senha) {
    try {
        return await bcrypt.hash(senha, saltRounds);
    } catch (error) {
        console.error('Erro ao gerar hash:', error);
        throw new Error('Falha ao processar senha');
    }
}

async function verificarSenha(senha, hash) {
    try {
        return await bcrypt.compare(senha, hash);
    } catch (error) {
        console.error('Erro ao verificar senha:', error);
        throw new Error('Falha na autenticação');
    }
}

function gerarToken(usuario) {
    try {
        return jwt.sign(
            {
                id: usuario.id,
                role: usuario.role_id,
                // Adicionado timestamp de emissão
                iat: Math.floor(Date.now() / 1000)
            },
            process.env.JWT_SECRET,
            { 
                expiresIn: TOKEN_EXPIRATION,
                algorithm: JWT_ALGORITHM
            }
        );
    } catch (error) {
        console.error('Erro ao gerar token:', error);
        throw new Error('Falha ao gerar token de acesso');
    }
}

function verificarToken(token) {
    try {
        return jwt.verify(token, process.env.JWT_SECRET, {
            algorithms: [JWT_ALGORITHM]
        });
    } catch (error) {
        console.error('Erro ao verificar token:', error);
        // Diferenciar tipos de erros (expirado, inválido, etc)
        if (error.name === 'TokenExpiredError') {
            throw new Error('Token expirado');
        }
        throw new Error('Token inválido');
    }
}

module.exports = {
    gerarHash,
    verificarSenha,
    gerarToken,
    verificarToken
};