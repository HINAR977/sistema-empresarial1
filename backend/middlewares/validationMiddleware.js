/**
 * Middlewares de validación con express-validator
 */
const { body, param, query, validationResult } = require('express-validator');
const { errorResponse } = require('../utils/helpers');

/**
 * Procesar errores de validación
 */
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

/**
 * Validaciones para login
 */
const validateLogin = [
    body('username')
        .trim()
        .notEmpty().withMessage('El usuario es requerido')
        .isLength({ min: 3, max: 50 }).withMessage('El usuario debe tener entre 3 y 50 caracteres')
        .matches(/^[a-zA-Z0-9_]+$/).withMessage('El usuario solo puede contener letras, números y guiones bajos'),
    
    body('password')
        .notEmpty().withMessage('La contraseña es requerida')
        .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    
    handleValidationErrors
];

/**
 * Validaciones para crear usuario
 */
const validateCreateUser = [
    body('username')
        .trim()
        .notEmpty().withMessage('El usuario es requerido')
        .isLength({ min: 3, max: 50 }).withMessage('El usuario debe tener entre 3 y 50 caracteres')
        .matches(/^[a-zA-Z0-9_]+$/).withMessage('El usuario solo puede contener letras, números y guiones bajos'),
    
    body('email')
        .trim()
        .notEmpty().withMessage('El email es requerido')
        .isEmail().withMessage('Email inválido')
        .normalizeEmail(),
    
    body('password')
        .notEmpty().withMessage('La contraseña es requerida')
        .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('La contraseña debe contener mayúsculas, minúsculas, números y caracteres especiales'),
    
    body('nombre_completo')
        .trim()
        .notEmpty().withMessage('El nombre completo es requerido')
        .isLength({ min: 2, max: 150 }).withMessage('El nombre debe tener entre 2 y 150 caracteres')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage('El nombre solo puede contener letras'),
    
    body('area_id')
        .notEmpty().withMessage('El área es requerida')
        .isInt({ min: 1 }).withMessage('Área inválida'),
    
    body('rol_id')
        .optional()
        .isInt({ min: 1 }).withMessage('Rol inválido'),
    
    handleValidationErrors
];

/**
 * Validaciones para actualizar usuario
 */
const validateUpdateUser = [
    param('id')
        .isInt({ min: 1 }).withMessage('ID de usuario inválido'),
    
    body('username')
        .optional()
        .trim()
        .isLength({ min: 3, max: 50 }).withMessage('El usuario debe tener entre 3 y 50 caracteres')
        .matches(/^[a-zA-Z0-9_]+$/).withMessage('El usuario solo puede contener letras, números y guiones bajos'),
    
    body('email')
        .optional()
        .trim()
        .isEmail().withMessage('Email inválido')
        .normalizeEmail(),
    
    body('password')
        .optional()
        .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('La contraseña debe contener mayúsculas, minúsculas, números y caracteres especiales'),
    
    body('nombre_completo')
        .optional()
        .trim()
        .isLength({ min: 2, max: 150 }).withMessage('El nombre debe tener entre 2 y 150 caracteres'),
    
    body('area_id')
        .optional()
        .isInt({ min: 1 }).withMessage('Área inválida'),
    
    body('activo')
        .optional()
        .isBoolean().withMessage('El campo activo debe ser verdadero o falso'),
    
    handleValidationErrors
];

/**
 * Validación de paginación
 */
const validatePagination = [
    query('page')
        .optional()
        .isInt({ min: 1 }).withMessage('Página inválida'),
    
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('Límite debe ser entre 1 y 100'),
    
    handleValidationErrors
];

module.exports = {
    validateLogin,
    validateCreateUser,
    validateUpdateUser,
    validatePagination,
    handleValidationErrors
};