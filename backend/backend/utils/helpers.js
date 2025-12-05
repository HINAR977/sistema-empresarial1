/**
 * Funciones de utilidad
 */
const crypto = require('crypto');

/**
 * Genera un token aleatorio seguro
 */
const generateSecureToken = (length = 32) => {
    return crypto.randomBytes(length).toString('hex');
};

/**
 * Sanitiza entrada de texto
 */
const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    return input.trim().replace(/[<>]/g, '');
};

/**
 * Formatea respuesta de error
 */
const errorResponse = (res, statusCode, message, errors = null) => {
    const response = {
        success: false,
        message,
        timestamp: new Date().toISOString()
    };
    if (errors) response.errors = errors;
    return res.status(statusCode).json(response);
};

/**
 * Formatea respuesta exitosa
 */
const successResponse = (res, statusCode, message, data = null) => {
    const response = {
        success: true,
        message,
        timestamp: new Date().toISOString()
    };
    if (data) response.data = data;
    return res.status(statusCode).json(response);
};

module.exports = {
    generateSecureToken,
    sanitizeInput,
    errorResponse,
    successResponse
};