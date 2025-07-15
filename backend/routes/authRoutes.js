const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validate,  handleValidation } = require('../middleware/validationMiddleware');
const verificarToken = require('../middleware/authMiddleware');
const verificarTokenReset = require('../middleware/resetPasswordMiddleware');

/**
 * @swagger
 * /auth/registrar:
 *   post:
 *     summary: Registra um novo usuário
 *     tags: [Auth]
 */
router.post('/registrar', [
  validate('registrarUsuario'),
  handleValidation
], authController.registrar);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login do usuário
 *     tags: [Auth]
 */
router.post('/login', [
  validate('loginUsuario'),
  handleValidation
], authController.login);

// Compatível com frontend: POST /auth/esqueci-senha
router.post('/esqueci-senha', authController.solicitarRecuperacao);
router.post('/solicitar-recuperacao', authController.solicitarRecuperacao);
router.post('/redefinir-senha', verificarTokenReset, authController.redefinirSenha);

/**
 * @swagger
 * /auth/perfil:
 *   get:
 *     summary: Retorna dados do usuário logado
 *     tags: [Auth]
 */
router.get('/perfil', verificarToken, authController.perfil);

module.exports = router;