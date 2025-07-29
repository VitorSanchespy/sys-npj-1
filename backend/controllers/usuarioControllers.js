// Controlador de Usuários
const { usuariosModels: Usuario, rolesModels: Role } = require('../models/indexModels.js');
const bcrypt = require('bcrypt');

// Lista usuários ativos
// Lista usuários ativos
exports.listarUsuarios = async (req, res) => {
  try {
    // Buscar apenas usuários ativos com suas roles
    const usuarios = await Usuario.findAll({
      where: { ativo: true },
      include: [{ model: Role, as: 'role' }]
    });
    res.json(usuarios);
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Cria novo usuário
// Cria novo usuário
exports.criarUsuario = async (req, res) => {
  try {
    const { nome, email, senha, role_id } = req.body;
    
    const senhaHash = await bcrypt.hash(senha, 10);
    
    const usuario = await Usuario.create({
      nome,
      email,
      senha: senhaHash,
      role_id,
      ativo: true
    });
    
    res.status(201).json({ id: usuario.id, nome, email, role_id });
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Atualiza usuário
// Atualiza usuário
exports.atualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, role_id, ativo } = req.body;
    
    // Verificar se usuário existe
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }
    
    // Atualizar dados do usuário
    await usuario.update({ nome, email, role_id, ativo });
    res.json({ mensagem: 'Usuário atualizado' });
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Desativa usuário
// Desativa usuário
exports.excluirUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await Usuario.findByPk(id);
    
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }
    
    // Desativar usuário em vez de excluir
    await usuario.update({ ativo: false });
    res.json({ mensagem: 'Usuário desativado' });
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Busca usuário por ID
// Busca usuário por ID
exports.buscarUsuarioPorId = async (req, res) => {
  try {
    // Buscar usuário por ID com role incluída
    const usuario = await Usuario.findByPk(req.params.id, {
      include: [{ model: Role, as: 'role' }]
    });
    
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }
    
    res.json(usuario);
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Obtém perfil do usuário logado
// Obtém perfil do usuário logado
exports.obterPerfil = async (req, res) => {
  try {
    // Buscar perfil do usuário autenticado
    const usuario = await Usuario.findByPk(req.usuario.id, {
      include: [{ model: Role, as: 'role' }]
    });
    res.json(usuario);
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Aliases para compatibilidade com código existente
exports.listarUsuariosDebug = exports.listarUsuarios;
exports.listarUsuariosParaVinculacao = exports.listarUsuarios;



// ROTAS
const express = require('express');
const router = express.Router();
const roleMiddleware = require('../middleware/roleMiddleware.js'); // Novo middleware para roles
const authMiddleware = require('../middleware/authMiddleware');
const { validate, handleValidation, } = require('../middleware/validationMiddleware'); // Middleware de validação
// Importando os controladores de usuário
const { listarUsuarios, criarUsuarios, listarUsuariosPorRole, buscarUsuariosPorId,
atualizarUsuarios, reativarUsuarios, softDeleteUsuarios, 
listarUsuariosDebug, listarUsuariosParaVinculacao, perfilUsuario,
atualizarSenhaUsuarios, atualizarPerfilProprio} = require('../controllers/usuarioControllers.js');

// Aplicar middleware de autenticação a todas as rotas
router.use(authMiddleware);

// Endpoint temporário para depuração
router.get('/debug/all', listarUsuariosDebug);


// Rotas de perfil do usuário autenticado (devem vir antes das rotas com :id)
router.get('/me', perfilUsuario);
router.put('/me', atualizarPerfilProprio);
router.put('/me/senha', atualizarSenhaUsuarios);
router.delete('/me', softDeleteUsuarios);

// Soft delete usuário (padrão REST)
router.delete('/:id', [
  roleMiddleware(['Professor', 'Admin']),
  softDeleteUsuarios
]);

// Reativar usuário
router.put('/:id/reativar', [
  roleMiddleware(['Admin', 'Professor']),
  reativarUsuarios
]);

//listar paginação de usuários
router.get('/pagina', roleMiddleware(['Admin']), listarUsuarios);

// Contar total de usuários (para dashboard)
router.get('/count', roleMiddleware(['Admin']), async (req, res) => {
  try {
    const db = require('../config/sequelize');
    
    // Contar usuários totais
    const [totalResult] = await db.query('SELECT COUNT(*) as total FROM usuarios WHERE ativo = true');
    
    // Contar usuários por tipo
    const [porTipoResult] = await db.query(`
      SELECT r.nome_role as tipo, COUNT(u.id) as quantidade
      FROM usuarios u 
      JOIN roles r ON u.role_id = r.id 
      WHERE u.ativo = true 
      GROUP BY r.nome_role
    `);
    
    const usuariosPorTipo = {};
    porTipoResult.forEach(item => {
      usuariosPorTipo[item.tipo.toLowerCase()] = parseInt(item.quantidade);
    });
    
    res.json({ 
      total: parseInt(totalResult[0].total),
      porTipo: usuariosPorTipo
    });
  } catch (error) {
    console.error('Erro ao contar usuários:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Lista todos os usuários (para admin) ou apenas alunos (para professor)
router.get('/', roleMiddleware(['Admin', 'Professor']), (req, res, next) => {
  if (req.user && req.user.role_id === 3) { // Professor
    req.params.roleName = 'Aluno';
    return listarUsuariosPorRole(req, res, next);
  }
  return listarUsuarios(req, res, next);
});

// Lista apenas alunos (para professor)
router.get('/alunos', roleMiddleware(['Professor', 'Admin']), (req, res) => {
  req.params.roleName = 'Aluno';
  return listarUsuariosPorRole(req, res);
});

// lista usuários para vinculação ao processo
router.get('/vincular', roleMiddleware(['Professor', 'Admin']), listarUsuariosParaVinculacao);

// listar usuários por role
router.get('/role/:roleName', roleMiddleware(['Professor', 'Admin']), listarUsuariosPorRole);

// buscar usuário por ID
router.get(
  '/:id',
  validate('getUsuario'),
  handleValidation,
  buscarUsuariosPorId
);

// atualizar usuário
router.put(
  '/:id',
  validate('updateUsuario'),
  handleValidation,
  atualizarUsuarios
);

// criar novo usuário
router.post(
  '/',
  roleMiddleware(['Admin', 'Professor']),
  validate('registrarUsuario'),
  handleValidation,
  criarUsuarios
);

// atualizar senha do usuário
router.put('/:id/senha', [
  validate('updateSenha'),
  handleValidation,
  atualizarSenhaUsuarios
]);


module.exports = router;