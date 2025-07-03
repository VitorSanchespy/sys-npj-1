const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validate } = require('../middleware/validationMiddleware');

router.post('/registrar', [
  validate('registrarUsuario')
], authController.registrar);

router.post('/login', [
  validate('loginUsuario')
], authController.login);

router.get('/perfil', authController.perfil);

module.exports = router;