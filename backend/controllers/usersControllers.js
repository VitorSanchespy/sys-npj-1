// Endpoint temporário para depuração: lista todos os usuários e todos os campos
exports.listarUsuariosDebug = async (req, res) => {
    try {
        const usuarios = await require('../config/db')('usuarios').select('*');
        res.json(usuarios);
    } catch (error) {
        console.error('Erro ao listar usuários (debug):', error);
        res.status(500).json({ erro: 'Erro interno do servidor' });
    }
};
// Reativar usuário: marca ativo = 1
exports.reactivateUsuario = async (req, res) => {
    try {
        const id = req.params.id;
        await Usuario.reativar(id); // seta ativo = 1
        res.json({ mensagem: 'Usuário reativado com sucesso.' });
    } catch (error) {
        console.error('Erro ao reativar usuário:', error);
        res.status(500).json({ erro: 'Erro interno do servidor' });
    }
};
const Usuario = require('../models/userModels');

exports.criarUsuario = async (req, res) => {
    try {
        const { nome, email, senha, role_id } = req.body;
        // Busca o papel pelo id
        let roleNome = 'Aluno';
        if (role_id === 1) roleNome = 'Admin';
        if (role_id === 2) roleNome = 'Aluno';
        if (role_id === 3) roleNome = 'Professor';

        // Permissões:
        // - Não autenticado: só pode criar Aluno
        // - Professor: só pode criar Aluno ou Professor
        // - Admin: pode criar qualquer um
        const usuarioLogado = req.usuario;
        if (!usuarioLogado) {
            if (roleNome !== 'Aluno') {
                return res.status(403).json({ erro: 'Só é permitido criar conta de Aluno.' });
            }
        } else if (usuarioLogado.role === 'Professor') {
            if (roleNome === 'Admin') {
                return res.status(403).json({ erro: 'Professores não podem criar Admins.' });
            }
        } // Admin pode tudo

        const id = await Usuario.criar({ nome, email, senha, role_id });
        res.status(201).json({ id, mensagem: 'Usuário criado com sucesso' });
    } catch (error) {
        console.error('Erro ao criar usuário:', error);
        res.status(500).json({ erro: 'Erro interno do servidor' });
    }
};

exports.listarUsuarios = async (req, res) => {
    try {
        const { search = "", page = 1 } = req.query;
        const usuarios = await Usuario.buscarTodosPaginado({ search, page: Number(page) });
        res.json(usuarios);
    } catch (error) {
        console.error('Erro ao listar usuários:', error);
        res.status(500).json({ erro: 'Erro interno do servidor' });
    }
};

exports.buscarUsuarioPorId = async (req, res) => {
    try {
        const usuario = await Usuario.buscarPorId(req.params.id);
        if (!usuario) {
            return res.status(404).json({ erro: 'Usuário não encontrado' });
        }
        res.json(usuario);
    } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        res.status(500).json({ erro: 'Erro interno do servidor' });
    }
};

exports.atualizarUsuario = async (req, res) => {
    try {
        const { nome, email, role_id } = req.body;
        await Usuario.atualizar(req.params.id, { nome, email, role_id });
        res.json({ mensagem: 'Usuário atualizado com sucesso' });
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        res.status(500).json({ erro: 'Erro interno do servidor' });
    }
};

exports.atualizarSenha = async (req, res) => {
    try {
        const { senha } = req.body;
        await Usuario.atualizarSenha(req.params.id, senha);
        res.json({ mensagem: 'Senha atualizada com sucesso' });
    } catch (error) {
        console.error('Erro ao atualizar senha:', error);
        res.status(500).json({ erro: 'Erro interno do servidor' });
    }
};

exports.deletarUsuario = async (req, res) => {
    try {
        const usuario = await Usuario.buscarPorId(req.params.id);
        if (!usuario) {
            return res.status(404).json({ erro: 'Usuário não encontrado' });
        }
        await Usuario.deletar(req.params.id);
        res.json({ mensagem: 'Usuário deletado com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar usuário:', error);
        res.status(500).json({ erro: 'Erro interno do servidor' });
    }
};
// Soft delete: inativa o usuário
exports.softDeleteUsuario = async (req, res) => {
    try {
        const id = req.params.id;
        await Usuario.deletar(id); // seta ativo = 0
        res.json({ mensagem: 'Usuário inativado com sucesso.' });
    } catch (error) {
        console.error('Erro ao inativar usuário:', error);
        res.status(500).json({ erro: 'Erro interno do servidor' });
    }
};

exports.reativarUsuario = async (req, res) => {
    try {
        const usuario = await Usuario.buscarPorId(req.params.id);
        if (!usuario) {
            return res.status(404).json({ erro: 'Usuário não encontrado' });
        }
        // Se o usuário já estiver ativo, retorne um aviso
        if (usuario.ativo) {
            return res.status(400).json({ erro: 'Usuário já está ativo' });
        }
        
        await Usuario.reativar(req.params.id);
        res.json({ mensagem: 'Usuário reativado com sucesso', usuario });
    } catch (error) {
        console.error('Erro ao reativar usuário:', error);
        res.status(500).json({ erro: 'Erro interno do servidor' });
    }
};

exports.listarPorRole = async (req, res) => {
    try {
        const usuarios = await Usuario.listarPorRole(req.params.roleName);
        res.json(usuarios);
    } catch (error) {
        console.error('Erro ao listar usuários por role:', error);
        res.status(500).json({ erro: 'Erro interno do servidor' });
    }
};

exports.listarAlunos = async (req, res) => {
  try {
    const { search = "", page = 1 } = req.query;
    const alunos = await Usuario.buscarAlunosPaginado({ search, page: Number(page) });
    res.json(alunos);
  } catch (error) {
    console.error('Erro ao listar alunos:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

exports.listarAlunosParaAtribuicao = async (req, res) => {
  try {
    if (req.usuario.role !== 'Professor') {
      return res.status(403).json({ erro: 'Acesso permitido apenas para professores' });
    }
    const alunos = await Usuario.listarPorRole('Aluno');
    res.json(alunos);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
};