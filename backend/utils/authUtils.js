const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const saltRounds = 10;

async function gerarHash(senha) {
    return bcrypt.hash(senha, saltRounds);
}

async function verificarSenha(senha, hash) {
    return bcrypt.compare(senha, hash);
}

function gerarToken(usuario) {
    return jwt.sign(
        { id: usuario.id, role: usuario.role_id },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
}

function verificarToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = {
    gerarHash,
    verificarSenha,
    gerarToken,
    verificarToken
};