const db = require('../config/db');
const { gerarHash } = require('../utils/authUtils');

class Usuario {
    // Busca paginada apenas por nome
    static async buscarTodosPaginado({ search = "", page = 1, pageSize = 20 }) {
        const query = db('usuarios')
            .join('roles', 'usuarios.role_id', 'roles.id')
            .where(function() {
                this.where('usuarios.ativo', true).orWhere('usuarios.ativo', 1);
            });

        if (search) {
            // Busca flexível: ignora maiúsculas/minúsculas e acentuação
            // Usando COLLATE utf8_general_ci para MySQL
            query.andWhereRaw(`usuarios.nome COLLATE utf8_general_ci LIKE ?`, [`%${search}%`]);
        }

        return query
            .select(
                'usuarios.id',
                'usuarios.nome',
                'usuarios.email',
                'usuarios.criado_em',
                'roles.nome as role'
            )
            .limit(pageSize)
            .offset((page - 1) * pageSize);
    }

    static async buscarAlunosPaginado({ search = "", page = 1, pageSize = 20 }) {
        const query = db('usuarios')
            .join('roles', 'usuarios.role_id', 'roles.id')
            .where('roles.nome', 'Aluno')
            .where(function() {
                this.where('usuarios.ativo', true).orWhere('usuarios.ativo', 1);
            });

        if (search) {
            query.andWhereRaw(`usuarios.nome COLLATE utf8_general_ci LIKE ?`, [`%${search}%`]);
        }

        return query
            .select(
                'usuarios.id',
                'usuarios.nome',
                'usuarios.email',
                'usuarios.criado_em',
                'roles.nome as role'
            )
            .limit(pageSize)
            .offset((page - 1) * pageSize);
    }
    static async buscarAlunosPorNome(nome) {
        return db('usuarios')
            .join('roles', 'usuarios.role_id', 'roles.id')
            .where('roles.nome', 'Aluno')
            .where(function() {
                this.where('usuarios.ativo', true).orWhere('usuarios.ativo', 1);
            })
            .whereRaw(`usuarios.nome COLLATE utf8_general_ci LIKE ?`, [`%${nome}%`])
            .select('usuarios.id', 'usuarios.nome', 'usuarios.email');
    }
    static async criar({ nome, email, senha, role_id }) {
        const senhaHash = await gerarHash(senha);
        const [id] = await db('usuarios').insert({
            nome,
            email,
            senha: senhaHash,
            role_id,
            ativo: true
        });
        return id;
    }

    static async buscarTodos() {
          return db('usuarios')
            .join('roles', 'usuarios.role_id', 'roles.id')
            .where(function() {
                this.where('usuarios.ativo', true).orWhere('usuarios.ativo', 1);
            })
            .select('usuarios.id', 'usuarios.nome', 'usuarios.email', 'usuarios.criado_em', 'roles.nome as role');
    }

    static async buscarPorId(id) {
        return db('usuarios')
            .join('roles', 'usuarios.role_id', 'roles.id')
            .where('usuarios.id', id)
            .where(function() {
                this.where('usuarios.ativo', true).orWhere('usuarios.ativo', 1);
            })
            .select('usuarios.id', 'usuarios.nome', 'usuarios.email', 'usuarios.criado_em', 'roles.nome as role')
            .first();
    }

    static async buscarPorEmail(email) {
         return db('usuarios')
            .join('roles', 'usuarios.role_id', 'roles.id')
            .where('usuarios.email', email)
            .where(function() {
                this.where('usuarios.ativo', true).orWhere('usuarios.ativo', 1);
            })
            .select('usuarios.*', 'roles.nome as role')
            .first();
    }

    static async atualizar(id, { nome, email, role_id }) {
       return db('usuarios')
            .where('id', id)
            .update({ nome, email, role_id });
    }

    static async reativar(id) {
        return db('usuarios')
            .where('id', id)
            .update({ ativo: 1 }); // 1 para ativo
    }

    static async atualizarSenha(id, senha) {
        const senhaHash = await gerarHash(senha);
        return db('usuarios')
            .where('id', id)
            .update({ senha: senhaHash });
    }

    static async listarPorRole(roleName) {
        return db('usuarios')
            .join('roles', 'usuarios.role_id', 'roles.id')
            .where('roles.nome', roleName)
            .where('usuarios.ativo', true)
            .select('usuarios.id', 'usuarios.nome', 'usuarios.email');
    }

    static async deletar(id) {
        // Soft delete
        return db('usuarios')
            .where('id', id)
            .update({ ativo: 0 }); // 0 para inativo
    }

    static async usuarioCompleto(id) { 
    return db('usuarios')
      .join('roles', 'usuarios.role_id', 'roles.id')
      .where('usuarios.id', id)
      .select('usuarios.*', 'roles.nome as role')
      .first();
    }
}

module.exports = Usuario;