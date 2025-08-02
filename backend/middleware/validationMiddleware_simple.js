// Middleware de Validação Simplificado

const { check, validationResult } = require('express-validator');

// Função para verificar erros de validação
const checkValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      erro: 'Dados inválidos',
      details: errors.array()
    });
  }
  next();
};

// Validações básicas
const validations = {
  // Autenticação
  login: [
    check('email').isEmail().withMessage('Email inválido').normalizeEmail(),
    check('senha').notEmpty().withMessage('Senha é obrigatória'),
    checkValidationErrors
  ],

  registro: [
    check('nome').isLength({ min: 2 }).withMessage('Nome deve ter pelo menos 2 caracteres').trim(),
    check('email').isEmail().withMessage('Email inválido').normalizeEmail(),
    check('senha').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
    checkValidationErrors
  ],

  // Usuários
  createUser: [
    check('nome').isLength({ min: 2 }).withMessage('Nome é obrigatório').trim(),
    check('email').isEmail().withMessage('Email inválido').normalizeEmail(),
    check('senha').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
    checkValidationErrors
  ],

  updateUser: [
    check('nome').optional().isLength({ min: 2 }).withMessage('Nome deve ter pelo menos 2 caracteres').trim(),
    check('email').optional().isEmail().withMessage('Email inválido').normalizeEmail(),
    checkValidationErrors
  ],

  // Processos
  createProcess: [
    check('numero_processo').notEmpty().withMessage('Número do processo é obrigatório'),
    check('parte_contraria').notEmpty().withMessage('Parte contrária é obrigatória'),
    check('assunto').notEmpty().withMessage('Assunto é obrigatório'),
    checkValidationErrors
  ],

  // Agendamentos
  createAgendamento: [
    check('titulo').notEmpty().withMessage('Título é obrigatório'),
    check('data_agendamento').isISO8601().withMessage('Data deve ser válida'),
    check('hora_inicio').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Hora de início inválida'),
    checkValidationErrors
  ],

  // Notificações
  createNotificacao: [
    check('titulo').notEmpty().withMessage('Título é obrigatório'),
    check('mensagem').notEmpty().withMessage('Mensagem é obrigatória'),
    check('idusuario').isInt({ min: 1 }).withMessage('ID do usuário inválido'),
    checkValidationErrors
  ],

  // Validação genérica de ID
  validateId: [
    check('id').isInt({ min: 1 }).withMessage('ID inválido').toInt(),
    checkValidationErrors
  ]
};

// Função helper para aplicar validação
const validate = (type) => {
  return validations[type] || [checkValidationErrors];
};

module.exports = {
  validate,
  checkValidationErrors,
  validations
};
