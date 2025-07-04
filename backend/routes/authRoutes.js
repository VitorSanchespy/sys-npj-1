const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validate,  handleValidation } = require('../middleware/validationMiddleware');
const verificarToken = require('../middleware/authMiddleware');

router.post('/registrar', [
  validate('registrarUsuario'),
  handleValidation
], authController.registrar);

router.post('/login', [
  validate('loginUsuario'),
  handleValidation
], authController.login);

router.get('/perfil', verificarToken, authController.perfil);

module.exports = router;