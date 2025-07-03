const express = require('express');
const router = express.Router();
const Usuario = require('../controllers/authController');

/**
 * @route POST /auth/registrar
 * @desc Registrar um novo usuário
 * @access Public
 */
router.post('/registrar', Usuario.registrar);

/**
 * @route POST /auth/login
 * @desc Fazer login no sistema
 * @access Public
 */
router.post('/login', Usuario.login);

/**
 * @route GET /auth/perfil
 * @desc Obter informações do usuário logado
 * @access Private
 */
router.get('/perfil', Usuario.perfil);

module.exports = router;