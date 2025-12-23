const { body, param, query, validationResult } = require('express-validator');
const { errorResponse } = require('../utils/helpers');

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const formattedErrors = errors.array().map(err => ({
            field: err.path,
            message: err.msg
        }));
        return errorResponse(res, 400, 'Error de validación', formattedErrors);
    }
    next();
};

// Validación login
const validateLogin = [
    body('username')
        .trim().notEmpty().withMessage('El usuario es requerido')
        .isLength({ min: 3, max: 50 }).withMessage('El usuario debe tener entre 3 y 50 caracteres')
        .matches(/^[a-zA-Z0-9_]+$/).withMessage('Solo letras, números y guiones bajos'),
    body('password')
        .notEmpty().withMessage('La contraseña es requerida')
        .isLength({ min: 6 }).withMessage('Debe tener al menos 6 caracteres'),
    handleValidationErrors
];

// Validación crear usuario
const validateCreateUser = [
    body('username').trim().notEmpty().withMessage('Usuario requerido').isLength({ min: 3, max: 50 }),
    body('email').trim().notEmpty().withMessage('Email requerido').isEmail().normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Contraseña requerida')
        .isLength({ min: 8 }).withMessage('Mínimo 8 caracteres')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
        .withMessage('Debe incluir mayúsculas, minúsculas, números y caracteres especiales'),
    body('nombre_completo').trim().notEmpty().withMessage('Nombre completo requerido').isLength({ min: 2, max: 150 }),
    body('area_id').notEmpty().withMessage('Área requerida').isInt({ min: 1 }),
    body('rol_id').optional().isInt({ min: 1 }),
    handleValidationErrors
];

// Validación actualizar usuario
const validateUpdateUser = [
    param('id').isInt({ min: 1 }).withMessage('ID inválido'),
    body('username').optional().trim().isLength({ min: 3, max: 50 }).matches(/^[a-zA-Z0-9_]+$/),
    body('email').optional().trim().isEmail().normalizeEmail(),
    body('password').optional()
        .isLength({ min: 8 })
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/),
    body('nombre_completo').optional().trim().isLength({ min: 2, max: 150 }),
    body('area_id').optional().isInt({ min: 1 }),
    body('rol_id').optional().isInt({ min: 1 }),
    body('activo').optional().isBoolean(),
    handleValidationErrors
];

// Validación paginación
const validatePagination = [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    handleValidationErrors
];

module.exports = { validateLogin, validateCreateUser, validateUpdateUser, validatePagination, handleValidationErrors };
