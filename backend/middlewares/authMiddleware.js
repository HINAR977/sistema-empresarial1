/**
 * Middlewares de autenticación y autorización
 */
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');
const { errorResponse } = require('../utils/helpers');

/**
 * Verificar token JWT
 */
const verifyToken = async (req, res, next) => {
    try {
        // Obtener token del header
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return errorResponse(res, 401, 'Token de acceso no proporcionado');
        }

        const token = authHeader.split(' '),[object Object],;

        // Verificar token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Verificar que el usuario existe y está activo
        const user = await UserModel.findById(decoded.userId);
        
        if (!user) {
            return errorResponse(res, 401, 'Usuario no encontrado');
        }

        if (!user.activo) {
            return errorResponse(res, 401, 'Usuario desactivado');
        }

        // Agregar usuario al request
        req.user = {
            id: user.id,
            username: user.username,
            email: user.email,
            rol: user.rol_nombre,
            permisos: user.permisos ? JSON.parse(user.permisos) : {},
            area_id: user.area_id
        };

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return errorResponse(res, 401, 'Token expirado');
        }
        if (error.name === 'JsonWebTokenError') {
            return errorResponse(res, 401, 'Token inválido');
        }
        return errorResponse(res, 500, 'Error al verificar token');
    }
};

/**
 * Verificar rol específico
 */
const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return errorResponse(res, 401, 'No autenticado');
        }

        if (!roles.includes(req.user.rol)) {
            return errorResponse(res, 403, 'No tienes permisos para realizar esta acción');
        }

        next();
    };
};

/**
 * Verificar permiso específico
 */
const requirePermission = (resource, action) => {
    return (req, res, next) => {
        if (!req.user) {
            return errorResponse(res, 401, 'No autenticado');
        }

        const permisos = req.user.permisos;
        
        if (!permisos[resource] || !permisos[resource].includes(action)) {
            return errorResponse(res, 403, `No tienes permiso para ${action} en ${resource}`);
        }

        next();
    };
};

/**
 * Rate limiting por usuario
 */
const userRateLimit = new Map();

const rateLimitByUser = (maxRequests = 100, windowMs = 60000) => {
    return (req, res, next) => {
        const userId = req.user?.id || req.ip;
        const now = Date.now();
        
        if (!userRateLimit.has(userId)) {
            userRateLimit.set(userId, { count: 1, resetTime: now + windowMs });
            return next();
        }

        const userData = userRateLimit.get(userId);

        if (now > userData.resetTime) {
            userRateLimit.set(userId, { count: 1, resetTime: now + windowMs });
            return next();
        }

        if (userData.count >= maxRequests) {
            return errorResponse(res, 429, 'Demasiadas solicitudes, intenta más tarde');
        }

        userData.count++;
        next();
    };
};

module.exports = {
    verifyToken,
    requireRole,
    requirePermission,
    rateLimitByUser
};