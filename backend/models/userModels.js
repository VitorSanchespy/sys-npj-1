const db = require('../config/db');
const { gerarHash } = require('../utils/authUtils');

class Usuario {
    static async criar({ nome, email, senha, role_id }) {
        const senhaHash = await gerarHash(senha);
        const [result] = await db.promise().query(
            'INSERT INTO usuarios (nome, email, senha, role_id) VALUES (?, ?, ?, ?)',
            [nome, email, senhaHash, role_id]
        );
        return result.insertId;
    }

    static async buscarTodos() {
        const [rows] = await db.promise().query(`
            SELECT u.id, u.nome, u.email, u.criado_em, r.nome as role 
            FROM usuarios u
            JOIN roles r ON u.role_id = r.id
        `);
        return rows;
    }

    static async buscarPorId(id) {
        const [rows] = await db.promise().query(
            `SELECT u.id, u.nome, u.email, u.criado_em, r.nome as role 
             FROM usuarios u
             JOIN roles r ON u.role_id = r.id
             WHERE u.id = ?`,
            [id]
        );
        return rows[0];
    }

    static async buscarPorEmail(email) {
        const [rows] = await db.promise().query(
            `SELECT u.*, r.nome as role 
             FROM usuarios u
             JOIN roles r ON u.role_id = r.id
             WHERE u.email = ?`,
            [email]
        );
        return rows[0];
    }

    static async atualizar(id, { nome, email, role_id }) {
        await db.promise().query(
            'UPDATE usuarios SET nome = ?, email = ?, role_id = ? WHERE id = ?',
            [nome, email, role_id, id]
        );
        return true;
    }

    static async atualizarSenha(id, senha) {
        const senhaHash = await gerarHash(senha);
        await db.promise().query(
            'UPDATE usuarios SET senha = ? WHERE id = ?',
            [senhaHash, id]
        );
        return true;
    }

    static async listarPorRole(roleName) {
        const [rows] = await db.promise().query(
            `SELECT u.id, u.nome, u.email 
             FROM usuarios u
             JOIN roles r ON u.role_id = r.id
             WHERE r.nome = ?`,
            [roleName]
        );
        return rows;
    }

    static async deletar(id) {
        await db.promise().query('DELETE FROM usuarios WHERE id = ?', [id]);
        return true;
    }
}

module.exports = Usuario;