/**
 * Controlador de Autenticación
 */
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');
const { successResponse, errorResponse, generateSecureToken } = require('../utils/helpers');

class AuthController {
    /**
     * Login de usuario
     */
    static async login(req, res) {
        try {
            const { username, password } = req.body;
            const ipAddress = req.ip || req.connection.remoteAddress;
            const userAgent = req.headers['user-agent'];

            // Buscar usuario
            const user = await UserModel.findByUsername(username);

            if (!user) {
                // Log de intento fallido
                await UserModel.logAudit(null, 'LOGIN_FALLIDO', 'usuarios', null, 
                    null, { username, razon: 'Usuario no encontrado' }, ipAddress, userAgent);
                return errorResponse(res, 401, 'Credenciales inválidas');
            }

            // Verificar si está bloqueado
            const blockedUntil = await UserModel.isLocked(user.id);
            if (blockedUntil) {
                return errorResponse(res, 423, `Cuenta bloqueada hasta ${blockedUntil.toLocaleString()}`);
            }

            // Verificar si está activo
            if (!user.activo) {
                return errorResponse(res, 401, 'Usuario desactivado');
            }

            // Verificar contraseña
            const isValidPassword = await UserModel.verifyPassword(password, user.password_hash);

            if (!isValidPassword) {
                await UserModel.incrementFailedAttempts(user.id);
                await UserModel.logAudit(user.id, 'LOGIN_FALLIDO', 'usuarios', user.id,
                    null, { razon: 'Contraseña incorrecta' }, ipAddress, userAgent);
                return errorResponse(res, 401, 'Credenciales inválidas');
            }

            // Generar tokens
            const accessToken = jwt.sign(
                { 
                    userId: user.id, 
                    username: user.username,
                    rol: user.rol_nombre 
                },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
            );

            const refreshToken = jwt.sign(
                { userId: user.id, tokenId: generateSecureToken(16) },
                process.env.JWT_REFRESH_SECRET,
                { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
            );

            // Guardar refresh token en BD
            const refreshDays = parseInt(process.env.JWT_REFRESH_EXPIRES_IN) || 7;
            await UserModel.saveRefreshToken(user.id, refreshToken, userAgent, ipAddress, refreshDays);

            // Actualizar último login
            await UserModel.updateLastLogin(user.id);

            // Log de login exitoso
            await UserModel.logAudit(user.id, 'LOGIN_EXITOSO', 'usuarios', user.id,
                null, null, ipAddress, userAgent);

            // Configurar cookie httpOnly para refresh token
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: refreshDays * 24 * 60 * 60 * 1000
            });

            return successResponse(res, 200, 'Login exitoso', {
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    nombre_completo: user.nombre_completo,
                    area: user.area_nombre,
                    rol: user.rol_nombre,
                    permisos: user.permisos ? JSON.parse(user.permisos) : {}
                },
                accessToken,
                expiresIn: process.env.JWT_EXPIRES_IN || '15m'
            });

        } catch (error) {
            console.error('Error en login:', error);
            return errorResponse(res, 500, 'Error interno del servidor');
        }
    }

    /**
     * Refresh token
     */
    static async refreshToken(req, res) {
        try {
            const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

            if (!refreshToken) {
                return errorResponse(res, 401, 'Refresh token no proporcionado');
            }

            // Verificar token en BD
            const session = await UserModel.verifyRefreshToken(refreshToken);

            if (!session) {
                return errorResponse(res, 401, 'Refresh token inválido o expirado');
            }

            // Verificar JWT
            let decoded;
            try {
                decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
            } catch (error) {
                await UserModel.revokeRefreshToken(refreshToken);
                return errorResponse(res, 401, 'Refresh token inválido');
            }

            // Obtener usuario actualizado
            const user = await UserModel.findById(decoded.userId);

            if (!user || !user.activo) {
                return errorResponse(res, 401, 'Usuario no válido');
            }

            // Generar nuevo access token
            const accessToken = jwt.sign(
                { 
                    userId: user.id, 
                    username: user.username,
                    rol: user.rol_nombre 
                },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
            );

            return successResponse(res, 200, 'Token renovado', {
                accessToken,
                expiresIn: process.env.JWT_EXPIRES_IN || '15m'
            });

        } catch (error) {
            console.error('Error en refresh token:', error);
            return errorResponse(res, 500, 'Error interno del servidor');
        }
    }

    /**
     * Logout
     */
    static async logout(req, res) {
        try {
            const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
            const ipAddress = req.ip;
            const userAgent = req.headers['user-agent'];

            if (refreshToken) {
                await UserModel.revokeRefreshToken(refreshToken);
            }

            // Log de logout
            if (req.user) {
                await UserModel.logAudit(req.user.id, 'LOGOUT', 'usuarios', req.user.id,
                    null, null, ipAddress, userAgent);
            }

            // Limpiar cookie
            res.clearCookie('refreshToken');

            return successResponse(res, 200, 'Sesión cerrada correctamente');

        } catch (error) {
            console.error('Error en logout:', error);
            return errorResponse(res, 500, 'Error interno del servidor');
        }
    }

    /**
     * Logout de todas las sesiones
     */
    static async logoutAll(req, res) {
        try {
            await UserModel.revokeAllUserTokens(req.user.id);

            res.clearCookie('refreshToken');

            return successResponse(res, 200, 'Todas las sesiones han sido cerradas');

        } catch (error) {
            console.error('Error en logout all:', error);
            return errorResponse(res, 500, 'Error interno del servidor');
        }
    }

    /**
     * Obtener perfil del usuario actual
     */
    static async getProfile(req, res) {
        try {
            const user = await UserModel.findById(req.user.id);

            if (!user) {
                return errorResponse(res, 404, 'Usuario no encontrado');
            }

            return successResponse(res, 200, 'Perfil obtenido', {
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    nombre_completo: user.nombre_completo,
                    area: user.area_nombre,
                    rol: user.rol_nombre,
                    permisos: user.permisos ? JSON.parse(user.permisos) : {},
                    created_at: user.created_at
                }
            });

        } catch (error) {
            console.error('Error al obtener perfil:', error);
            return errorResponse(res, 500, 'Error interno del servidor');
        }
    }
}

module.exports = AuthController;