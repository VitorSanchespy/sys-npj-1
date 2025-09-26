const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../env/main.env') });

// Configurações de segurança
const saltRounds = 12;
const TOKEN_EXPIRATION = process.env.TOKEN_EXPIRATION || '24h';
const REFRESH_TOKEN_EXPIRATION = process.env.REFRESH_TOKEN_EXPIRATION || '7d';
const JWT_ALGORITHM = 'HS256';
const crypto = require('crypto');

async function gerarHash(senha) {
    try {
        return await bcrypt.hash(senha, saltRounds);
    } catch (error) {
        throw new Error('Falha ao processar senha');
    }
}

async function verificarSenha(senha, hash) {
    try {
        return await bcrypt.compare(senha, hash);
    } catch (error) {
        throw new Error('Falha na autenticação');
    }
}


function gerarToken(usuario) {
    try {
        const token = jwt.sign(
            {
                id: usuario.id,
                role: usuario.role,
                iat: Math.floor(Date.now() / 1000)
            },
            process.env.JWT_SECRET,
            {
                expiresIn: TOKEN_EXPIRATION,
                algorithm: JWT_ALGORITHM
            }
        );
        return token;
    } catch (error) {
        throw new Error('Falha ao gerar token de acesso');
    }
}

function gerarRefreshToken(usuario) {
    try {
        if (!usuario || !usuario.id) {
            throw new Error('Usuário inválido para geração de refresh token');
        }
        
        // Gera um token aleatório seguro com mais entropia
        const randomBytes = crypto.randomBytes(64);
        const timestamp = Date.now().toString(36);
        const userSalt = usuario.id.toString(36);
        
        // Combinar diferentes fontes de entropia
        const combined = randomBytes.toString('hex') + timestamp + userSalt;
        
        // Hash final para garantir formato consistente
        const refreshToken = crypto.createHash('sha256').update(combined).digest('hex');
        
        return refreshToken;
    } catch (error) {
        console.error('Erro ao gerar refresh token:', error);
        throw new Error('Falha ao gerar refresh token');
    }
}

function verificarToken(token) {
    try {
        if (!token) {
            throw new Error('Token não fornecido');
        }
        
        // Verificar formato básico do token
        if (typeof token !== 'string' || token.split('.').length !== 3) {
            throw new Error('Formato de token inválido');
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET, {
            algorithms: [JWT_ALGORITHM]
        });
        
        // Validações adicionais do payload
        if (!decoded.id || !decoded.role) {
            throw new Error('Token com payload inválido');
        }
        
        // Verificar se o token não é muito antigo (mais de 30 dias)
        const tokenAge = Date.now() / 1000 - decoded.iat;
        if (tokenAge > 30 * 24 * 60 * 60) { // 30 dias em segundos
            throw new Error('Token muito antigo');
        }
        
        return decoded;
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new Error('Token expirado');
        }
        if (error.name === 'JsonWebTokenError') {
            throw new Error('Token inválido');
        }
        if (error.name === 'NotBeforeError') {
            throw new Error('Token ainda não é válido');
        }
        // Para erros customizados, manter a mensagem original
        throw error;
    }
}

// Função para validar refresh token - MELHORADA com segurança real
async function validarRefreshToken(token, usuario) {
    // Verificar disponibilidade do banco
    function isDbAvailable() {
        return global.dbAvailable || false;
    }
    
    if (!token || !usuario) {
        console.log('❌ Token ou usuário inválido para validação');
        return false;
    }
    
    if (!isDbAvailable()) {
        console.log('⚠️ Banco indisponível, validação básica do refresh token');
        // Validação básica: verificar se não é vazio e tem formato correto
        return token.length >= 64 && /^[a-f0-9]+$/i.test(token);
    }
    
    try {
        const { refreshTokenModel: RefreshToken } = require('../models/indexModel');
        
        // Buscar refresh token no banco
        const storedToken = await RefreshToken.findOne({
            where: { 
                token: token,
                user_id: usuario.id || usuario.usuario_id,
                revoked: false
            }
        });
        
        if (!storedToken) {
            console.log('❌ Refresh token não encontrado no banco');
            return false;
        }
        
        // Verificar se não expirou
        if (new Date() > new Date(storedToken.expires_at)) {
            console.log('❌ Refresh token expirado');
            
            // Marcar como revogado automaticamente
            await storedToken.update({ revoked: true });
            return false;
        }
        
        console.log('✅ Refresh token válido');
        return true;
        
    } catch (error) {
        console.error('❌ Erro na validação do refresh token:', error.message);
        return false;
    }
}

// Função para revogar refresh token - NOVA
async function revogarRefreshToken(token, motivo = 'logout') {
    // Verificar disponibilidade do banco
    function isDbAvailable() {
        return global.dbAvailable || false;
    }
    
    if (!isDbAvailable()) {
        console.log('⚠️ Banco indisponível, não é possível revogar refresh token');
        return false;
    }
    
    try {
        const { refreshTokenModel: RefreshToken } = require('../models/indexModel');
        
        const result = await RefreshToken.update(
            { revoked: true },
            { where: { token: token } }
        );
        
        if (result[0] > 0) {
            console.log(`✅ Refresh token revogado (motivo: ${motivo})`);
            return true;
        } else {
            console.log('⚠️ Refresh token não encontrado para revogação');
            return false;
        }
        
    } catch (error) {
        console.error('❌ Erro ao revogar refresh token:', error.message);
        return false;
    }
}

// Função para limpar refresh tokens expirados - NOVA
async function limparRefreshTokensExpirados() {
    // Verificar disponibilidade do banco
    function isDbAvailable() {
        return global.dbAvailable || false;
    }
    
    if (!isDbAvailable()) {
        return false;
    }
    
    try {
        const { refreshTokenModel: RefreshToken } = require('../models/indexModel');
        const { Op } = require('sequelize');
        
        const deleted = await RefreshToken.destroy({
            where: {
                [Op.or]: [
                    { expires_at: { [Op.lt]: new Date() } },
                    { revoked: true }
                ]
            }
        });
        
        if (deleted > 0) {
            console.log(`🧹 Limpeza: ${deleted} refresh tokens removidos`);
        }
        
        return deleted;
        
    } catch (error) {
        console.error('❌ Erro na limpeza de refresh tokens:', error.message);
        return false;
    }
}

module.exports = {
    gerarHash,
    verificarSenha,
    gerarToken,
    verificarToken,
    gerarRefreshToken,
    validarRefreshToken,
    revogarRefreshToken,
    limparRefreshTokensExpirados
};
