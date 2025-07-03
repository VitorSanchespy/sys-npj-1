const { check, validationResult } = require('express-validator');

const validate = (method) => {
  switch(method) {
    case 'registrarUsuario':
      return [
        check('nome').notEmpty().isString().trim(),
        check('email').isEmail().normalizeEmail(),
        check('senha').isLength({ min: 6 }),
        check('role_id').isInt({ min: 1 })
      ];
    case 'loginUsuario':
      return [
        check('email').isEmail().normalizeEmail(),
        check('senha').notEmpty()
      ];
    case 'getUsuario':
      return [
        check('id').isInt({ min: 1 }).toInt()
      ];
    case 'updateUsuario':
      return [
        check('id').isInt({ min: 1 }).toInt(),
        check('nome').optional().isString().trim(),
        check('email').optional().isEmail().normalizeEmail(),
        check('role_id').optional().isInt({ min: 1 })
      ];
    default:
      return [];
  }
};

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = { validate, handleValidation };