const express = require('express');
const router = express.Router();
const autorizacaoController = require('../controllers/autorizacaoControllers');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * @route POST /api/auth/login
 * @desc Login de usuário
 * @access Público
 */
router.post('/login', autorizacaoController.login);

/**
 * @route POST /api/auth/registro
 * @desc Registro de novo usuário
 * @access Público
 */
router.post('/registro', autorizacaoController.registro);

/**
 * @route POST /api/auth/refresh-token
 * @desc Renovar token de acesso
 * @access Público
 */
router.post('/refresh-token', autorizacaoController.refreshToken);

/**
 * @route GET /api/auth/perfil
 * @desc Obter perfil do usuário logado
 * @access Privado (requer token)
 */
router.get('/perfil', authMiddleware.verificarToken, (req, res) => {
  try {
    // Retorna os dados do usuário que estão no token
    const { id, nome, email, role } = req.usuario;
    res.json({
      id,
      nome,
      email,
      role: role.nome
    });
  } catch (error) {
    console.error('Erro ao obter perfil:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

/**
 * @route POST /api/auth/solicitar-recuperacao
 * @desc Solicitar recuperação de senha
 * @access Público
 */
router.post('/solicitar-recuperacao', (req, res) => {
  try {
    res.status(501).json({ erro: 'Funcionalidade não implementada ainda' });
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

/**
 * @route POST /api/auth/redefinir-senha
 * @desc Redefinir senha com token
 * @access Público
 */
router.post('/redefinir-senha', (req, res) => {
  try {
    res.status(501).json({ erro: 'Funcionalidade não implementada ainda' });
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

/**
 * @route POST /api/auth/logout
 * @desc Logout do usuário
 * @access Privado (requer token)
 */
router.post('/logout', authMiddleware.verificarToken, (req, res) => {
  try {
    // Para logout, apenas retornamos sucesso
    // O frontend deve remover o token do armazenamento local
    res.json({ message: 'Logout realizado com sucesso' });
  } catch (error) {
    console.error('Erro no logout:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

/**
 * @route GET /api/auth/verificar-token
 * @desc Verificar se o token é válido
 * @access Privado (requer token)
 */
router.get('/verificar-token', authMiddleware.verificarToken, (req, res) => {
  try {
    res.json({ 
      valido: true, 
      usuario: {
        id: req.usuario.id,
        nome: req.usuario.nome,
        email: req.usuario.email,
        role: req.usuario.role.nome
      }
    });
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

module.exports = router;