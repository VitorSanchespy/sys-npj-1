// Rotas de Autenticação
const express = require('express');
const router = express.Router();
const authController = require('../controllers/autorizacaoControllers');
const { validate, handleValidation } = require('../middleware/validationMiddleware');
const verificarToken = require('../middleware/authMiddleware');

// POST /auth/login - Login de usuário
router.post('/login', authController.login);

// POST /auth/registro - Registro de novo usuário
router.post('/registro', authController.registro);

// GET /auth/perfil - Perfil do usuário autenticado
router.get('/perfil', verificarToken, (req, res) => {
  res.json({
    id: req.usuario.id,
    nome: req.usuario.nome,
    email: req.usuario.email,
    role: req.usuario.role
  });
});

// POST /auth/refresh - Refresh token
router.post('/refresh', authController.refreshToken);

module.exports = router;
