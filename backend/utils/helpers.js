/**
 * Respuesta exitosa
 */
const successResponse = (res, data = {}, message = 'Operación exitosa', status = 200) => {
    return res.status(status).json({ success: true, message, data });
};

/**
 * Respuesta de error
 */
const errorResponse = (res, status = 500, message = 'Error interno', errors = null) => {
    return res.status(status).json({ success: false, message, errors });
};

module.exports = { successResponse, errorResponse };

