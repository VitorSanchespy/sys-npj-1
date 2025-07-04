const Usuario = require('../models/userModels');

exports.criarUsuario = async (req, res) => {
    try {
        const { nome, email, senha, role_id } = req.body;
        const id = await Usuario.criar({ nome, email, senha, role_id });
        res.status(201).json({ id, mensagem: 'Usuário criado com sucesso' });
    } catch (error) {
        console.error('Erro ao criar usuário:', error);
        res.status(500).json({ erro: 'Erro interno do servidor' });
    }
};

exports.listarUsuarios = async (req, res) => {
    try {
        const usuarios = await Usuario.buscarTodos();
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
    const alunos = await Usuario.listarPorRole('aluno'); 
    res.json(alunos);
  } catch (error) {
    console.error('Erro ao listar alunos:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};