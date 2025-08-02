const express = require('express');
const router = express.Router();
const autorizacaoController = require('../controllers/autorizacaoControllers');
const authMiddleware = require('../middleware/authMiddleware');
const { validarUsuarioDuplicado } = require('../middleware/antiDuplicacaoMiddleware');

/**
 * @route POST /auth/login
 * @desc Login de usuário
 * @access Público
 */
router.post('/login', autorizacaoController.login);

/**
 * @route POST /auth/registro
 * @desc Registro de novo usuário
 * @access Público
 */
router.post('/registro', validarUsuarioDuplicado, autorizacaoController.registro);

/**
 * @route POST /auth/refresh-token
 * @desc Renovar token de acesso
 * @access Público
 */
router.post('/refresh-token', autorizacaoController.refreshToken);

/**
 * @route GET /auth/perfil
 * @desc Obter perfil do usuário logado
 * @access Privado (requer token)
 */
router.get('/perfil', authMiddleware, autorizacaoController.perfil);

/**
 * @route POST /auth/esqueci-senha
 * @desc Solicitar recuperação de senha
 * @access Público
 */
router.post('/esqueci-senha', autorizacaoController.esqueciSenha);

/**
 * @route POST /auth/logout
 * @desc Logout do usuário
 * @access Privado (requer token)
 */
router.post('/logout', authMiddleware, (req, res) => {
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
 * @route GET /auth/verificar-token
 * @desc Verificar se o token é válido
 * @access Privado (requer token)
 */
router.get('/verificar-token', authMiddleware, (req, res) => {
  try {
    res.json({ 
      valido: true, 
      usuario: {
        id: req.user.id,
        nome: req.user.nome,
        email: req.user.email,
        role: req.user.role
      }
    });
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

module.exports = router;