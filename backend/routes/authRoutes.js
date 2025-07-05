const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validate,  handleValidation } = require('../middleware/validationMiddleware');
const verificarToken = require('../middleware/authMiddleware');

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

/**
 * @swagger
 * /auth/perfil:
 *   get:
 *     summary: Retorna dados do usuário logado
 *     tags: [Auth]
 */
router.get('/perfil', verificarToken, authController.perfil);

module.exports = router;