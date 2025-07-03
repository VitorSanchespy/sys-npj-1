const Usuario = require('../models/userModels');
const db = require('../config/db');
const { compararSenhas, gerarToken } = require('../utils/authUtils');

class AuthController {
    async registrar(req, res) {
        try {
            const { nome, email, senha, role } = req.body;
            
            // Verificar se o role existe
            const [roleRows] = await db.promise().query('SELECT id FROM roles WHERE nome = ?', [role]);
            if (!roleRows.length) {
                return res.status(400).json({ erro: 'Perfil de usuário inválido' });
            }
            
            const role_id = roleRows[0].id;
            const usuarioId = await Usuario.criar({ nome, email, senha, role_id });
            
            res.status(201).json({ id: usuarioId });
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ erro: 'Email já está em uso' });
            }
            res.status(500).json({ erro: error.message });
        }
    }

    async login(req, res) {
        try {
            const { email, senha } = req.body;
            
            const usuario = await Usuario.buscarPorEmail(email);
            if (!usuario) {
                return res.status(401).json({ erro: 'Credenciais inválidas' });
            }
            
            const senhaValida = await compararSenhas(senha, usuario.senha);
            if (!senhaValida) {
                return res.status(401).json({ erro: 'Credenciais inválidas' });
            }
            
            const token = gerarToken({
                id: usuario.id,
                email: usuario.email,
                role: usuario.role
            });
            
            res.json({ 
                token,
                usuario: {
                    id: usuario.id,
                    nome: usuario.nome,
                    email: usuario.email,
                    role: usuario.role
                }
            });
        } catch (error) {
            res.status(500).json({ erro: error.message });
        }
    }

    async perfil(req, res) {
        try {
            const usuario = await Usuario.buscarPorId(req.usuario.id);
            res.json(usuario);
        } catch (error) {
            res.status(500).json({ erro: error.message });
        }
    }
}

module.exports = new AuthController();